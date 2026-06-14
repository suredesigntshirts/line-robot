import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn's class-merge helper (canon TECH-07): clsx for conditional classes, tailwind-merge to
 * dedupe conflicting Tailwind utilities so a passed `className` wins over a primitive's default. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
