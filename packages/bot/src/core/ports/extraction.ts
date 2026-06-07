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
   * (the sweep then applies nothing for this run). */
  extract(request: ExtractionRequest): Promise<ExtractionResult | null>;
}
