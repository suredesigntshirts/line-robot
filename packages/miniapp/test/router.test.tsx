import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../src/app/App.tsx";
import type { ApiClient } from "../src/lib/api.ts";
import { DETAIL, MY_LISTINGS, makeFixtureApi } from "./fixtures.ts";

// A fixture api client (the injection seam — no LIFF, no network). The screens render from this.
const fixtureApi: ApiClient = makeFixtureApi();

function setPath(path: string) {
  window.history.replaceState(null, "", path);
}

describe("router (frozen route shapes)", () => {
  beforeEach(() => setPath("/"));

  it("`/` resolves to the my-listings screen and renders the cards", async () => {
    setPath("/");
    render(<App api={fixtureApi} locale="th" />);
    // the account header + tab bar (chrome) render immediately
    expect(screen.getByText("บัญชีของฉัน")).toBeTruthy();
    // after the fetch resolves, the cards appear (one per fixture listing)
    await waitFor(() => {
      expect(document.querySelectorAll("[data-listing-card]").length).toBe(MY_LISTINGS.length);
    });
  });

  it("`/p/{id}` resolves to the detail screen and renders the listing", async () => {
    setPath(`/p/${DETAIL.id}`);
    render(<App api={fixtureApi} locale="th" />);
    await waitFor(() => {
      // the detail headline (the listing's own headline) renders
      expect(screen.getByText(DETAIL.headline)).toBeTruthy();
    });
    // the spec table carries the rooms the api returned
    expect(screen.getByText("3 นอน")).toBeTruthy();
    expect(screen.getByText("2 น้ำ")).toBeTruthy();
  });

  it("`/claim/{id}` resolves to the claim screen (additive route) and renders the review step", async () => {
    setPath(`/claim/${DETAIL.id}`);
    // DETAIL.isClaimedByMe is true in the fixture, so the screen would open at the decide step. Use a
    // not-yet-claimed clone so the review step (with the claim CTA) renders.
    const unclaimedApi: ApiClient = {
      ...fixtureApi,
      listing: async () => ({ ...structuredClone(DETAIL), isClaimedByMe: false }),
    };
    render(<App api={unclaimedApi} locale="th" />);
    await waitFor(() => {
      // The claim screen title + the claim CTA copy (a distinct surface from list/detail).
      expect(screen.getByText("ตรวจสอบประกาศ")).toBeTruthy();
      expect(screen.getByText(/อ้างสิทธิ์ประกาศนี้/)).toBeTruthy();
    });
  });

  it("`/quote/{id}` resolves to the quote-response screen (additive route, Stage 6)", async () => {
    setPath(`/quote/${DETAIL.id}`);
    render(<App api={fixtureApi} locale="th" />);
    await waitFor(() => {
      // The quote screen title + the structured-offer submit CTA (a distinct surface from list/detail).
      expect(screen.getByText("เสนอราคา")).toBeTruthy();
      expect(screen.getByText("ส่งข้อเสนอ")).toBeTruthy();
    });
  });

  it("an unknown path falls back to the list (deep-link safety)", async () => {
    setPath("/totally-unknown");
    render(<App api={fixtureApi} locale="th" />);
    expect(screen.getByText("บัญชีของฉัน")).toBeTruthy();
  });

  it("renders English chrome when the LIFF locale is en", async () => {
    setPath("/");
    render(<App api={fixtureApi} locale="en" />);
    expect(screen.getByText("My account")).toBeTruthy();
  });
});
