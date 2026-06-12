/**
 * Thai catalog — the DEFAULT locale (DF-3). Keys are the schema; en.ts must
 * satisfy `typeof th`. Buttons are bare verbs (COPY-02). `{var}` is the only
 * interpolation form. Thai strings run ~20% wider than English (COPY-03) —
 * layout primitives budget for the THAI string, not the English one.
 */
export const th = {
  // Listing card / detail (CONV-04/05, COPY-04/06)
  "listing.priceAsking": "ราคาเสนอขาย",
  "listing.priceMonthly": "ค่าเช่า/เดือน",
  "listing.negotiable": "ต่อรองได้",
  "listing.pricePerWah": "บาท/ตร.ว.",
  "listing.pricePerSqm": "บาท/ตร.ม.",
  "listing.photos": "{count} รูป",
  "listing.updated": "อัปเดต {date}",
  "listing.postedBy": "ลงประกาศโดย {name}",
  "listing.deedSection": "เอกสารสิทธิ์",
  "listing.landArea": "เนื้อที่",
  "listing.floorArea": "พื้นที่ใช้สอย",
  "listing.bedrooms": "{count} นอน",
  "listing.bathrooms": "{count} น้ำ",

  // Badges (COPY-04/05/10, DIST-01, TH-04)
  "badge.available": "พร้อมขาย",
  "badge.reserved": "ติดจอง",
  "badge.urgent": "ขายด่วน",
  "badge.verified": "ยืนยันตัวตนแล้ว",
  "badge.ownerDirect": "เจ้าของขายเอง",
  "badge.npa": "ทรัพย์ NPA",
  "badge.deedUnverified": "ยังไม่ยืนยันโฉนด",
  "badge.forRent": "ให้เช่า",
  "badge.forSale": "ขาย",

  // CTAs (CONV-06/09 — LINE first, phone secondary; bare verbs COPY-02)
  "cta.chatLine": "แชทผ่าน LINE",
  "cta.call": "โทร",

  // Search & filters (COMP-05/06)
  "filter.all": "ทั้งหมด",
  "filter.newVsResale": "มือหนึ่ง/มือสอง",
  "filter.npa": "ทรัพย์ธนาคาร",
  "filter.petFriendly": "เลี้ยงสัตว์ได้",
  "filter.deedType": "ประเภทโฉนด",
  "filter.priceRange": "ช่วงราคา",
  "filter.clear": "ล้างตัวกรอง",

  // Empty / error states (COPY-07: what + why + next)
  "empty.title": "ไม่พบประกาศ",
  "empty.why": "ยังไม่มีประกาศที่ตรงกับตัวกรองของคุณ",
  "empty.next": "ลองล้างตัวกรองหรือขยายช่วงราคา",
  "error.title": "โหลดข้อมูลไม่สำเร็จ",
  "error.why": "การเชื่อมต่อขัดข้องชั่วคราว",
  "error.retry": "ลองใหม่",

  // Public website (Stage 4)
  "home.title": "ประกาศอสังหาริมทรัพย์",
  "home.description": "ค้นหาบ้าน ที่ดิน คอนโด จากเจ้าของโดยตรง",
  "home.preparing": "กำลังเตรียมรายการประกาศ",
} as const;

export type MessageKey = keyof typeof th;
