/**
 * One-time operational script: create the navigation rich menu, upload its image, and set it as the
 * default for all users. Run it after a deploy when the menu shape or image changes — it's idempotent
 * (it deletes any prior menu with the same name first). It's a data-plane LINE API call, not infra,
 * so it lives outside Pulumi (consistent with the project's manual-ops posture).
 *
 * Usage:
 *   export LINE_CHANNEL_ACCESS_TOKEN="$(cd infra && pulumi config get channelAccessToken)"
 *   # Optional: add the MINI App "Catalog" tab (a uri action). Known only after LIFF registration.
 *   export LIFF_URL="https://liff.line.me/<liffId>"
 *   npm --prefix packages/bot run build        # bundles dist/scripts/setup-rich-menu.mjs
 *   node packages/bot/dist/scripts/setup-rich-menu.mjs <menu-image.(png|jpeg)>
 *
 * The image must be a 2500x843 PNG/JPEG ≤1MB. Its visuals are cosmetic — the tappable tabs are
 * defined by {@link ../src/adapters/line/richMenu}'s bounds, not by the picture. With `LIFF_URL` set
 * the menu gains a fifth "Catalog" tab; without it, the original four tabs.
 */
import { readFileSync } from "node:fs";
import { messagingApi } from "@line/bot-sdk";
import { buildRichMenu } from "../src/adapters/line/richMenu.js";

const MENU_NAME = "line-robot-main";

async function main(): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (token === undefined || token === "") {
    throw new Error(
      'Set LINE_CHANNEL_ACCESS_TOKEN (e.g. `export LINE_CHANNEL_ACCESS_TOKEN="$(cd infra && pulumi config get channelAccessToken)"`).',
    );
  }
  const imagePath = process.argv[2];
  if (imagePath === undefined) {
    throw new Error("Usage: setup-rich-menu <image.(png|jpeg)>  (2500x843, ≤1MB)");
  }
  // The MINI App "Catalog" tab is a uri action; its LIFF URL is only known after registration, so
  // it's injected here (env or 2nd arg) rather than hard-coded. Absent → the original 4-tab menu.
  const liffUrl = process.env.LIFF_URL ?? process.argv[3];

  const client = new messagingApi.MessagingApiClient({ channelAccessToken: token });
  const blob = new messagingApi.MessagingApiBlobClient({ channelAccessToken: token });

  // Idempotency: drop any prior menu(s) with our name so re-runs don't accumulate.
  const existing = await client.getRichMenuList();
  for (const menu of existing.richmenus) {
    if (menu.name === MENU_NAME) {
      await client.deleteRichMenu(menu.richMenuId);
      console.log(`deleted prior rich menu ${menu.richMenuId}`);
    }
  }

  const { richMenuId } = await client.createRichMenu(buildRichMenu({ liffUrl }));
  const contentType = imagePath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  await blob.setRichMenuImage(
    richMenuId,
    new Blob([readFileSync(imagePath)], { type: contentType }),
  );
  await client.setDefaultRichMenu(richMenuId);

  console.log(`✅ rich menu ${richMenuId} created from ${imagePath} and set as the default.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
