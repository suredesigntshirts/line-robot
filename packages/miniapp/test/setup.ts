import "@testing-library/react";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom has no scroll implementation; the router calls window.scrollTo(0,0) on navigation. Stub it so
// nav-driven tests don't emit a "Not implemented" warning (it's behaviourally a no-op in jsdom anyway).
vi.stubGlobal("scrollTo", () => {});

// Unmount React trees between tests so the jsdom document doesn't leak roots across cases.
afterEach(() => cleanup());
