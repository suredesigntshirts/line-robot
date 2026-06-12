/**
 * D-S1-7: declarative chaos profile — weighted toggles applied deterministically
 * (seeded RNG) over a ground-truth listing spec. Serialisable into eval-case
 * metadata so a failing case names exactly which chaos produced it.
 */
export interface ChaosProfile {
  seed: number;
  /** 0..1 — probability per message of a Thai-style typo/transposition. */
  typoRate: number;
  /** ล้าน / ตร.ว. / นน. style abbreviations instead of full words/numbers. */
  thaiAbbreviations: boolean;
  /** Photos posted in shuffled order relative to their property mentions. */
  photosOutOfOrder: boolean;
  /** 0..1 — fraction of expected photos never posted. */
  photosMissingRate: number;
  /** A later message corrects the price ("แก้ไข ราคา 4.2 ล้านครับ"). */
  midThreadCorrection: boolean;
  /** Re-post of the same property later with small drift (dedup trap). */
  duplicateRepost: {
    enabled: boolean;
    /** e.g. 0.05 → re-post price differs by up to ±5%. */
    priceDriftPct: number;
    /** Re-post uses a different phone formatting / contact line. */
    contactDrift: boolean;
  };
  /** Language of the generated messages. */
  languageMix: "th" | "en" | "mixed";
  /** Inject urgency phrases (ขายด่วน!) for urgency=quick_sale specs. */
  urgencyPhrases: boolean;
}

export const CALM: ChaosProfile = {
  seed: 1,
  typoRate: 0,
  thaiAbbreviations: false,
  photosOutOfOrder: false,
  photosMissingRate: 0,
  midThreadCorrection: false,
  duplicateRepost: { enabled: false, priceDriftPct: 0, contactDrift: false },
  languageMix: "th",
  urgencyPhrases: false,
};

export const MESSY_GROUP_CHAT: ChaosProfile = {
  seed: 42,
  typoRate: 0.15,
  thaiAbbreviations: true,
  photosOutOfOrder: true,
  photosMissingRate: 0.2,
  midThreadCorrection: true,
  duplicateRepost: { enabled: true, priceDriftPct: 0.05, contactDrift: true },
  languageMix: "mixed",
  urgencyPhrases: true,
};
