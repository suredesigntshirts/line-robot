import type {
  ContentLang,
  DealType,
  FacingDirection,
  PropertyType,
  TitleDeedType,
  Urgency,
} from "@line-robot/domain";

// ---------------------------------------------------------------------------
// The six step contracts (master plan §4.3, spec D2.8). Each step is a pure
// function over its input plus a thin LLM port at the seam; no step imports
// another step's internals. Schemas are deliberately SMALL — the per-step
// split is what dissolves v1's 16-union cap for good.
// ---------------------------------------------------------------------------

// --- 1. classify+ocr ---------------------------------------------------------

export interface VisionImage {
  /** S3 key of the 1568px vision derivative — never the original (D2.7). */
  s3Key: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  /** Base64 data for the API call. */
  base64: string;
}

export interface ClassifyResult {
  kind: "property" | "chanote" | "other";
  /** Short content label ("front of house", "title deed"). */
  label: string;
  /** Parsed deed fields when kind=chanote and OCR succeeded. */
  chanote?: {
    deedNo: string;
    province: string;
    landRai: number | null;
    landNgan: number | null;
    landWah: number | null;
  };
  ocrText: string;
  lowConfidence: boolean;
}

// --- 2. segment ----------------------------------------------------------------

export interface SegmentInput {
  transcript: string;
  /** Photo markers in transcript order (index ↔ position in the thread). */
  mediaMarkers: Array<{ index: number; classify: ClassifyResult | null }>;
  geoHints: string[];
  /** Existing nearby/owned listings the model may attach a segment to. */
  candidates: Array<{ id: string; label: string }>;
}

export interface Segment {
  label: string;
  imageIndices: number[];
  mapIndex: number | null;
  existingPropertyId: string | null;
  ambiguous: boolean;
  ambiguousWith: string[];
}

export interface SegmentResult {
  segments: Segment[];
}

// --- 3. extract (per segment) ---------------------------------------------------

export interface ExtractInput {
  transcript: string;
  /** The segment label to focus on (multi-property dumps). */
  focus: string | null;
  geoHints: string[];
  candidates: Array<{ id: string; label: string }>;
}

/** Enum-validated extraction output (D2.8). Seller assertions map as-claimed (FIELD-11). */
export interface ExtractedListing {
  dealType: DealType;
  propertyType: PropertyType;
  titleDeedType: TitleDeedType;
  /** Sale price THB; monthly rent for rentals. */
  priceThb: number | null;
  urgency: Urgency;
  /** COPY-05: ขายด่ว-style phrases become this badge and are stripped from the title. */
  urgentBadge: boolean;
  title: string;
  description: string;
  province: string | null;
  amphoe: string | null;
  tambon: string | null;
  landmark: string | null;
  lat: number | null;
  lon: number | null;
  landRai: number | null;
  landNgan: number | null;
  landWah: number | null;
  /** Computed from the rai/ngan/wah triple (FIELD-01), not extracted. */
  landSqm: number | null;
  floorAreaSqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  facingDirection: FacingDirection | null;
  contactPhone: string | null;
  posterName: string | null;
  lowConfidence: boolean;
}

// --- 4. dedup --------------------------------------------------------------------

export interface DedupInput {
  extracted: ExtractedListing;
  /** Deterministic block output (D2.6): the ≤8 survivors sent to LLM verify. */
  blockPool: Array<{ id: string; summary: string; score: number; reasons: string[] }>;
}

export interface DedupResult {
  decision: "new" | "merge";
  intoId?: string;
  score: number;
  reasons: string[];
}

// --- 5. translate -----------------------------------------------------------------

export interface TranslateInput {
  fromLang: ContentLang;
  title: string;
  description: string;
  notes: string;
}

export interface TranslateResult {
  lang: ContentLang;
  title: string;
  description: string;
  notes: string;
}

// --- 6. gate ------------------------------------------------------------------------

export interface GateInput {
  extracted: ExtractedListing;
  photoCount: number;
  deedType: TitleDeedType;
  listingType: DealType;
}

export type { Blocker, GateResult, WeakField } from "@line-robot/domain";
