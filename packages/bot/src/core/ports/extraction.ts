/**
 * The property-extraction seam: one structured-output call that turns a batch of chat messages
 * (plus photos / title-deed scans and any geo hints) into property records, resolving
 * update-existing vs create-new against the conversation's own candidates. Provider-agnostic so the
 * sweep can be unit-tested with a fake; the Anthropic implementation lives in
 * {@link ../../adapters/anthropic/claudeExtractor}.
 */

/** An image or document for the model to read (listing photos, chanote scans). */
export interface ExtractionMedia {
  /** Base64-encoded bytes. */
  readonly base64: string;
  /** MIME type, e.g. `image/jpeg` or `application/pdf`. */
  readonly mediaType: string;
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
}

/**
 * One property the model extracted. `existingPropertyId` non-null → merge into that property;
 * null → create a new one. `ambiguous` flags an uncertain match: the sweep creates-new and notes
 * it (interactive quick-reply resolution lands with the retrieval slice). Absent fields are `null`
 * (the schema models "not mentioned" explicitly rather than as optional keys).
 */
export interface ExtractedProperty {
  readonly existingPropertyId: string | null;
  readonly ambiguous: boolean;
  readonly normalizedAddress: string | null;
  readonly rawAddress: string | null;
  readonly projectName: string | null;
  readonly lat: number | null;
  readonly long: number | null;
  readonly district: string | null;
  readonly subdistrict: string | null;
  readonly province: string | null;
  readonly propertyType: string | null;
  readonly status: string | null;
  readonly askingPrice: number | null;
  readonly currency: string | null;
  readonly tags: readonly string[] | null;
}

export interface ExtractionResult {
  readonly properties: readonly ExtractedProperty[];
}

export interface PropertyExtractor {
  /** Run one extraction over the batch. Returns `null` when the model produced no parseable output
   * (the sweep then applies nothing for this run). */
  extract(request: ExtractionRequest): Promise<ExtractionResult | null>;
}
