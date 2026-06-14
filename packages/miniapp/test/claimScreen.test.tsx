import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app/App.tsx";
import { type ApiClient, ApiError } from "../src/lib/api.ts";
import { DETAIL, makeFixtureApi } from "./fixtures.ts";

// The claim/publish flow (Stage 5, Build C) driven through the real <App> router at `/claim/{id}` with
// a fixture api client (the injection seam — no LIFF, no network). Asserts the four user-visible paths:
// review → claim → publish; review → claim → keep-private; the 409 concurrent-claim loser message; and
// a generic claim failure. The frontend gate (e2e) asserts theme/TH-07/contrast on the rendered screen.

/** A not-yet-claimed detail (the fixture DETAIL is claimed-by-me; the claim flow starts at review). */
const UNCLAIMED = { ...DETAIL, isClaimedByMe: false };

function setPath(path: string) {
  window.history.replaceState(null, "", path);
}

/** A fixture api with spy-able claim/publish/keepPrivate; `listing` returns an unclaimed detail. */
function makeApi(over: Partial<ApiClient> = {}): ApiClient {
  return makeFixtureApi({ listing: async () => structuredClone(UNCLAIMED), ...over });
}

function renderClaim(api: ApiClient) {
  setPath(`/claim/${DETAIL.id}`);
  return render(<App api={api} locale="th" />);
}

describe("ClaimScreen — review → claim → decide", () => {
  beforeEach(() => setPath("/"));

  it("renders the review step with the step-progress, the structured spec card + a claim CTA", async () => {
    renderClaim(makeApi());
    await waitFor(() => expect(screen.getByText("ตรวจสอบประกาศ")).toBeTruthy());
    // The step-progress indicator: 3 steps, the REVIEW step (index 0) active, the rest pending.
    const stepper = screen.getByRole("navigation", { name: "progress" });
    expect(stepper.getAttribute("data-stepper")).toBe("0");
    expect(
      stepper.querySelector("[data-step-state='active']")?.textContent,
      "the active dot is step 1",
    ).toBe("1");
    // The structured review spec card (FieldList) shows the SCHEMA-PRESENT fields (label + value rows):
    // the headline, the property type, the price, and the bedroom/bathroom counts from the fixture.
    expect(screen.getByText("ชื่อประกาศ")).toBeTruthy();
    expect(screen.getByText(DETAIL.headline)).toBeTruthy();
    expect(screen.getByText("ประเภททรัพย์")).toBeTruthy();
    expect(screen.getByText("บ้านเดี่ยว")).toBeTruthy(); // DETAIL.propertyType = "house"
    expect(screen.getByText("฿4,800,000")).toBeTruthy();
    expect(screen.getByText("3 นอน")).toBeTruthy(); // DETAIL.bedrooms = 3
    expect(screen.getByText("2 น้ำ")).toBeTruthy(); // DETAIL.bathrooms = 2
    // The LEGAL-06 "auto-extracted — verify" banner.
    expect(screen.getByText("บอทดึงข้อมูลอัตโนมัติ")).toBeTruthy();
    // The claim CTA.
    expect(screen.getByText(/อ้างสิทธิ์ประกาศนี้/)).toBeTruthy();
  });

  it("the verify link (S5-7) navigates to the full detail at /p/{id}", async () => {
    renderClaim(makeApi());
    await waitFor(() => screen.getByText(/ดูรายละเอียดทั้งหมด/));
    fireEvent.click(screen.getByText(/ดูรายละเอียดทั้งหมด/));
    // The router pushed the frozen `/p/{id}` detail route and rendered the DetailScreen, identified by
    // its UNIQUE spec-section head "รายละเอียดทรัพย์" (asserted below) — absent on the claim review screen.
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${DETAIL.id}`));
    await waitFor(() => expect(screen.getByText("รายละเอียดทรัพย์")).toBeTruthy());
    // The claim review chrome (the step-progress nav) is gone — we left the claim flow.
    expect(screen.queryByRole("navigation", { name: "progress" })).toBeNull();
  });

  it("claiming advances to the visibility decision (with the group-private boundary copy)", async () => {
    const claim = vi.fn(async () => ({ status: "claimed" }));
    renderClaim(makeApi({ claim }));
    await waitFor(() => screen.getByText(/อ้างสิทธิ์ประกาศนี้/));
    fireEvent.click(screen.getByText(/อ้างสิทธิ์ประกาศนี้/));

    await waitFor(() => expect(screen.getByText("อ้างสิทธิ์สำเร็จแล้ว")).toBeTruthy());
    expect(claim).toHaveBeenCalledWith(DETAIL.id);
    // The publish-vs-private choice; the group-private option carries the spec's mandated boundary copy.
    expect(screen.getByText("เผยแพร่สาธารณะ")).toBeTruthy();
    // exact match: assert the private-option SUBTITLE row specifically (the feature line
    // "เห็นเฉพาะสมาชิกกลุ่มเดิม" is a superstring, so a loose match would pass even if the subtitle dropped).
    expect(screen.getByText("เฉพาะสมาชิกกลุ่มเดิม", { exact: true })).toBeTruthy();
  });

  it("publishing shows the public-success outcome", async () => {
    const publish = vi.fn(async () => ({ status: "published" }));
    renderClaim(makeApi({ publish }));
    await waitFor(() => screen.getByText(/อ้างสิทธิ์ประกาศนี้/));
    fireEvent.click(screen.getByText(/อ้างสิทธิ์ประกาศนี้/));
    await waitFor(() => screen.getByText("เลือกการมองเห็น"));

    fireEvent.click(screen.getByRole("button", { name: /เผยแพร่สาธารณะเลย/ }));
    await waitFor(() => expect(screen.getByText("เผยแพร่สาธารณะแล้ว")).toBeTruthy());
    expect(publish).toHaveBeenCalledWith(DETAIL.id);
  });

  it("keeping group-private shows the private outcome", async () => {
    const keepPrivate = vi.fn(async () => ({ status: "group_private" }));
    renderClaim(makeApi({ keepPrivate }));
    await waitFor(() => screen.getByText(/อ้างสิทธิ์ประกาศนี้/));
    fireEvent.click(screen.getByText(/อ้างสิทธิ์ประกาศนี้/));
    await waitFor(() => screen.getByText("เลือกการมองเห็น"));

    fireEvent.click(screen.getByRole("button", { name: /เก็บไว้เฉพาะกลุ่มก่อน/ }));
    await waitFor(() => expect(screen.getByText("เก็บไว้เฉพาะกลุ่มแล้ว")).toBeTruthy());
    expect(keepPrivate).toHaveBeenCalledWith(DETAIL.id);
  });
});

describe("ClaimScreen — concurrent-claim loser + failures", () => {
  beforeEach(() => setPath("/"));

  it("a 409 claim (someone else won) shows the clear already-claimed message to the loser", async () => {
    const claim = vi.fn(async () => {
      throw new ApiError(409);
    });
    renderClaim(makeApi({ claim }));
    await waitFor(() => screen.getByText(/อ้างสิทธิ์ประกาศนี้/));
    fireEvent.click(screen.getByText(/อ้างสิทธิ์ประกาศนี้/));

    await waitFor(() => expect(screen.getByText("ประกาศนี้ถูกอ้างสิทธิ์แล้ว")).toBeTruthy());
    // The loser is told WHY (another member claimed first) + given a way out — never the publish choice.
    expect(screen.getByText(/ถูกอ้างสิทธิ์โดยสมาชิกกลุ่มท่านอื่น/)).toBeTruthy();
    expect(screen.queryByText("เลือกการมองเห็น")).toBeNull();
  });

  it("a non-409 claim failure shows the generic retry-able failure (not the loser message)", async () => {
    const claim = vi.fn(async () => {
      throw new ApiError(500);
    });
    renderClaim(makeApi({ claim }));
    await waitFor(() => screen.getByText(/อ้างสิทธิ์ประกาศนี้/));
    fireEvent.click(screen.getByText(/อ้างสิทธิ์ประกาศนี้/));

    await waitFor(() => expect(screen.getByText("อ้างสิทธิ์ไม่สำเร็จ")).toBeTruthy());
    expect(screen.queryByText("ประกาศนี้ถูกอ้างสิทธิ์แล้ว")).toBeNull();
  });

  it("re-opening an already-mine listing skips straight to the visibility decision", async () => {
    // isClaimedByMe true → the screen opens at the decide step (claiming again would be a no-op).
    renderClaim(makeApi({ listing: async () => structuredClone(DETAIL) }));
    await waitFor(() => expect(screen.getByText("เลือกการมองเห็น")).toBeTruthy());
    expect(screen.queryByText(/อ้างสิทธิ์ประกาศนี้/)).toBeNull();
  });
});
