import type { Chanote, PropertyPhoto } from "../core/domain/catalog.js";
import { formatShortDateTime } from "../core/domain/datetime.js";
import { parseMapUrls } from "../core/domain/geo.js";
import type { StoredMessage } from "../core/domain/message.js";
import type {
  ExtractedProperty,
  ImageClassifier,
  PropertySegment,
} from "../core/ports/extraction.js";
import type { MediaReader } from "../core/ports/mediaReader.js";
import type { Logger } from "../core/ports/runtime.js";
import { mapWithConcurrency } from "../core/utils/concurrency.js";

/** Backstop on images classified per conversation per run (one cheap vision call each). High enough
 * to cover real listings (we never know which images are documents until we look). */
export const DEFAULT_MAX_CLASSIFY = 30;
/** Image classification runs as independent vision calls — done concurrently (bounded) so a large
 * batch (20+ photos) doesn't serialise past the sweep's Lambda timeout. Each Haiku call is cheap;
 * a small pool stays well under Anthropic concurrency limits while cutting wall-clock ~Nx. */
const CLASSIFY_CONCURRENCY = 6;
/** Property photos kept per batch — documents (chanote/other) are uncapped. */
export const DEFAULT_MAX_PROPERTY_PHOTOS = 12;

const MEDIA_CONTENT_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

/** One classified attachment from a batch: its S3 key, content-type, and the model's verdict
 * (null when classification failed → treated as a plain property photo). */
export interface ClassifiedMedia {
  readonly s3Key: string;
  readonly contentType: string;
  readonly kind: PropertyPhoto["kind"];
  readonly label?: string;
  readonly chanote?: Chanote;
  readonly ocrText?: string;
}

/** Dependencies for the per-image classify pass (the sweep threads its own ports + cap here). */
export interface ClassifyMediaDeps {
  readonly batch: readonly StoredMessage[];
  readonly media: MediaReader;
  readonly classifier: ImageClassifier;
  readonly logger: Logger;
  readonly maxClassify: number;
}

/** Merge title-deed reads across a chanote's pages (front carries the parcel fields, the back the
 * encumbrances) — prefer the first non-empty value per field; union the encumbrances. */
export function mergeChanote(a: Chanote, b: Chanote): Chanote {
  const pick = (x?: string, y?: string): string | undefined => x ?? y;
  const notes = [a.confidenceNote, b.confidenceNote].filter((n): n is string => n !== undefined);
  return {
    titleType: pick(a.titleType, b.titleType),
    deedNumber: pick(a.deedNumber, b.deedNumber),
    landNumber: pick(a.landNumber, b.landNumber),
    surveyPage: pick(a.surveyPage, b.surveyPage),
    mapSheet: pick(a.mapSheet, b.mapSheet),
    landOffice: pick(a.landOffice, b.landOffice),
    province: pick(a.province, b.province),
    district: pick(a.district, b.district),
    subdistrict: pick(a.subdistrict, b.subdistrict),
    landArea: pick(a.landArea, b.landArea),
    ownerName: pick(a.ownerName, b.ownerName),
    encumbrances:
      [...(a.encumbrances ?? []), ...(b.encumbrances ?? [])].length > 0
        ? [...new Set([...(a.encumbrances ?? []), ...(b.encumbrances ?? [])])]
        : undefined,
    confidenceNote: notes.length > 0 ? notes.join(" ") : undefined,
  };
}

/** A blank extracted property (all sentinels) — used when a focused pass-2 extract returns nothing
 * but the segment still warrants a record (so its photos/map/chanote aren't lost). */
export function emptyExtracted(): ExtractedProperty {
  return {
    existingPropertyId: "",
    ambiguous: false,
    ambiguousWith: [],
    normalizedAddress: "",
    rawAddress: "",
    projectName: "",
    lat: null,
    long: null,
    district: "",
    subdistrict: "",
    province: "",
    propertyType: "",
    status: "",
    askingPrice: null,
    currency: "",
    tags: [],
    bedrooms: null,
    bathrooms: null,
    usableAreaSqm: null,
    landArea: "",
    floors: null,
    furnishing: "",
    notes: "",
    listingType: "",
    rentPrice: null,
    contact: "",
    source: "",
  };
}

/** Combine a segment's identity decision (pass 1) with the focused field extraction (pass 2). The
 * segment owns create-vs-update + ambiguity; the focused extract owns the fields. If pass 2 produced
 * nothing, keep the segment label as a project name so the listing isn't nameless. */
export function mergeSegment(
  segment: PropertySegment,
  fields?: ExtractedProperty,
): ExtractedProperty {
  const base = fields ?? emptyExtracted();
  const projectName =
    base.projectName !== "" ? base.projectName : fields === undefined ? segment.label : "";
  return {
    ...base,
    projectName,
    existingPropertyId: segment.existingPropertyId,
    ambiguous: segment.ambiguous,
    ambiguousWith: segment.ambiguousWith,
  };
}

/** Build the single timestamped transcript both passes read. Each line is `[<Bangkok date+time>]`
 * followed by the message text (with map links rewritten to `[MAP n]`) or an image marker
 * `[IMG n] <kind> - <label> ocr: <text>`. The timestamps (second resolution) expose burst/gap
 * structure for segmentation; the indexed markers let the segmenter attribute media per property. */
export function buildTranscript(
  batch: readonly StoredMessage[],
  classified: readonly ClassifiedMedia[],
): { transcript: string; mapLinks: string[] } {
  const indexByKey = new Map(classified.map((c, i) => [c.s3Key, i]));
  const ordered = [...batch].sort((a, b) => a.timestamp - b.timestamp);
  const mapLinks: string[] = [];
  const lines: string[] = [];
  for (const m of ordered) {
    const stamp = `[${formatShortDateTime(m.timestamp)}]`;
    const attachKey = m.attachment?.s3Key;
    if (attachKey !== undefined && indexByKey.has(attachKey)) {
      const i = indexByKey.get(attachKey) as number;
      const c = classified[i] as ClassifiedMedia;
      const label = c.label !== undefined ? ` - ${c.label}` : "";
      const ocr = c.ocrText !== undefined ? ` ocr: ${c.ocrText}` : "";
      lines.push(`${stamp} [IMG ${i}] ${c.kind}${label}${ocr}`);
      continue;
    }
    const text = m.text;
    if (text !== undefined && text !== "") {
      let rewritten = text;
      for (const url of parseMapUrls(text)) {
        let idx = mapLinks.indexOf(url);
        if (idx === -1) {
          idx = mapLinks.length;
          mapLinks.push(url);
        }
        rewritten = rewritten.split(url).join(`[MAP ${idx}]`);
      }
      lines.push(`${stamp} ${rewritten}`);
    }
  }
  return { transcript: lines.join("\n"), mapLinks };
}

/** Classify (+ OCR documents) every media attachment in the batch, one vision call each, capped at
 * the classify backstop. A missing/unreadable object or a failed classify falls back to a plain
 * `property` photo (logged) rather than failing the whole conversation. (Was IngestionSweep.classifyMedia;
 * now takes deps explicitly.) */
export async function classifyMedia(deps: ClassifyMediaDeps): Promise<ClassifiedMedia[]> {
  const { batch, media, classifier, logger, maxClassify } = deps;
  const withAttachment = batch.filter(
    (m) => m.attachment !== undefined && MEDIA_CONTENT_TYPES.has(m.attachment.contentType),
  );
  if (withAttachment.length > maxClassify) {
    logger.info("ingestion sweep: capping media", {
      available: withAttachment.length,
      cap: maxClassify,
    });
  }

  // Classify with bounded concurrency: each image is an independent vision call, so a serial loop
  // over a large batch (20+ photos) blows the sweep's Lambda timeout. Results stay positional, so
  // the [IMG n] markers + segment imageIndices remain stable (buildTranscript keys off this order).
  const settled = await mapWithConcurrency(
    withAttachment.slice(0, maxClassify),
    CLASSIFY_CONCURRENCY,
    async (message): Promise<ClassifiedMedia | null> => {
      const attachment = message.attachment;
      if (attachment === undefined) {
        return null;
      }
      let bytes: Buffer;
      try {
        bytes = await media.getMedia(attachment.s3Key);
      } catch (error) {
        logger.warn("ingestion sweep: media read failed; skipping", {
          s3Key: attachment.s3Key,
          error: String(error),
        });
        return null;
      }
      const classification = await classifier.classifyImage({
        base64: bytes.toString("base64"),
        mediaType: attachment.contentType,
      });
      return {
        s3Key: attachment.s3Key,
        contentType: attachment.contentType,
        // A failed classify defaults to a plain property photo (stored + shown, just unlabelled).
        kind: classification?.kind ?? "property",
        ...(classification?.label !== undefined ? { label: classification.label } : {}),
        ...(classification?.chanote !== undefined ? { chanote: classification.chanote } : {}),
        ...(classification?.ocrText !== undefined ? { ocrText: classification.ocrText } : {}),
      };
    },
  );
  return settled.filter((c): c is ClassifiedMedia => c !== null);
}

/** The labelled gallery images for a single set of classified media: only renderable images (PDFs
 * can't show in an image carousel), property photos capped, documents (chanote/other) uncapped.
 * (Was IngestionSweep.collectPhotos; the photo cap is now an explicit param.) */
export function collectPhotos(
  classified: readonly ClassifiedMedia[],
  maxPhotos: number,
): PropertyPhoto[] {
  const photos: PropertyPhoto[] = [];
  let propertyCount = 0;
  for (const c of classified) {
    if (!c.contentType.startsWith("image/")) {
      continue; // a chanote PDF still yields chanote data, but can't be a gallery image
    }
    if (c.kind === "property") {
      if (propertyCount >= maxPhotos) {
        continue;
      }
      propertyCount += 1;
    }
    photos.push({
      s3Key: c.s3Key,
      kind: c.kind,
      ...(c.label !== undefined ? { label: c.label } : {}),
    });
  }
  return photos;
}

/** Merge the chanote reads across all title-deed images/pages. (Was IngestionSweep.collectChanote.) */
export function collectChanote(classified: readonly ClassifiedMedia[]): Chanote | undefined {
  const chanotes = classified.flatMap((c) => (c.chanote !== undefined ? [c.chanote] : []));
  if (chanotes.length === 0) {
    return undefined;
  }
  return chanotes.reduce((acc, c) => mergeChanote(acc, c));
}
