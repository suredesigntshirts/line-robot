/**
 * Calm placeholder for the additive CRM tabs (saved / viewings) that Build C/D will wire. Not an
 * error — a forward-looking "coming soon" panel so the tab bar (mock-faithful) is present and tappable
 * now, without inventing routes/screens before their build.
 */
import type { Translator } from "@line-robot/ui";

export function ComingSoon({ t }: { t: Translator }) {
  return (
    <div
      className="grid justify-items-center gap-2 px-4 py-12 text-center font-body-th text-text"
      data-th-content
    >
      <span className="text-primary-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </span>
      <div className="font-heading-th font-semibold text-md leading-normal">
        {t("crm.comingSoon")}
      </div>
      <div className="text-base text-text-2 leading-relaxed">{t("crm.comingSoonBody")}</div>
    </div>
  );
}
