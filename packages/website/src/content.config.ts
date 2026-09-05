import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Long-form site copy (about / how-it-works / privacy / terms) as markdown, one file per locale:
 * src/content/pages/{th,en}/{slug}.md → entry id "th/about". Rendered by StaticPage.astro through
 * the `.prose-site` styles. Editing copy = editing markdown, no template changes.
 */
const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** ISO date shown as "last updated" on legal pages. */
    updated: z.string().optional(),
  }),
});

export const collections = { pages };
