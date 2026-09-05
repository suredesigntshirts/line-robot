# Deepening LINE MINI App ↔ Chat Integration — Research Report

_Research date: 2026-06-08. For the line-robot real-estate catalog assistant._

This report answers two questions: (1) **how deeply can a LIFF / MINI App integrate into a
LINE chat** (and specifically, can we "return HTML into the chat"?), and (2) **what are the most
creative, proven ways others integrate mini apps** — mapped to concrete next steps for our bot.

Sources: cached LINE docs in `docs/developers.line.biz/`, the live `developers.line.biz` docs +
LINE Engineering blog, and our own codebase. Marketing/vendor metrics are flagged as such.

---

## 0. TL;DR — the one answer you asked for first

**No — you cannot return HTML into the chat.** The chat transcript is a *native* renderer. It only
knows how to draw LINE **message objects**: text, sticker, image, video, audio, location, template,
and **Flex**. HTML/CSS/JS renders *only inside the LIFF webview*, and when that webview closes,
**nothing of it persists in the chat**. The richest "custom layout" you can leave in the chat is a
**Flex Message** (a constrained JSON box/bubble DSL — not a web page). That is already what you use.

So the correct mental model is **not** "make the chat richer with HTML." It's: **the webview is your
rich surface; the chat is your durable, shareable, notifiable surface; and there's a small, well-defined
set of valves between them.** Deep integration = using those valves well, in both directions.

---

## 1. The three surfaces and the membrane between them

```
   ┌─────────────────────────┐        valves (chat ↔ webview)        ┌──────────────────────────┐
   │   CHAT TRANSCRIPT        │   ── deep link (Flex btn / rich     │   LIFF WEBVIEW           │
   │   (native renderer)      │      menu / service msg) ─────────► │   (full HTML/CSS/JS)     │
   │                          │                                      │                          │
   │ • text / sticker         │   ◄── liff.sendMessages() ────────  │ • anything a web app     │
   │ • image / video / audio  │      (into THIS chat, as the user)   │   can do: maps, galleries│
   │ • location               │                                      │   forms, calculators,    │
   │ • Flex (JSON bubble)  ◄──┼── liff.shareTargetPicker() ───────  │   compare views, scan    │
   │ • template               │      (into OTHER chats/friends)      │ • LINE Login identity    │
   │                          │                                      │ • calls our read-API     │
   │ + Service Message card ◄─┼── server push after an action ────  │                          │
   │   (verified MINI App)    │      (Service Messages / push)       │                          │
   └─────────────────────────┘                                      └──────────────────────────┘
```

- **Chat → webview:** a tap on a Flex button, a rich-menu tab, or a service-message button opens a
  **specific** LIFF screen (deep link). You can carry state in the URL.
- **Webview → chat (current chat):** `liff.sendMessages()` injects up to 5 LINE message objects into
  the chat the LIFF was opened from, *as if the user sent them*.
- **Webview → other chats:** `liff.shareTargetPicker()` lets the user fan a message out to chosen
  friends/groups (referrals, "send this to my partner").
- **Server → chat, after the fact:** Service Messages (verified MINI App only) or normal push /
  notification messages re-engage the user later.

Everything below is a way to use one of those valves.

---

## 2. What we have today (baseline)

From the codebase (`packages/miniapp`, `packages/bot`):

- **MINI App**: read-only catalog. Preact+Vite SPA on S3+CloudFront. LIFF ID `2010316767-rdtwc5y3`
  on the **Published but UNVERIFIED** channel `2010316767`. Scope: **`openid` only**.
  Screens: **List** (filter/search/sort), **Detail** (full fields + chanote + photo strip + map),
  **Gallery** (swipe/pinch). Auth via `liff.getIDToken()` → Bearer → read-API; membership-gated.
  History-API routing; deep-link plumbing for `/p/{id}` via `liff.state` **already exists**.
- **Chat (Flex)**: `core/handlers/views.ts` builds property carousels (≤12 bubbles), single-property
  detail cards, image carousels, merge/delete quick-replies, ingestion confirmations. Card buttons:
  Details (postback), Photos (postback), Open in Maps (uri), Follow-up (datetimepicker), Delete.
- **Rich menu**: 5 tabs — My Listings, Upcoming, Search, **Catalog (uri → LIFF URL)**, Help.
- **Postback router** (`postbackRouter.ts`): listings, upcoming, search, help, view, photos, delete,
  deleteconfirm, merge, keep, setfollowup.
- **Deferred** (from plans 14/10): in-chat deep links on cards, share-to-client (shareTargetPicker),
  in-app edit, **MINI App verification**, GSI3, Batch API.

**Key gap:** the deep-link router exists in the app, but **no Flex card actually links into a specific
catalog screen yet**, and the app can't talk back into chat (no `chat_message.write` scope). The two
cheapest, highest-impact wins are both about wiring valves we already half-built.

---

## 3. The full toolbox (every valve, with constraints)

### 3a. `liff.sendMessages()` — webview → *this* chat
- Sends **up to 5** LINE message objects into the chat the LIFF was opened from, **as the user**.
- Allowed types: text (no emojis/quoteToken), sticker, image, video (no trackingId), audio, location,
  **template (URI actions only)**, **Flex (URI actions only)**. **No HTML.**
- Requires **`chat_message.write`** scope (we'd have to add it — we only request `openid` today).
- **LIFF browser only** (not external browser); must be **opened from a chat** (1:1, group, or room —
  not restricted to 1:1). Fails 403 if scope/permission missing.
- **Gotcha:** template/flex sent this way **do not fire a webhook** to our bot. Text/image/etc. do. So
  if we want the backend to *react* to the "result" the user sent from the app, use text (or carry an
  ID the user then taps), not flex.

### 3b. `liff.shareTargetPicker()` — webview → *other* chats
- User picks friends/OAs/groups (no OpenChats); message is sent **on their behalf**. Up to 5 objects,
  same type restrictions (Flex/template URI-only).
- Works in LIFF **and** external browser. Requires a **once-per-channel "Agreement Regarding Use of
  Information"** consent in the LINE console (not a scope). LINE app ≥ 10.3.0.
- This is the **referral / "share this listing with my partner"** mechanism.

### 3c. Deep links — chat → *specific* webview screen
- Append path+query to the LIFF URL: `https://liff.line.me/{liffId}/p/123?from=flex`. After
  `liff.init()`, the SDK reconstructs the secondary URL and our router opens that exact screen.
- Works **today, unverified.** Our app already parses `liff.state` → `/p/{id}`. We just need to put
  these URLs on Flex buttons and rich-menu tabs.
- **Gotcha:** don't read/mutate query params before `liff.init()` resolves (LIFF rewrites the URL).

### 3d. Service Messages — server → chat, after an action (**verified MINI App only**)
- The marquee "talk back into chat later" feature. After a user action, push a **template** card into a
  regional **system notice room** ("LINE MINI App Notice" in TH) — *not* your OA's 1:1 thread.
- **Strictly** confirmations / results / reminders tied to a user action. **Ads/promos/coupons/"new
  listing!" blasts are prohibited here.**
- Limits: **≤5 messages per single user action**; token lives **1 year**, auto-renews on each send,
  ≤5 sends per token. ~20 templates/channel, 6 languages, tight char caps (≈50/150).
- Flow: `liff.getAccessToken()` → server mints notifier token (channel token + LIFF token) → `send`.
- **Requires verification.** Not available to us until we verify the MINI App.

### 3e. Normal push & notification messages — server → chat
- **Messaging API push**: needs userId + the user friended the OA. Good for "new listing matches your
  saved search." Counts against push quota/billing. (We already `push()` for follow-up reminders.)
- **LINE Notification Messages**: phone-number-targeted, can reach non-friends (opt-in, SMS-matched);
  partner-tier feature — likely out of scope for now.

### 3f. Other webview capabilities worth knowing
- **`liff.scanCodeV2()`** — in-app QR/barcode reader (Full-size LIFF; iOS 14.3+). e.g. scan a printed
  yard-sign QR → open that listing. (`scanCode()` is deprecated.)
- **`liff.getProfile()` / `getFriendship()` / `getDecodedIDToken()`** — identity & friend status.
- **Verified-only extras:** `createShortcutOnHomeScreen()` (add-to-home-screen), **custom/vanity path**
  (`miniapp.line.me/our_brand`), **channel consent simplification** + `permission.requestAll()`,
  **common profile quick-fill** (auto-fill name/phone/address on forms), **discovery** (in-LINE search +
  Home tab), the **minimize** button, and the **verification badge** (trust).
- **Platform direction (2024–25):** LINE is **merging LIFF into LINE MINI App** as one brand; new apps
  should be built as MINI Apps. Unverified MINI Apps have been publishable without review since Nov 2024.

---

## 4. What others are doing (proven patterns)

LINE's own documented demo flows (the cleanest references):
- **Reservation**: scan QR → open app → LINE Login → pick date/time → **reminder pushed into chat
  before the date.** (APIs: LIFF + Login + Messaging.) — the canonical handoff loop.
- **Table order**: scan QR at table → each diner orders on their phone → pay (LINE Pay) → post-txn push.
- **Membership card**: scan/tap → profile grant → card issued bound to userId, **zero-form signup**, lives
  in LINE, reachable via rich menu / home-screen shortcut; behavior drives targeted push.

Named real-world (LINE Engineering blog facts vs vendor claims flagged):
- **Yahoo!不動産 (Japan real estate)** OA: user sets area/type/budget once; **daily "new listings" +
  price-change / floorplan alerts pushed into chat**; conditions persist as saved searches. _(Directly
  mirrors our saved/upcoming model — the single best analog for us.)_
- **Yamato Transport** redelivery bot (+60% redeliveries via LINE), **Taiwan LINE Pay card** signups via
  chatbot (~750k cards), **LOHACO** support bot — all LINE Engineering blog figures.
- **Starbucks Thailand** digital loyalty card + store locator + pay inside the OA.
- **PAL Closet / SEEKSTER / FINNOMENA / MedCare** (TH/JP membership, booking, status, pay MINI Apps).
  _(Their growth multipliers are marketing claims — directional only.)_
- **JP real-estate agents** commonly use rich-menu tabs like "listings / viewing reservation / FAQ /
  document request" and in-LINE booking (staff pick + appointment type + date).
- **Referral**: LINE Thailand's "Friends get Friends" campaign — `shareTargetPicker` sends a Flex invite
  that deep-links recipients back in.

**Cross-cutting UX insight (LINE Engineering):** the most successful Asian bots win on **simple
buttons / Flex / LIFF over conversational AI**. Validates our button-and-card-forward approach; invest
in interaction design, not heavier NLU.

**LINE's own design guidance for "good vs clunky":** respect the **native header** (don't rebuild nav),
use the loading bar, respect safe areas, and lean on the real differentiators — **frictionless onboarding
(LINE Login + profile quick-fill), persistent re-entry (home-screen shortcut + vanity URL), and the
messaging loop back into chat** — not custom chrome.

---

## 5. Recommendations for line-robot (prioritized)

Split by what works **today (unverified)** vs what needs **verification**.

### Works today — do these first

**R1. Deep-link Flex cards & rich menu into specific catalog screens.** _(Highest impact / lowest effort.)_
- Add a "🔎 Open in Catalog" **uri** button to the property detail Flex card (and optionally the carousel
  cards) → `https://liff.line.me/{liffId}/p/{propertyId}`. The app's router already handles `/p/{id}`.
- Add deep links for filtered views too (e.g. `…/?area=Thonglor&type=condo`) from search results.
- Effort: small (Flex builder + a couple of routes). No new scopes, no verification.

**R2. Move "heavy" interactions from chat into the webview, then drop a summary back.**
- Things Flex can't do well — **interactive map search, side-by-side compare, photo/virtual-tour gallery,
  mortgage/affordability calculator** — live as LIFF screens. On finish, call `liff.sendMessages()` to
  drop a **Flex summary** ("You shortlisted 3 properties in Thonglor") back into the chat so the
  conversation stays the system of record.
- Requires adding **`chat_message.write`** scope to the LIFF channel. Still no verification needed.

**R3. Share-a-listing via `shareTargetPicker`.** _(Property decisions are joint.)_
- "Share with a friend" button in the app → Flex listing card sent to chosen friend/family/group, which
  deep-links them back into that listing (R1).
- Requires the one-time per-channel "Agreement Regarding Use of Information" consent in console.

**R4. In-app "book a viewing" with a real calendar UI** → write a `PropertyEvent` (we already have the
entity + reminder Lambda) → reminder pushed via existing `push()`. (Upgrade to a Service-Message card
once verified — see R6.) Better UX than the current datetime-picker postback.

### Needs MINI App verification — plan the project

**R5. Verify the MINI App.** Unlocks the rest: Service Messages, add-to-home-screen, custom vanity path,
consent simplification, common-profile quick-fill, in-LINE discovery, the minimize button, and the trust
badge. This was already flagged as deferred in plan 14 — it's the gateway to the "premium" feel.

**R6. Service-Message confirmations & reminders.** After an in-app action (saved a property, booked a
viewing), push a **template card** into the notice room: "Viewing booked — Sat 3pm, 123 Sukhumvit" +
a pre-visit reminder. Remember the hard rules: action-triggered confirmations/reminders only, ≤5/action,
no promos. For "new listing matches your saved search," use **normal push** (R7), not service messages.

**R7. Saved searches with push** (the Yahoo!不動産 pattern). Persist a user's area/type/budget criteria;
when ingestion creates a matching listing, push a Flex card that deep-links into it. Reuses our userId +
existing push path. (This likely wants the deferred **GSI3** to query listings by criteria efficiently.)

**R8. Persistence polish:** add-to-home-screen shortcut + a vanity path (`miniapp.line.me/<brand>`) +
profile quick-fill to auto-fill contact fields on the booking form.

### Suggested sequencing
1. **R1** (deep links) — a day, pure win, exercises plumbing we already built.
2. **R2 + R3** (sendMessages summary + share) — add `chat_message.write` + share agreement; small app work.
3. **R4** (in-app booking calendar) — reuses PropertyEvent + reminder Lambda.
4. **R5** (verification project) — gates the rest; start the review submission early (lead time).
5. **R6 + R7 + R8** post-verification.

Each should be written up as a numbered plan in `plans/` before implementing (per project convention).

---

## 6. Constraints & gotchas to keep in mind

- **No HTML into chat. Ever.** Flex is the ceiling for in-chat richness (§0).
- **Scopes:** `sendMessages` needs `chat_message.write` (we don't request it yet); `shareTargetPicker`
  needs a per-channel agreement, not a scope. Adding scopes re-triggers the consent screen for users.
- **Verification gates a lot:** service messages, home-screen shortcut, vanity path, consent
  simplification, discovery, profile quick-fill, minimize button — all verified-only.
- **`liff.openWindow()` external-flag behavior differs by LINE version** (respected <14.20, ignored
  14.20–15.19, respected again 15.20+). Test on real devices.
- **No group/room IDs** from `getContext()` since Feb 2023 — can't identify *which* group, only the type.
- **template/flex via `sendMessages` fire no webhook** — use text if the backend must react.
- **Service messages land in a shared system notice room**, not our OA 1:1 thread, and are
  confirmation/reminder-only. For true 1:1 marketing-style push, use the Messaging API (with billing).
- **Unrelated but load-bearing:** none of this touches the extraction schema, so the 16-nullable
  structured-output limit in `claudeExtractor.ts` is not at risk here.

---

## 7. Sources

- LIFF v2 API reference — https://developers.line.biz/en/reference/liff/
- Developing a LIFF app — https://developers.line.biz/en/docs/liff/developing-liff-apps/
- Opening a LIFF app (deep links / `liff.state`) — https://developers.line.biz/en/docs/liff/opening-liff-app/
- LIFF release notes — https://developers.line.biz/en/docs/liff/release-notes/
- MINI App introduction — https://developers.line.biz/en/docs/line-mini-app/discover/introduction/
- Service messages — https://developers.line.biz/en/docs/line-mini-app/develop/service-messages/
- MINI App API reference — https://developers.line.biz/en/reference/line-mini-app/
- Demo flows (reservation/table-order/membership) — https://developers.line.biz/en/docs/line-mini-app/demo/
- LINE/LIFF roadmap (LIFF→MINI App unification, Sept 20 2024) —
  https://developers.line.biz/en/news/2024/?month=09&day=20&article=line-login-liff-roadmap
- Yahoo!不動産 LINE OA — https://realestate.yahoo.co.jp/lineoa/
- LINE Engineering, "Chatbots in Asia" — https://engineering.linecorp.com/en/blog/line-experiences-with-chatbots-in-asia/
- Flex Message background — https://engineering.linecorp.com/en/blog/introducing-flex-message-a-new-message-type-for-line-messaging-api/
- LINE Design System — https://designsystem.line.me/

_Local cached copies of most LINE docs live under `docs/developers.line.biz/en/docs/{liff,line-mini-app}`._
