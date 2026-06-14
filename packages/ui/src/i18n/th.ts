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
  // CONV-08 radius search: distance of a card from the search point.
  "listing.distanceKm": "ห่าง {km} กม.",
  "listing.distanceM": "ห่าง {m} ม.",
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
  // DIST-01 source labels (calm category, not danger): bank-owned vs court-auction stock.
  "badge.npa": "ทรัพย์ธนาคาร",
  "badge.auction": "ขายทอดตลาด (บังคับคดี)",
  "badge.deedUnverified": "ยังไม่ยืนยันโฉนด",
  "badge.forRent": "ให้เช่า",
  "badge.forSale": "ขาย",

  // CTAs (CONV-06/09 — LINE first, phone secondary; bare verbs COPY-02)
  "cta.chatLine": "แชทผ่าน LINE",
  "cta.call": "โทร",

  // Search & filters (COMP-05/06)
  "filter.all": "ทั้งหมด",
  "filter.newVsResale": "มือหนึ่ง/มือสอง",
  "filter.npa": "ประเภททรัพย์ (ธนาคาร/บังคับคดี)",
  "filter.petFriendly": "เลี้ยงสัตว์ได้",
  "filter.deedType": "ประเภทโฉนด",
  "filter.priceRange": "ช่วงราคา",
  "filter.clear": "ล้างตัวกรอง",
  // COMP-06 new-vs-resale chip labels + the subtle card/detail meta.
  "condition.new": "มือหนึ่ง",
  "condition.resale": "มือสอง",
  // DIST-01 provenance chip labels (the NPA filter group).
  "listingType.npa": "ทรัพย์ธนาคาร",
  "listingType.auction": "ขายทอดตลาด (บังคับคดี)",

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
  "filter.dealType": "ซื้อ/เช่า",
  "filter.province": "จังหวัด",
  "filter.search": "ค้นหา",
  "filter.searchPlaceholder": "ค้นหาทำเล โครงการ คำอธิบาย",
  "filter.propertyType": "ประเภททรัพย์",

  // CONV-08 "search near me" geolocation control + radius options + the results map (Stage 4 / 4.2).
  "near.button": "ค้นหาใกล้ฉัน",
  "near.locating": "กำลังหาตำแหน่ง…",
  "near.clear": "ล้างการค้นหาตามตำแหน่ง",
  "near.radius": "รัศมี",
  "near.radius1": "1 กม.",
  "near.radius3": "3 กม.",
  "near.radius5": "5 กม.",
  "near.radius10": "10 กม.",
  "near.active": "กำลังแสดงประกาศใกล้ตำแหน่งที่เลือก",
  // Graceful failures (COPY-07: what + why + next). The page still works without location.
  "near.denied": "ไม่ได้รับสิทธิ์เข้าถึงตำแหน่ง — เปิดสิทธิ์ตำแหน่งในเบราว์เซอร์ หรือใช้ตัวกรองด้านบนแทน",
  "near.unavailable": "เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง — ใช้ตัวกรองด้านบนแทนได้",
  "near.timeout": "หาตำแหน่งไม่สำเร็จ ลองอีกครั้ง หรือใช้ตัวกรองด้านบน",
  "map.title": "แผนที่ประกาศ",
  "map.view": "ดูประกาศ",
  "pager.prev": "ก่อนหน้า",
  "pager.next": "ถัดไป",
  "pager.count": "{total} ประกาศ",

  // Property types (FIELD-level vocabulary, used by filters + cards)
  "ptype.land": "ที่ดิน",
  "ptype.house": "บ้านเดี่ยว",
  "ptype.townhouse": "ทาวน์เฮาส์",
  "ptype.condo": "คอนโด",
  "ptype.commercial": "อาคารพาณิชย์",
  "ptype.other": "อื่นๆ",

  // Deed type display names (FIELD-02 vocabulary)
  "deed.chanote": "โฉนดที่ดิน (น.ส.4จ)",
  "deed.ns3g": "น.ส.3ก",
  "deed.ns3k": "น.ส.3ข",
  "deed.ns3": "น.ส.3",
  "deed.spk": "ส.ป.ก.",
  "deed.pbt5": "ภ.บ.ท.5",
  "deed.ns2": "น.ส.2",
  "deed.stg": "ส.ท.ก.",
  "deed.sk1": "ส.ค.1",
  "deed.other": "เอกสารสิทธิ์อื่น",
  "deed.unknown": "ไม่ระบุเอกสารสิทธิ์",
  "deed.restricted": "โอนกรรมสิทธิ์มีข้อจำกัด — ตรวจสอบก่อนวางมัดจำ",

  // Disclosure rows + compliance copy (FIELD-07, LEGAL-06, CONV-11)
  "field.flood": "ประวัติน้ำท่วม",
  "field.floodYes": "เคยมีน้ำท่วม (ผู้ขายแจ้ง)",
  "field.floodNo": "ไม่เคยมีน้ำท่วม (ผู้ขายแจ้ง)",
  "field.tenure": "ลักษณะการถือครอง",
  "field.leaseYears": "{count} ปี",
  "field.project": "โครงการ",
  "detail.description": "รายละเอียด",

  // Plot/orientation fields (4.8): facing (F-08), road access (F-10), city-plan zone (F-11).
  "field.facing": "ทิศ",
  "facing.N": "เหนือ",
  "facing.NE": "ตะวันออกเฉียงเหนือ",
  "facing.E": "ตะวันออก",
  "facing.SE": "ตะวันออกเฉียงใต้",
  "facing.S": "ใต้",
  "facing.SW": "ตะวันตกเฉียงใต้",
  "facing.W": "ตะวันตก",
  "facing.NW": "ตะวันตกเฉียงเหนือ",
  "field.road": "ถนนหน้าที่ดิน",
  "field.roadWidth": "หน้ากว้างถนน {m} เมตร",
  "road.public": "ถนนสาธารณะ",
  "road.private_easement": "ถนนภาระจำยอม",
  "road.none": "ไม่มีทางเข้าออกตามเอกสารสิทธิ์",
  "field.zone": "ผังเมือง (โซนสี)",

  // Condo-specific group (4.8 / FIELD-04/05): fees + foreign-quota.
  "detail.condoSection": "ข้อมูลคอนโด",
  "field.camFee": "ค่าส่วนกลาง",
  "field.camFeeValue": "{thb} บาท/ตร.ม./เดือน",
  "field.sinkingFund": "เงินกองทุน",
  "field.sinkingFundValue": "{thb} บาท/ตร.ม.",
  "field.foreignQuota": "โควตาต่างชาติ",
  "field.foreignQuotaPct": "{pct}% ของโครงการ",
  "field.foreignQuotaAvailable": "มีโควตาต่างชาติว่าง",
  "field.foreignQuotaFull": "โควตาต่างชาติเต็ม",
  "field.quotaBucket": "โควตาห้องชุด",
  "quota.foreign_quota": "โควตาต่างชาติ",
  "quota.thai_quota": "โควตาคนไทย",

  // Rental lease terms group (4.8 / DEAL-11 / FIELD-08/12). MKT-03: rentals frame monthly.
  "detail.rentalSection": "เงื่อนไขการเช่า",
  "field.deposit": "เงินประกัน",
  "field.advance": "ค่าเช่าล่วงหน้า",
  "field.monthsValue": "{count} เดือน",
  "field.minLease": "สัญญาเช่าขั้นต่ำ",
  "field.pets": "สัตว์เลี้ยง",
  "field.petsYes": "เลี้ยงสัตว์ได้",
  "field.petsNo": "ไม่อนุญาตให้เลี้ยงสัตว์",
  "field.furnishing": "เฟอร์นิเจอร์",
  "furnishing.fully": "ครบ",
  "furnishing.partly": "บางส่วน",
  "furnishing.unfurnished": "ไม่มีเฟอร์นิเจอร์",
  "field.utilities": "ค่าน้ำค่าไฟ",
  "utility.government": "อัตราราชการ (การไฟฟ้า/ประปา)",
  "utility.landlord_rate": "อัตราที่ผู้ให้เช่ากำหนด",
  "utility.included": "รวมในค่าเช่า",
  // DIST-01/DIST-02/P8 provenance disclosure — shown CALMLY as contextual text on the detail page
  // (a category note + honest caveats), never as a red alert banner (founder tone direction). The
  // caveats are visible (not collapsed) per DIST-02; the calm delivery is the founder's call.
  "provenance.heading": "ที่มาของทรัพย์",
  "provenance.npa": "ทรัพย์รอการขายของสถาบันการเงิน (NPA) ราคาและเงื่อนไขเป็นไปตามที่ธนาคารกำหนด",
  "provenance.auction": "ทรัพย์ขายทอดตลาดโดยกรมบังคับคดี การประมูลเป็นไปตามเงื่อนไขของกรมบังคับคดี",
  // DIST-02 mandatory caveats for LED auction listings (3 visible lines).
  "provenance.auctionAsIs": "ขายตามสภาพ ไม่รับประกันสภาพทรัพย์",
  "provenance.auctionOccupied": "อาจมีผู้อยู่อาศัยหรือผู้ครอบครองในทรัพย์",
  "provenance.auctionVerifyTitle": "ตรวจสอบกรรมสิทธิ์และภาระผูกพันก่อนเข้าประมูล",
  "legal.posterProvided": "ข้อมูลจากผู้ลงประกาศ โปรดตรวจสอบด้วยตนเองก่อนทำธุรกรรม",
  // LEGAL-07: non-dismissible foreign-ownership notice (FIELD-05). Foreigners
  // cannot own land; condos carry a 49% foreign-quota cap; leasehold is common.
  "legal.foreignOwnership":
    "ชาวต่างชาติมีข้อจำกัดในการถือครองอสังหาริมทรัพย์ในไทย (ห้ามถือครองที่ดิน คอนโดจำกัดโควตาต่างชาติ 49%) โปรดตรวจสอบสิทธิ์กับผู้เชี่ยวชาญด้านกฎหมายก่อนทำธุรกรรม",
} as const;

export type MessageKey = keyof typeof th;
