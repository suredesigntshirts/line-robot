/**
 * The property-extraction seam: one structured-output call that turns a batch of chat messages
 * (plus photos / title-deed scans and any geo hints) into property records, resolving
 * update-existing vs create-new against the conversation's own candidates. Provider-agnostic so the
 * sweep can be unit-tested with a fake; the Anthropic implementation lives in
 * {@link ../../adapters/anthropic/claudeExtractor}.
 */

import type { Chanote, PhotoKind } from "../domain/catalog.js";

/** An image or document for the model to read (listing photos, chanote scans). */
export interface ExtractionMedia {
  /** Base64-encoded bytes. */
  readonly base64: string;
  /** MIME type, e.g. `image/jpeg` or `application/pdf`. */
  readonly mediaType: string;
}

/** The result of classifying ONE image/document (plan 13, per-image pass). Property photos return
 * just `kind`; chanote/title-deed images return the structured `chanote`; other documents
 * (contracts, message screenshots) return `ocrText` so the property extractor can read it. */
export interface ImageClassification {
  readonly kind: PhotoKind;
  /** A short free-text subtype of this image, e.g. "external - front", "kitchen", "chanote - back",
   * "chat log". Best-effort metadata; omitted when nothing useful. */
  readonly label?: string;
  /** Present (best-effort) when the image is a title deed. */
  readonly chanote?: Chanote;
  /** Freeform text read off a document/screenshot, fed into the text extraction. */
  readonly ocrText?: string;
}

/** Classifies + OCRs a single image/document. Provider-agnostic; the Anthropic implementation is one
 * small structured-output vision call per image. Returns `null` on unparseable output (the caller
 * then stores the image as a plain `property` photo). */
export interface ImageClassifier {
  classifyImage(media: ExtractionMedia): Promise<ImageClassification | null>;
}

/** A coordinate pair mined from a Google-Maps link in the text, passed so the model can attach it
 * to the property it describes. */
export interface ExtractionGeoHint {
  readonly lat: number;
  readonly long: number;
}

/** An existing property in this conversation, offered as a dedup candidate so the model decides
 * update-existing vs create-new itself (write-scope is per conversation). */
export interface ExtractionCandidate {
  readonly propertyId: string;
  readonly normalizedAddress?: string;
  readonly projectName?: string;
  readonly lat?: number;
  readonly long?: number;
}

export interface ExtractionRequest {
  readonly conversationKey: string;
  /** Concatenated text of the batched messages. */
  readonly text: string;
  readonly media: readonly ExtractionMedia[];
  readonly geoHints: readonly ExtractionGeoHint[];
  readonly candidates: readonly ExtractionCandidate[];
  /** The conversation's durable memory note (known people, area aliases, terminology), if any.
   * Injected into the cached prefix so the model can resolve references and aliases. */
  readonly memory?: string;
  /** Two-pass extraction (plan 13 inc 6): when set, extract ONLY the property described by this label
   * (from a prior segmentation pass) and emit exactly one entry for it — so each property in a
   * multi-property batch gets its own focused call instead of being diluted in one. */
  readonly focus?: string;
}

/**
 * One property the model extracted. `existingPropertyId` non-empty → merge into that property;
 * `""` → create a new one. `ambiguous` flags an uncertain match: the sweep creates-new and notes
 * it. To stay under Anthropic's 16-nullable-parameter limit (see
 * {@link ../../adapters/anthropic/CLAUDE.md}) absent values are modelled with sentinels — `""` for
 * text and `[]` for lists — and `null` ONLY for the numeric fields (which have no clean sentinel).
 */
export interface ExtractedProperty {
  /** `""` → create-new; otherwise the existing property id to update. */
  readonly existingPropertyId: string;
  readonly ambiguous: boolean;
  /** When `ambiguous`, the candidate property id(s) this might be the same as (a subset of the
   * provided candidates), so the merge confirmation can offer exactly those rather than every
   * listing. Empty `[]` → the sweep falls back to offering all candidates. */
  readonly ambiguousWith: readonly string[];
  readonly normalizedAddress: string;
  readonly rawAddress: string;
  readonly projectName: string;
  readonly lat: number | null;
  readonly long: number | null;
  readonly district: string;
  readonly subdistrict: string;
  readonly province: string;
  readonly propertyType: string;
  readonly status: string;
  readonly askingPrice: number | null;
  readonly currency: string;
  readonly tags: readonly string[];
  // Physical / commercial detail ("" / [] / null when not stated).
  readonly bedrooms: number | null;
  readonly bathrooms: number | null;
  readonly usableAreaSqm: number | null;
  readonly landArea: string;
  readonly floors: number | null;
  readonly furnishing: string;
  readonly notes: string;
  readonly listingType: string;
  readonly rentPrice: number | null;
  readonly contact: string;
  readonly source: string;
}

export interface ExtractionResult {
  readonly properties: readonly ExtractedProperty[];
  /** A full updated memory note the model proposes for this conversation (durable context only), or
   * null when nothing changed. The sweep bounds the length and replaces the stored note. */
  readonly memoryUpdate?: string | null;
  /** The stronger model that produced this result if the cheap primary escalated (low confidence),
   * else undefined — surfaced so the sweep can log the escalation rate to watch cost. */
  readonly escalatedTo?: string;
}

export interface PropertyExtractor {
  /** Run one extraction over the batch. Returns `null` when the model produced no parseable output
   * (the sweep then applies nothing for this run). With `request.focus` set, returns the single
   * focused property. */
  extract(request: ExtractionRequest): Promise<ExtractionResult | null>;
}

/** One distinct property found in a batch by the segmentation pass (plan 13 inc 6). It carries the
 * identity decision + which images/map-link belong to it (by index into the marked transcript), so
 * the sweep can attribute each property's own photos/chanote/map even in a multi-property batch. */
export interface PropertySegment {
  /** A short human anchor for the property (e.g. "Mooban Wangtan"); also used as `focus` in pass 2. */
  readonly label: string;
  /** `""` → create-new; otherwise the existing property id to update. */
  readonly existingPropertyId: string;
  readonly ambiguous: boolean;
  readonly ambiguousWith: readonly string[];
  /** Indices of the `[IMG n]` markers in the transcript that belong to this property. */
  readonly imageIndices: readonly number[];
  /** Index of the `[MAP n]` marker that belongs to this property, or -1 for none. */
  readonly mapIndex: number;
}

export interface SegmentationResult {
  readonly segments: readonly PropertySegment[];
  /** A durable memory note proposed from the whole batch (the per-property passes don't propose it). */
  readonly memoryUpdate?: string | null;
}

/** Pass 1 of two-pass extraction: split a batch into distinct properties + attribute their media,
 * without filling fields. Returns `null` on unparseable output (the sweep falls back to one call). */
export interface PropertySegmenter {
  segment(request: ExtractionRequest): Promise<SegmentationResult | null>;
}
