import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app/App.tsx";
import { type ApiClient, ApiError } from "../src/lib/api.ts";
import { DETAIL, makeFixtureApi, NOTES, SAVED, VIEWINGS } from "./fixtures.ts";

// The per-user CRM (Stage 5, Build D — D13) driven through the real <App> router + a fixture api client
// (the injection seam — no LIFF, no network). Covers: the saved tab (cards), the viewings tab (upcoming
// + past sections), save/unsave toggle (optimistic + rollback), create-viewing (picker → POST), notes
// (list + add + empty validation), and the owner edit form (fields render, PATCH on submit, 404 path).
// The frontend gate (e2e) asserts theme/TH-07/contrast on the rendered screens.

function setPath(path: string) {
  window.history.replaceState(null, "", path);
}
function renderAt(path: string, api: ApiClient) {
  setPath(path);
  return render(<App api={api} locale="th" />);
}

beforeEach(() => setPath("/"));

describe("Saved tab", () => {
  it("switching to the saved tab fetches + renders the saved cards", async () => {
    const saved = vi.fn(async () => structuredClone(SAVED));
    renderAt("/", makeFixtureApi({ saved }));
    // The shell + tabs render; tap the saved tab.
    fireEvent.click(screen.getByRole("tab", { name: "บันทึกไว้" }));
    await waitFor(() => expect(document.querySelector("[data-saved-list]")).toBeTruthy());
    expect(saved).toHaveBeenCalled();
    expect(document.querySelectorAll("[data-listing-card]").length).toBe(SAVED.length);
  });

  it("an empty saved set shows the saved empty state (not an error)", async () => {
    renderAt("/", makeFixtureApi({ saved: async () => [] }));
    fireEvent.click(screen.getByRole("tab", { name: "บันทึกไว้" }));
    await waitFor(() => expect(document.querySelector("[data-state='empty-saved']")).toBeTruthy());
  });
});

describe("Viewings tab", () => {
  it("renders the upcoming + past sections with one card per viewing", async () => {
    const viewings = vi.fn(async () => structuredClone(VIEWINGS));
    renderAt("/", makeFixtureApi({ viewings }));
    fireEvent.click(screen.getByRole("tab", { name: "นัดดูทรัพย์" }));

    const upcoming = await waitFor(() => {
      const el = document.querySelector("[data-viewings-section='upcoming']");
      expect(el).toBeTruthy();
      return el as HTMLElement;
    });
    expect(viewings).toHaveBeenCalled();
    const past = document.querySelector("[data-viewings-section='past']") as HTMLElement;
    expect(past).toBeTruthy();
    // Each section carries its viewings; the counts match the fixture split.
    expect(upcoming.querySelectorAll("[data-viewing-card]").length).toBe(VIEWINGS.upcoming.length);
    expect(past.querySelectorAll("[data-viewing-card]").length).toBe(VIEWINGS.past.length);
  });

  it("an empty viewings set shows the viewings empty state", async () => {
    renderAt("/", makeFixtureApi({ viewings: async () => ({ upcoming: [], past: [] }) }));
    fireEvent.click(screen.getByRole("tab", { name: "นัดดูทรัพย์" }));
    await waitFor(() =>
      expect(document.querySelector("[data-state='empty-viewings']")).toBeTruthy(),
    );
  });
});

describe("Save/unsave toggle on the detail screen", () => {
  it("toggles optimistically and POSTs the save", async () => {
    const save = vi.fn(async () => ({ status: "saved" }));
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi({ save }));
    const toggle = await screen.findByRole("button", { name: "บันทึกประกาศนี้" });
    expect(toggle.getAttribute("data-saved")).toBe("false");
    fireEvent.click(toggle);
    // Optimistic: flips immediately, before the promise resolves.
    expect(toggle.getAttribute("data-saved")).toBe("true");
    await waitFor(() => expect(save).toHaveBeenCalledWith(DETAIL.id));
  });

  it("rolls back to unsaved when the save request fails", async () => {
    const save = vi.fn(async () => {
      throw new ApiError(500);
    });
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi({ save }));
    const toggle = await screen.findByRole("button", { name: "บันทึกประกาศนี้" });
    fireEvent.click(toggle);
    // Optimistic flip, then rollback on the rejected request.
    expect(toggle.getAttribute("data-saved")).toBe("true");
    await waitFor(() => expect(toggle.getAttribute("data-saved")).toBe("false"));
  });
});

describe("Create a viewing from the detail screen", () => {
  /** Open the book-viewing form (the idle CTA carries `data-book-viewing`) + return its input. */
  async function openPicker(): Promise<HTMLInputElement> {
    const open = await waitFor(() => {
      const el = document.querySelector(`[data-book-viewing='${DETAIL.id}']`);
      expect(el).toBeTruthy();
      return el as HTMLButtonElement;
    });
    fireEvent.click(open);
    return (await waitFor(() => {
      const el = document.querySelector("[data-viewing-input]");
      expect(el).toBeTruthy();
      return el as HTMLInputElement;
    })) as HTMLInputElement;
  }

  it("opens the picker, validates a future time, and POSTs it", async () => {
    const createViewing = vi.fn(async (_id: string, scheduledAt: string) => ({
      viewingId: "v-new",
      scheduledAt,
      status: "requested",
    }));
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi({ createViewing }));
    const input = await openPicker();
    // A future local datetime (years ahead so it's always > now).
    fireEvent.change(input, { target: { value: "2030-12-31T10:00" } });
    fireEvent.click(screen.getByText("ยืนยันนัดดู"));
    await waitFor(() => expect(createViewing).toHaveBeenCalledOnce());
    // The created confirmation renders.
    await waitFor(() => expect(document.querySelector("[data-viewing-created]")).toBeTruthy());
    // The posted scheduledAt is an absolute ISO string.
    expect(createViewing.mock.calls[0]?.[1]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("blocks a PAST time client-side (no POST) with a field error", async () => {
    const createViewing = vi.fn();
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi({ createViewing }));
    const input = await openPicker();
    fireEvent.change(input, { target: { value: "2000-01-01T10:00" } });
    fireEvent.click(screen.getByText("ยืนยันนัดดู"));
    await waitFor(() => expect(document.querySelector("[data-viewing-error]")).toBeTruthy());
    expect(createViewing).not.toHaveBeenCalled();
  });

  it("maps a server 400 (invalid_time) to a calm field error", async () => {
    const createViewing = vi.fn(async () => {
      throw new ApiError(400);
    });
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi({ createViewing }));
    const input = await openPicker();
    fireEvent.change(input, { target: { value: "2030-12-31T10:00" } });
    fireEvent.click(screen.getByText("ยืนยันนัดดู"));
    await waitFor(() => expect(createViewing).toHaveBeenCalled());
    await waitFor(() => expect(document.querySelector("[data-viewing-error]")).toBeTruthy());
  });
});

describe("Notes on the detail screen", () => {
  it("lists the caller's own notes from the fetch", async () => {
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi());
    await waitFor(() =>
      expect(document.querySelectorAll("[data-note-card]").length).toBe(NOTES.length),
    );
    const firstBody = NOTES[0]?.body ?? "";
    expect(screen.getByText(firstBody)).toBeTruthy();
  });

  it("adds a note (POST), prepending the returned row", async () => {
    const addNote = vi.fn(async (_id: string, body: string) => ({
      id: "n-new",
      body,
      createdAt: "2026-06-14T10:00:00.000Z",
    }));
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi({ addNote }));
    await waitFor(() => expect(document.querySelector("[data-note-input]")).toBeTruthy());
    fireEvent.change(document.querySelector("[data-note-input]") as HTMLTextAreaElement, {
      target: { value: "นัดเจ้าของวันเสาร์" },
    });
    fireEvent.click(screen.getByText("เพิ่มบันทึก"));
    await waitFor(() => expect(addNote).toHaveBeenCalledWith(DETAIL.id, "นัดเจ้าของวันเสาร์"));
    // The new note prepends → one more card than the fetched set.
    await waitFor(() =>
      expect(document.querySelectorAll("[data-note-card]").length).toBe(NOTES.length + 1),
    );
    expect(screen.getByText("นัดเจ้าของวันเสาร์")).toBeTruthy();
  });

  it("blocks an EMPTY note client-side (no POST) with a field error", async () => {
    const addNote = vi.fn();
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi({ addNote }));
    await waitFor(() => expect(document.querySelector("[data-note-input]")).toBeTruthy());
    // input left blank (or whitespace) → the add button validates client-side.
    fireEvent.change(document.querySelector("[data-note-input]") as HTMLTextAreaElement, {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByText("เพิ่มบันทึก"));
    await waitFor(() => expect(document.querySelector("[data-note-error]")).toBeTruthy());
    expect(addNote).not.toHaveBeenCalled();
  });
});

describe("Owner edit surface (/edit/{id})", () => {
  /** The `<input>` inside the labelled field whose label text === `label` (the input is a child of the
   * label, so query it from the label element itself — not its parent, which holds sibling fields). */
  function fieldInput(label: string): HTMLInputElement {
    const labelEl = screen.getByText(label).closest("label") as HTMLLabelElement;
    return labelEl.querySelector("input") as HTMLInputElement;
  }

  it("renders the owner's fields seeded from the listing (sale → priceThb field)", async () => {
    renderAt(`/edit/${DETAIL.id}`, makeFixtureApi());
    await waitFor(() =>
      expect(document.querySelector(`[data-edit-form='${DETAIL.id}']`)).toBeTruthy(),
    );
    // A sale listing exposes the sale-price field (label), not the monthly-rent one.
    expect(screen.getByText("ราคาขาย (บาท)")).toBeTruthy();
    expect(screen.queryByText("ค่าเช่า/เดือน (บาท)")).toBeNull();
    // Seeded from the fixture detail (priceThb 4,800,000; bedrooms 3).
    expect(fieldInput("ราคาขาย (บาท)").value).toBe(String(DETAIL.priceThb));
    expect(fieldInput("ห้องนอน").value).toBe(String(DETAIL.bedrooms));
  });

  it("exposes the monthly-rent field for a RENT listing", async () => {
    const rentDetail = {
      ...structuredClone(DETAIL),
      dealType: "rent" as const,
      priceThb: null,
      monthlyRent: 13_000,
    };
    renderAt(`/edit/${DETAIL.id}`, makeFixtureApi({ listing: async () => rentDetail }));
    await waitFor(() => expect(screen.getByText("ค่าเช่า/เดือน (บาท)")).toBeTruthy());
    expect(screen.queryByText("ราคาขาย (บาท)")).toBeNull();
  });

  it("PATCHes only the CHANGED fields on submit, then shows the saved outcome", async () => {
    const editListing = vi.fn(async (_id: string, _patch: unknown) => ({ status: "updated" }));
    renderAt(`/edit/${DETAIL.id}`, makeFixtureApi({ editListing }));
    await waitFor(() =>
      expect(document.querySelector(`[data-edit-form='${DETAIL.id}']`)).toBeTruthy(),
    );
    fireEvent.change(fieldInput("ห้องนอน"), { target: { value: "4" } });
    fireEvent.click(screen.getByText("บันทึกการแก้ไข"));
    await waitFor(() => expect(editListing).toHaveBeenCalledOnce());
    // Only the changed field is in the patch (bedrooms 3 → 4; nothing else touched).
    expect(editListing.mock.calls[0]?.[1]).toEqual({ bedrooms: 4 });
    await waitFor(() => expect(screen.getByText("บันทึกการแก้ไขแล้ว")).toBeTruthy());
  });

  it("a 404 on PATCH (non-claimant) shows the not-owner message, not the success outcome", async () => {
    const editListing = vi.fn(async () => {
      throw new ApiError(404);
    });
    renderAt(`/edit/${DETAIL.id}`, makeFixtureApi({ editListing }));
    await screen.findByText("แก้ไขประกาศ");
    fireEvent.click(screen.getByText("บันทึกการแก้ไข"));
    await waitFor(() => expect(screen.getByText("บันทึกไม่สำเร็จ")).toBeTruthy());
    expect(screen.getByText("คุณไม่มีสิทธิ์แก้ไขประกาศนี้ หรือประกาศไม่พบ")).toBeTruthy();
    expect(screen.queryByText("บันทึกการแก้ไขแล้ว")).toBeNull();
  });

  it("a transient (500) PATCH failure shows the retry-able error inline, staying on the form", async () => {
    const editListing = vi.fn(async () => {
      throw new ApiError(500);
    });
    renderAt(`/edit/${DETAIL.id}`, makeFixtureApi({ editListing }));
    await screen.findByText("แก้ไขประกาศ");
    fireEvent.click(screen.getByText("บันทึกการแก้ไข"));
    await waitFor(() => expect(screen.getByText("เกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่อีกครั้ง")).toBeTruthy());
    // Still on the form (the save button is present) — not a terminal outcome.
    expect(screen.getByText("บันทึกการแก้ไข")).toBeTruthy();
  });
});

describe("Edit entry points", () => {
  it("the my-listings cards each carry an edit entry → /edit/{id}", async () => {
    renderAt("/", makeFixtureApi());
    await waitFor(() =>
      expect(document.querySelectorAll("[data-edit-listing]").length).toBeGreaterThan(0),
    );
    const first = document.querySelector("[data-edit-listing]") as HTMLButtonElement;
    fireEvent.click(first);
    await waitFor(() => expect(window.location.pathname).toMatch(/^\/edit\//));
  });

  it("the detail screen shows an edit entry for an owned listing (isClaimedByMe)", async () => {
    // The fixture DETAIL is isClaimedByMe: true.
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi());
    await waitFor(() =>
      expect(document.querySelector(`[data-edit-listing='${DETAIL.id}']`)).toBeTruthy(),
    );
  });

  it("the detail screen hides the edit entry for a listing NOT owned by the caller", async () => {
    const notMine = { ...structuredClone(DETAIL), isClaimedByMe: false };
    renderAt(`/p/${DETAIL.id}`, makeFixtureApi({ listing: async () => notMine }));
    await screen.findByRole("heading", { name: DETAIL.headline });
    expect(document.querySelector(`[data-edit-listing='${DETAIL.id}']`)).toBeNull();
  });
});
