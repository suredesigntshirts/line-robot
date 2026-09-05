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
  // Detail gallery position/count chip (Stage 5). `{index}` = the active photo's 1-based position,
  // `{count}` = total photos — matches the mylistings mock pill "รูปภาพ x/N รูป".
  "gallery.count": "รูปภาพ {index}/{count} รูป",
  // Full-screen photo viewer close button (aria-label).
  "gallery.close": "ปิดรูปภาพ",

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
  "filter.rentRange": "ค่าเช่า/เดือน",
  "filter.clear": "ล้างตัวกรอง",
  // 4.3 contextual price brackets. SALE bands (asking price, listing.price_thb) from the real
  // North-Thai tiers in a2-market-landscape-north.md (tick marks ฿1M/3M/5M/10M/20M, ฿2–9M corridor,
  // ฿3–5M sweet spot). "ล้าน" = million; bare numbers read in the Thai million convention.
  "price.saleUnder1m": "ต่ำกว่า 1 ล้าน",
  "price.sale1to3m": "1–3 ล้าน",
  "price.sale3to5m": "3–5 ล้าน",
  "price.sale5to10m": "5–10 ล้าน",
  "price.sale10to20m": "10–20 ล้าน",
  "price.saleOver20m": "เกิน 20 ล้าน",
  // RENT bands (monthly rent, listing_rental.monthly_rent) from a2 Finding 11 furnished-rent tiers
  // (studio ฿7–12k, 1-bed ฿10–18k, 2-bed ฿16–35k, houses ฿20–45k/mo). Edges = published band
  // bounds ฿10k (1-bed floor) / ฿18k (1-bed ceiling) / ฿35k (2-bed ceiling).
  "price.rentUnder10k": "ต่ำกว่า 10,000",
  "price.rent10to18k": "10,000–18,000",
  "price.rent18to35k": "18,000–35,000",
  "price.rentOver35k": "เกิน 35,000",
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

  // ============================================================
  // MINI App / LIFF SPA chrome (Stage 5, D13 CRM). The authenticated owner surface (my listings /
  // saved / viewings tabs); public browse stays on the website. Shared catalog so the SPA never
  // hardcodes Thai in JSX (i18n rule). Tabs/lifecycle/states + detail section labels.
  // ============================================================
  "app.accountTitle": "บัญชีของฉัน",
  // Brand wordmark on the CRM home header (S5-5 identity chrome). "ทรัพย์ดี" = the working wordmark
  // the Stage-5 mock carries; surfaced to FOUNDER-QUEUE (no settled brand name yet — FQ-4).
  "app.wordmark": "ทรัพย์ดี",
  "tab.myListings": "ประกาศของฉัน",
  "tab.saved": "บันทึกไว้",
  "tab.viewings": "นัดดูทรัพย์",
  // My-listings section header + the photo-forward card chrome (S5-5).
  "crm.sectionListings": "ประกาศของฉัน",
  // Photo-present chip on a card with a hero photo (the slim card DTO carries no count — so this is a
  // "has photos" indicator, NOT a fabricated "N รูป"; FQ note S5-12). `📷` glyph + this label.
  "crm.hasPhotos": "มีรูป",
  // Lifecycle filter chips over the list (client-side filter). "ทั้งหมด" reuses filter.all.
  "crm.filterActive": "ประกาศอยู่",
  "crm.filterOffer": "มีผู้สนใจ",
  "crm.filterDraft": "ฉบับร่าง",
  "crm.filterClosed": "ขายแล้ว/เช่าแล้ว",
  // The search-over-own-listings pill (client-side filter by headline/location).
  "crm.searchPlaceholder": "ค้นหาประกาศของฉัน",
  "crm.searchLabel": "ค้นหาในประกาศของฉัน",
  "crm.searchClear": "ล้างการค้นหา",
  // Empty result of a filter/search over a non-empty list (distinct from the no-listings-at-all state).
  "crm.noMatchTitle": "ไม่พบประกาศที่ตรงกับตัวกรอง",
  "crm.noMatchNext": "ลองล้างตัวกรองหรือเปลี่ยนคำค้นหา",
  // Total stat tile label (5-stat strip) — reuses crm.statClosed etc; only the "active live" tile
  // splits draft+closed out. New label for the under-offer tile in the 5-stat strip.
  "crm.statOffer": "มีผู้สนใจ",
  // CRM lifecycle status badges (DF-4): paired bg+text badge tokens drive the colour.
  "crm.statusDraft": "ฉบับร่าง",
  "crm.statusActive": "ประกาศอยู่",
  "crm.statusOffer": "มีผู้สนใจ",
  "crm.statusSold": "ขายแล้ว",
  "crm.statusRented": "เช่าแล้ว",
  "crm.statusWithdrawn": "ถอนประกาศ",
  // Stats strip (summary header over the list).
  "crm.statTotal": "ทั้งหมด",
  "crm.statActive": "ประกาศอยู่",
  "crm.statDraft": "ฉบับร่าง",
  "crm.statClosed": "ปิดแล้ว",
  // My-listings empty/loading/error states (COPY-07: what + why + next).
  "crm.loading": "กำลังโหลดประกาศของคุณ…",
  "crm.emptyTitle": "ยังไม่มีประกาศ",
  "crm.emptyWhy": "ประกาศที่คุณอ้างสิทธิ์จะปรากฏที่นี่",
  "crm.emptyNext": "เปิดประกาศจากแชทเพื่ออ้างสิทธิ์เป็นเจ้าของ",
  "crm.authError": "เปิดจากภายในแอป LINE เพื่อดูประกาศของคุณ",
  "crm.notFound": "ไม่พบประกาศนี้ หรือคุณไม่มีสิทธิ์เข้าถึง",
  // Detail screen chrome + section labels.
  "detail.back": "ประกาศของฉัน",
  "detail.loading": "กำลังโหลด…",
  "detail.specSection": "รายละเอียดทรัพย์",
  "detail.location": "ทำเล",
  "detail.openInMaps": "เปิดในแผนที่",
  "field.dealType": "ประเภทประกาศ",
  "field.propertyType": "ประเภททรัพย์",
  "field.bedrooms": "ห้องนอน",
  "field.bathrooms": "ห้องน้ำ",
  "field.landmark": "จุดสังเกต",
  "field.province": "จังหวัด",
  "field.amphoe": "อำเภอ",
  "field.tambon": "ตำบล",
  // ============================================================
  // Per-user CRM (Stage 5, Build D — D13): saved / viewings / notes / owner-edit. Bare-verb CTAs
  // (COPY-02). Style matches docs/design/mockups/explore-stage5-3-viewings.html + direction-a.
  // ============================================================
  // Saved tab (GET /me/saved).
  "saved.loading": "กำลังโหลดรายการที่บันทึกไว้…",
  "saved.emptyTitle": "ยังไม่มีรายการที่บันทึก",
  "saved.emptyWhy": "ประกาศที่คุณกดบันทึกจะปรากฏที่นี่",
  "saved.emptyNext": "เปิดประกาศแล้วกดบันทึกเพื่อเก็บไว้ดูภายหลัง",
  "saved.count": "{count} รายการ",
  // Save/unsave toggle on the detail screen (optimistic).
  "save.save": "บันทึก",
  "save.saved": "บันทึกแล้ว",
  "save.toggleLabel": "บันทึกประกาศนี้",

  // Viewings tab (GET /me/viewings) — upcoming + past sections.
  "viewing.loading": "กำลังโหลดนัดดูทรัพย์…",
  "viewing.upcomingHead": "นัดดูที่กำลังจะถึง",
  "viewing.pastHead": "ดูแล้ว",
  "viewing.count": "{count} รายการ",
  "viewing.emptyTitle": "ยังไม่มีนัดดูทรัพย์",
  "viewing.emptyWhy": "นัดดูทรัพย์ที่คุณสร้างจะปรากฏที่นี่",
  "viewing.emptyNext": "เปิดประกาศแล้วกด “นัดดูทรัพย์” เพื่อสร้างนัด",
  // Viewing status pills (domain viewingStatus).
  "viewing.statusRequested": "รอยืนยัน",
  "viewing.statusConfirmed": "ยืนยันแล้ว",
  "viewing.statusDone": "ดูแล้ว",
  "viewing.statusCancelled": "ยกเลิกแล้ว",
  // Create-a-viewing (on the detail screen).
  "viewing.bookCta": "นัดดูทรัพย์",
  "viewing.bookTitle": "เลือกวันและเวลานัดดู",
  "viewing.pickLabel": "วันและเวลา",
  "viewing.submit": "ยืนยันนัดดู",
  "viewing.submitting": "กำลังบันทึก…",
  "viewing.cancel": "ยกเลิก",
  "viewing.created": "สร้างนัดดูทรัพย์แล้ว",
  "viewing.errorPast": "กรุณาเลือกเวลาในอนาคต",
  "viewing.errorInvalid": "เวลาไม่ถูกต้อง กรุณาเลือกใหม่",

  // Notes / follow-ups (per listing, the caller's own — GET/POST /properties/{id}/notes).
  "notes.head": "บันทึกของฉัน",
  "notes.loading": "กำลังโหลดบันทึก…",
  "notes.empty": "ยังไม่มีบันทึกสำหรับประกาศนี้",
  "notes.placeholder": "เพิ่มบันทึกส่วนตัว เช่น สิ่งที่ต้องถามเจ้าของ…",
  "notes.add": "เพิ่มบันทึก",
  "notes.adding": "กำลังบันทึก…",
  "notes.errorEmpty": "กรุณากรอกข้อความก่อนบันทึก",
  "notes.private": "บันทึกเหล่านี้เป็นส่วนตัว เห็นได้เฉพาะคุณเท่านั้น",

  // Owner edit surface (PATCH /properties/{id}) — the mini-app edit form (NOT edit-by-reply).
  "edit.cta": "แก้ไขประกาศ",
  "edit.title": "แก้ไขประกาศ",
  "edit.loading": "กำลังโหลดประกาศ…",
  "edit.fieldPriceThb": "ราคาขาย (บาท)",
  "edit.fieldMonthlyRent": "ค่าเช่า/เดือน (บาท)",
  "edit.fieldBedrooms": "ห้องนอน",
  "edit.fieldBathrooms": "ห้องน้ำ",
  "edit.fieldProjectName": "โครงการ",
  "edit.fieldLandmark": "จุดสังเกต",
  "edit.fieldTambon": "ตำบล",
  "edit.fieldAmphoe": "อำเภอ",
  "edit.fieldProvince": "จังหวัด",
  "edit.save": "บันทึกการแก้ไข",
  "edit.saving": "กำลังบันทึก…",
  "edit.savedTitle": "บันทึกการแก้ไขแล้ว",
  "edit.savedBody": "ข้อมูลประกาศได้รับการอัปเดตแล้ว",
  "edit.errorTitle": "บันทึกไม่สำเร็จ",
  "edit.errorBody": "เกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่อีกครั้ง",
  "edit.notOwnerBody": "คุณไม่มีสิทธิ์แก้ไขประกาศนี้ หรือประกาศไม่พบ",
  "edit.back": "กลับ",

  // ============================================================
  // Claim / publish flow (Stage 5, Build C — D7 poster opt-in). The LIFF claim screen the bot DM
  // deep-links to: review the bot-extracted listing → claim ownership → choose public vs group-private.
  // Bare-verb CTAs (COPY-02 / B3-F08). Style matches docs/design/mockups/explore-stage5-1-claim.html.
  // ============================================================
  "claim.title": "ตรวจสอบประกาศ",
  "claim.loading": "กำลังโหลดประกาศ…",
  // Step-progress indicator (mock `.step-progress`): ตรวจสอบ → อ้างสิทธิ์ → เผยแพร่.
  "claim.stepReview": "ตรวจสอบ",
  "claim.stepClaim": "อ้างสิทธิ์",
  "claim.stepPublish": "เผยแพร่",
  // Review banner (LEGAL-06: the listing is auto-extracted — verify before publishing).
  "claim.reviewBannerTitle": "บอทดึงข้อมูลอัตโนมัติ",
  "claim.reviewBannerBody": "กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนอ้างสิทธิ์และเผยแพร่",
  // The structured review spec card (mock `.field-card`): a section head + the schema-present rows.
  "claim.specHead": "ข้อมูลหลัก",
  "claim.fieldHeadline": "ชื่อประกาศ",
  // S5-7 verify affordance: a link to the full detail (`/p/{id}`) so the poster can verify the bot's
  // full extraction BEFORE the irreversible publish.
  "claim.viewFullDetail": "ดูรายละเอียดทั้งหมด",
  // The claim CTA + states.
  "claim.claimCta": "อ้างสิทธิ์ประกาศนี้",
  "claim.claiming": "กำลังอ้างสิทธิ์…",
  "claim.legalNote": "ข้อมูลจากผู้ลงประกาศ โปรดตรวจสอบด้วยตนเองก่อนทำธุรกรรม",
  // The concurrent-claim loser (409). COPY-07: what + why + next.
  "claim.alreadyClaimedTitle": "ประกาศนี้ถูกอ้างสิทธิ์แล้ว",
  "claim.alreadyClaimedBody": "อสังหาฯ นี้ถูกอ้างสิทธิ์โดยสมาชิกกลุ่มท่านอื่นก่อนแล้ว จึงไม่สามารถอ้างสิทธิ์ซ้ำได้",
  "claim.alreadyClaimedNext": "กลับไปหน้าประกาศของฉัน",
  "claim.failedTitle": "อ้างสิทธิ์ไม่สำเร็จ",
  "claim.failedBody": "เกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่อีกครั้ง",
  // Post-claim success + the publish decision (D7).
  "claim.successTitle": "อ้างสิทธิ์สำเร็จแล้ว",
  "claim.successBody": "คุณเป็นเจ้าของประกาศนี้แล้ว เลือกว่าจะให้ใครเห็นข้อมูลนี้ได้บ้าง",
  "claim.visibilityHead": "เลือกการมองเห็น",
  // Public option.
  "claim.publicTitle": "เผยแพร่สาธารณะ",
  "claim.publicSubtitle": "ทุกคนค้นหาเจอ · แชร์ลิงก์ได้",
  "claim.publicFeatPublic": "ปรากฏในหน้าค้นหาสาธารณะ",
  "claim.publicFeatSeo": "Google ค้นหาเจอ (SEO)",
  "claim.publicFeatContact": "ข้อมูลติดต่อของคุณยังคงเป็นส่วนตัว",
  "claim.publishCta": "เผยแพร่สาธารณะเลย",
  "claim.publishing": "กำลังเผยแพร่…",
  // Group-private option — the boundary copy the spec mandates.
  "claim.privateTitle": "เฉพาะสมาชิกกลุ่ม",
  "claim.privateSubtitle": "เฉพาะสมาชิกกลุ่มเดิม",
  "claim.privateFeatGroup": "เห็นเฉพาะสมาชิกกลุ่มเดิม",
  "claim.privateFeatNoPublic": "ไม่ปรากฏในหน้าค้นหาสาธารณะ",
  "claim.keepPrivateCta": "เก็บไว้เฉพาะกลุ่มก่อน",
  "claim.keepingPrivate": "กำลังบันทึก…",
  // Publish-decision outcomes (after the choice). COPY-07.
  "claim.publishedTitle": "เผยแพร่สาธารณะแล้ว",
  "claim.publishedBody": "ประกาศของคุณปรากฏบนเว็บไซต์สาธารณะแล้ว ผู้ซื้อค้นหาเจอได้ทันที",
  "claim.privatedTitle": "เก็บไว้เฉพาะกลุ่มแล้ว",
  "claim.privatedBody": "ประกาศนี้เห็นได้เฉพาะสมาชิกกลุ่มเดิม คุณเปลี่ยนเป็นสาธารณะได้ภายหลังจากหน้าประกาศของฉัน",
  "claim.doneCta": "ไปที่ประกาศของฉัน",
  "claim.publishConsentNote": "การเผยแพร่ถือว่าคุณยินยอมให้ข้อมูลปรากฏในระบบ คุณถอนการเผยแพร่ได้ตลอดเวลา",

  // ============================================================
  // Stage 6 — DEALFLOW (groups). Interest flags (D-S6-3), quick-sale (D10), quote response (D10).
  // Listing-facing surfaces on the detail screen + the vetted-broker quote-response screen.
  // ============================================================
  // Interest flag — the MEMBER action on a non-owned listing (D-S6-3, non-binding).
  "interest.flagCta": "สนใจประกาศนี้",
  "interest.flagging": "กำลังบันทึก…",
  "interest.flagged": "บันทึกความสนใจแล้ว",
  "interest.flaggedNote": "เจ้าของจะเห็นว่าคุณสนใจ ไม่ผูกมัด ยกเลิกได้ทุกเมื่อ",
  // Interest list — the OWNER's "who's interested" section on their own listing.
  "interest.ownerHead": "ผู้สนใจ ({count})",
  "interest.loading": "กำลังโหลดรายชื่อผู้สนใจ…",
  "interest.empty": "ยังไม่มีผู้สนใจประกาศนี้",
  "interest.flaggedAt": "สนใจเมื่อ {date}",

  // Quick-sale toggle — the OWNER marks a SALE listing as urgent/discounted (D10).
  "quickSale.head": "ขายด่วน",
  "quickSale.toggleCta": "ทำเป็นขายด่วน",
  "quickSale.toggling": "กำลังบันทึก…",
  "quickSale.activeBadge": "ขายด่วน",
  "quickSale.activeNote": "ประกาศนี้ทำเครื่องหมายขายด่วน นายหน้าที่ผ่านการตรวจสอบจะได้รับแจ้งให้เสนอราคา",
  "quickSale.note": "ทำเป็นขายด่วนเพื่อส่งให้นายหน้าที่ผ่านการตรวจสอบเสนอราคาแข่งกัน (เฉพาะประกาศขาย)",
  "quickSale.errorNotSale": "ทำเป็นขายด่วนได้เฉพาะประกาศขายเท่านั้น",
  "quickSale.error": "เกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่",

  // Quotes — the OWNER's "offers received" section on their own listing.
  "quotes.ownerHead": "ข้อเสนอ ({count})",
  "quotes.loading": "กำลังโหลดข้อเสนอ…",
  "quotes.empty": "ยังไม่มีข้อเสนอสำหรับประกาศนี้",
  "quotes.amount": "เสนอ {amount}",
  "quotes.discount": "ส่วนลด {pct}% จากราคาตลาด",
  "quotes.submittedAt": "เสนอเมื่อ {date}",

  // Quote-response SCREEN (`/quote/{id}`) — a vetted broker submits a structured offer.
  "quote.title": "เสนอราคา",
  "quote.loading": "กำลังโหลดประกาศ…",
  "quote.intro": "ประกาศขายด่วนนี้ส่งถึงคุณในฐานะนายหน้าที่ผ่านการตรวจสอบ กรุณาเสนอราคาที่มีโครงสร้าง",
  "quote.fieldAmount": "ราคาที่เสนอ (บาท)",
  "quote.fieldAmountPlaceholder": "เช่น 3500000",
  "quote.fieldDiscount": "ส่วนลดจากราคาตลาด (%)",
  "quote.fieldDiscountPlaceholder": "0–100 (ไม่บังคับ)",
  "quote.fieldTerms": "เงื่อนไขเพิ่มเติม",
  "quote.fieldTermsPlaceholder": "เงื่อนไข เช่น ชำระเงินสด ปิดการขายภายใน 30 วัน (ไม่บังคับ)",
  "quote.submit": "ส่งข้อเสนอ",
  "quote.submitting": "กำลังส่ง…",
  "quote.errorAmount": "กรุณากรอกราคาที่เสนอเป็นจำนวนเงินที่มากกว่าศูนย์",
  "quote.errorDiscount": "ส่วนลดต้องอยู่ระหว่าง 0 ถึง 100",
  "quote.errorNotVetted": "เฉพาะนายหน้าที่ผ่านการตรวจสอบเท่านั้นที่เสนอราคาได้",
  "quote.errorNotQuickSale": "ประกาศนี้ไม่ได้เปิดรับข้อเสนอขายด่วนแล้ว",
  "quote.errorNotFound": "ไม่พบประกาศนี้",
  "quote.error": "ส่งข้อเสนอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  "quote.submittedTitle": "ส่งข้อเสนอแล้ว",
  "quote.submittedBody": "ข้อเสนอของคุณถูกส่งถึงเจ้าของประกาศแล้ว เจ้าของจะติดต่อกลับหากสนใจ",
  "quote.doneCta": "เสร็จสิ้น",

  // ============================================================
  // Stage 6 — ROLE APPLICATION (`/apply`, D9 / D-S6-6). A user applies for a broker/investor role and
  // captures the quick-quote matching preferences (provinces / property-types / price-band range) in
  // the same form → POST /me/role-application. The current standing (pending/approved/rejected/none)
  // is read from GET /me/role-application. Self-service — the admin gate is on the approval step.
  // ============================================================
  "apply.title": "สมัครเป็นนายหน้า/นักลงทุน",
  "apply.intro":
    "สมัครเพื่อรับแจ้งประกาศขายด่วนที่ตรงกับความสนใจของคุณ และเสนอราคาผ่านระบบ ทีมงานจะตรวจสอบก่อนอนุมัติ",
  "apply.loading": "กำลังโหลดสถานะการสมัคร…",
  // Role choice.
  "apply.roleHead": "สมัครในฐานะ",
  "apply.roleBroker": "นายหน้า",
  "apply.roleInvestor": "นักลงทุน",
  // Preference capture (the quick-quote matching axes — D-S6-6).
  "apply.provincesHead": "จังหวัดที่สนใจ",
  "apply.provincesHint": "เลือกได้หลายจังหวัด เว้นว่างไว้หากสนใจทุกจังหวัด",
  "apply.propertyTypesHead": "ประเภททรัพย์ที่สนใจ",
  "apply.propertyTypesHint": "เลือกได้หลายประเภท เว้นว่างไว้หากสนใจทุกประเภท",
  "apply.priceBandsHead": "ช่วงราคาที่สนใจ (ขาย)",
  "apply.priceBandsHint": "เลือกได้หลายช่วง เว้นว่างไว้หากสนใจทุกช่วงราคา",
  "apply.submit": "ส่งใบสมัคร",
  "apply.submitting": "กำลังส่ง…",
  "apply.error": "ส่งใบสมัครไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  // Current-status banner (read on load).
  "apply.statusHead": "สถานะการสมัครของคุณ",
  "apply.statusPending": "กำลังรอการตรวจสอบ — ทีมงานจะแจ้งผลให้ทราบ",
  "apply.statusApproved": "ผ่านการตรวจสอบแล้ว — คุณเสนอราคาประกาศขายด่วนได้",
  "apply.statusRejected": "ใบสมัครไม่ผ่านการตรวจสอบ คุณสมัครใหม่ได้",
  "apply.statusNone": "คุณยังไม่ได้สมัคร",
  // Submitted outcome.
  "apply.submittedTitle": "ส่งใบสมัครแล้ว",
  "apply.submittedBody": "ใบสมัครของคุณอยู่ระหว่างการตรวจสอบ ทีมงานจะแจ้งผลให้ทราบ",
  "apply.alreadyTitle": "คุณสมัครไว้แล้ว",
  "apply.alreadyBody": "เรามีใบสมัครของคุณอยู่แล้ว สถานะปัจจุบันแสดงด้านบน",
  "apply.doneCta": "เสร็จสิ้น",

  // ============================================================
  // Stage 6 — ADMIN (mini-app, server-gated by the `admin` role — D-S6-5). The admin reaches these via
  // a deep link (no nav link for non-admins). The server is AUTHORITATIVE: a non-admin's request 404s,
  // and the UI shows a calm "no access" state — it NEVER asserts the user's own admin-ness.
  // ============================================================
  // The server-authoritative no-access state (a non-admin's 404/403). COPY-07.
  "admin.noAccessTitle": "ไม่มีสิทธิ์เข้าถึง",
  "admin.noAccessBody": "หน้านี้สำหรับผู้ดูแลระบบเท่านั้น",
  "admin.loading": "กำลังโหลด…",
  "admin.refresh": "รีเฟรช",
  // The in-flight label on a resolve button — shared by BOTH admin queues (vetting + moderation).
  "admin.working": "กำลังบันทึก…",
  // Vetting queue (`/admin/vetting`) — GET /admin/role-applications → approve/reject.
  "adminVetting.title": "คิวตรวจสอบนายหน้า/นักลงทุน",
  "adminVetting.empty": "ไม่มีใบสมัครที่รอการตรวจสอบ",
  "adminVetting.kindBroker": "นายหน้า",
  "adminVetting.kindInvestor": "นักลงทุน",
  "adminVetting.approve": "อนุมัติ",
  "adminVetting.reject": "ปฏิเสธ",
  "adminVetting.approved": "อนุมัติแล้ว",
  "adminVetting.rejected": "ปฏิเสธแล้ว",
  // A stale/double decision the server already resolved (409).
  "adminVetting.alreadyDecided": "ใบสมัครนี้ถูกตัดสินไปแล้ว",
  "adminVetting.error": "ดำเนินการไม่สำเร็จ กรุณาลองใหม่",
  // Moderation queue (`/admin/moderation`) — GET /admin/moderation → approve/reject.
  "adminMod.title": "คิวตรวจสอบประกาศ",
  "adminMod.intro": "ประกาศที่ไม่ผ่านการตรวจสอบคุณภาพอัตโนมัติ รอการตัดสินจากผู้ดูแล",
  "adminMod.empty": "ไม่มีประกาศที่รอการตรวจสอบ",
  "adminMod.reason": "เหตุผล",
  "adminMod.noReason": "ไม่ระบุเหตุผล",
  "adminMod.approve": "อนุมัติ",
  "adminMod.reject": "ปฏิเสธ",
  "adminMod.approved": "บันทึกผลอนุมัติแล้ว",
  "adminMod.rejected": "บันทึกผลปฏิเสธแล้ว",
  // LEGAL-02 / S6-11: "approve" RECORDS the review — it does NOT itself publish the listing.
  "adminMod.approveNote": "การอนุมัติเป็นการบันทึกผลตรวจสอบ ไม่ได้เผยแพร่ประกาศโดยอัตโนมัติ",
  "adminMod.alreadyDecided": "ประกาศนี้ถูกตัดสินไปแล้ว",
  "adminMod.error": "ดำเนินการไม่สำเร็จ กรุณาลองใหม่",

  // ============================================================
  // Public website chrome + pages (site polish). Brand = the working wordmark (FQ-4).
  // ============================================================
  "site.name": "ทรัพย์ดี",
  "site.tagline": "ตลาดอสังหาฯ ภาคเหนือ จากเจ้าของและนายหน้าตัวจริง",
  "site.description":
    "ค้นหาบ้าน ที่ดิน คอนโด ในเชียงใหม่และภาคเหนือ ประกาศจากเจ้าของและนายหน้า ราคาเสนอขายชัดเจน ติดต่อผ่าน LINE",
  "count.listings": "{count} ประกาศ",
  "nav.home": "หน้าแรก",
  "nav.buy": "ซื้อ",
  "nav.rent": "เช่า",
  "nav.browse": "ค้นหาประกาศ",
  "nav.howItWorks": "วิธีลงประกาศ",
  "nav.about": "เกี่ยวกับเรา",
  "nav.contact": "ติดต่อเรา",
  "nav.privacy": "นโยบายความเป็นส่วนตัว",
  "nav.terms": "ข้อกำหนดการใช้งาน",
  "nav.postListing": "ลงประกาศฟรี",
  "nav.menu": "เมนู",
  "nav.closeMenu": "ปิดเมนู",
  "nav.skipToContent": "ข้ามไปเนื้อหา",
  "theme.toggle": "สลับโหมดสว่าง/มืด",
  "theme.light": "โหมดสว่าง",
  "theme.dark": "โหมดมืด",
  "locale.other": "English",
  "locale.switchLabel": "เปลี่ยนภาษา",
  "footer.browseHead": "ค้นหาทรัพย์",
  "footer.legalHead": "ข้อกฎหมาย",
  "footer.lineHead": "ติดต่อผ่าน LINE",
  "footer.lineBody": "ลงประกาศหรือสอบถามได้ทาง LINE Official Account ของเรา",
  "footer.copyright": "© {year} ทรัพย์ดี · ช่วงทดลองให้บริการ",
  "footer.hosting": "ข้อมูลจัดเก็บบนเซิร์ฟเวอร์ที่สิงคโปร์ (AWS ap-southeast-1)",

  // Home page
  "home.heroTitle": "หาบ้าน ที่ดิน คอนโด ในเชียงใหม่และภาคเหนือ",
  "home.heroSubtitle": "ประกาศจากเจ้าของและนายหน้าตัวจริง ราคาเสนอขายชัดเจน คุยกันต่อได้เลยทาง LINE",
  "home.searchPlaceholder": "ค้นหาทำเล โครงการ หรือคำสำคัญ เช่น สันกำแพง",
  "home.browseByType": "เลือกดูตามประเภท",
  "home.latest": "ประกาศล่าสุด",
  "home.viewAll": "ดูทั้งหมด",
  "home.whyTitle": "ทำไมต้อง ทรัพย์ดี",
  "home.whySubtitle": "เราสร้างจากสิ่งที่ผู้ซื้อผู้ขายในไทยบ่นมากที่สุด: ประกาศปลอม ประกาศซ้ำ และราคาที่เชื่อไม่ได้",
  "home.why1Title": "รู้ที่มาของทุกประกาศ",
  "home.why1Body": "เราบันทึกว่าใครลงประกาศ จากกลุ่มไหน และเมื่อไหร่ ประกาศซ้ำหรือทรัพย์เก่าค้างจะถูกคัดออก",
  "home.why2Title": "ราคาเสนอขาย ไม่ใช่ราคาโฆษณา",
  "home.why2Body":
    "ทุกราคาคือราคาเสนอขายจากผู้ลงประกาศ พร้อมระบุว่าต่อรองได้หรือไม่ และเปิดเผยข้อมูลที่ควรรู้ก่อนวางมัดจำ",
  "home.why3Title": "คุยต่อทาง LINE ได้ทันที",
  "home.why3Body": "ไม่ต้องกรอกฟอร์ม ไม่ต้องรออีเมล กดปุ่มเดียวก็คุยกับผู้ลงประกาศได้เหมือนที่คุณคุยกับเพื่อน",
  "home.why4Title": "ข้อมูลส่วนตัวเป็นค่าเริ่มต้น",
  "home.why4Body": "ประกาศจะเผยแพร่สาธารณะก็ต่อเมื่อเจ้าของกดยินยอมเอง เบอร์โทรและข้อมูลติดต่อไม่ถูกเปิดเผย",
  "home.howTitle": "ลงประกาศฟรี ใน 3 ขั้นตอน",
  "home.howSubtitle": "ไม่ต้องกรอกฟอร์มยาว ไม่ต้องเรียนรู้ระบบใหม่ ใช้ LINE ที่คุณใช้อยู่แล้ว",
  "home.how1Title": "โพสต์ในกลุ่ม LINE ตามปกติ",
  "home.how1Body": "เพิ่มบอทของเราเข้ากลุ่มนายหน้าหรือกลุ่มซื้อขายที่คุณใช้อยู่ แล้วโพสต์ประกาศแบบเดิม",
  "home.how2Title": "ตรวจสอบและยืนยัน",
  "home.how2Body":
    "บอทดึงข้อมูลเป็นประกาศให้อัตโนมัติ คุณตรวจสอบ แก้ไข และเลือกว่าจะเผยแพร่สาธารณะหรือเก็บไว้ในกลุ่ม",
  "home.how3Title": "ผู้ซื้อทักมาทาง LINE",
  "home.how3Body": "ประกาศสาธารณะจะติด Google และมีลิงก์แชร์ได้ ผู้สนใจกดแชทหาคุณได้โดยตรง",
  "home.howCta": "เริ่มลงประกาศ",
  "home.howMore": "ดูรายละเอียดวิธีลงประกาศ",
  "home.areasTitle": "ทำเลยอดนิยม",
  "home.areasSubtitle": "เลือกดูตามอำเภอที่มีประกาศ",

  // Browse page
  "browse.title": "ค้นหาประกาศ",
  "browse.titleSale": "ประกาศขาย",
  "browse.titleRent": "ประกาศให้เช่า",
  "browse.resultsIn": "ใน {place}",
  "browse.filters": "ตัวกรอง",
  "browse.showResults": "ดูผลลัพธ์",
  "browse.activeFilters": "ตัวกรองที่ใช้",
  "browse.sortNewest": "เรียงตามล่าสุด",
  "browse.sortNearest": "เรียงตามระยะทาง",
  "browse.keyword": "คำค้นหา",
  "browse.pageOf": "หน้า {page} จาก {total}",
  "browse.clearAll": "ล้างทั้งหมด",

  // Detail page
  "detail.contactHead": "สนใจทรัพย์นี้?",
  "detail.contactBody": "ทักผู้ลงประกาศทาง LINE ได้เลย ไม่ต้องกรอกฟอร์ม",
  "detail.share": "แชร์",
  "detail.copyLink": "คัดลอกลิงก์",
  "detail.copied": "คัดลอกลิงก์แล้ว",
  "detail.keyFacts": "ข้อมูลสำคัญ",
  "detail.mapApprox": "ตำแหน่งโดยประมาณ ตามที่ผู้ลงประกาศระบุ",
  "detail.similar": "ประกาศใกล้เคียง",
  "detail.postedHead": "ผู้ลงประกาศ",
  "detail.listingId": "รหัสประกาศ",
  "detail.galleryOpen": "ดูรูปทั้งหมด",
  "detail.galleryPrev": "รูปก่อนหน้า",
  "detail.galleryNext": "รูปถัดไป",
  "detail.noPhotos": "ยังไม่มีรูปภาพ",
  "detail.updatedOn": "อัปเดตล่าสุด {date}",

  // Static pages + 404 + contact
  "pages.about.title": "เกี่ยวกับเรา",
  "pages.howItWorks.title": "วิธีลงประกาศ",
  "pages.privacy.title": "นโยบายความเป็นส่วนตัว",
  "pages.terms.title": "ข้อกำหนดการใช้งาน",
  "pages.contact.title": "ติดต่อเรา",
  "contact.intro": "เราตอบทุกข้อความทาง LINE ในเวลาทำการ (จันทร์–ศุกร์ 9:00–18:00)",
  "contact.lineHead": "LINE Official Account",
  "contact.lineBody": "ช่องทางหลักสำหรับลงประกาศ สอบถาม และแจ้งลบข้อมูล",
  "contact.lineCta": "เพิ่มเพื่อนทาง LINE",
  "contact.pdpaHead": "คำขอเกี่ยวกับข้อมูลส่วนบุคคล (PDPA)",
  "contact.pdpaBody": "ขอดู แก้ไข หรือลบข้อมูลของคุณได้ทาง LINE เดียวกัน เราตอบกลับภายใน 30 วัน",
  "contact.brokerHead": "นายหน้าและนักลงทุน",
  "contact.brokerBody": "อยากรับประกาศขายด่วนที่ตรงกับความสนใจ? ทักมาบอกพื้นที่และประเภททรัพย์ที่คุณสนใจ",
  "notFound.title": "ไม่พบหน้านี้",
  "notFound.body": "ประกาศอาจถูกปิดการเผยแพร่แล้ว หรือลิงก์ไม่ถูกต้อง",
  "notFound.browse": "ค้นหาประกาศทั้งหมด",
  "notFound.home": "กลับหน้าแรก",
} as const;

export type MessageKey = keyof typeof th;
