import "@testing-library/react";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount React trees between tests so the jsdom document doesn't leak roots across cases.
afterEach(() => cleanup());
