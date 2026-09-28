/**
 * Business details shown around the site. Change the name here if you pick a
 * different one. Values that differ between environments (URLs, keys) live in
 * environment variables instead — see .env.example.
 */
export const SITE = {
  name: "Toast & Tribute",
  tagline: "The right words for the moments that matter",
  description:
    "Personal wedding speeches, eulogies, obituaries and milestone toasts, written with you and ready to deliver.",
  // TODO(owner): replace with your real support address before launch.
  contactEmail: "hello@example.com",
  // TODO(owner): the state/country whose law governs your Terms.
  governingLaw: "[STATE / COUNTRY — TODO]",
  // TODO(owner): legal business name and mailing address for the legal pages.
  legalEntity: "[LEGAL BUSINESS NAME — TODO]",
  mailingAddress: "[MAILING ADDRESS — TODO]",
  /** Days after delivery when stories, drafts and notes are deleted. */
  retentionDays: 90,
  /** Questionnaire link lifetime. */
  questionnaireLinkDays: 14,
  /** Draft review link lifetime. */
  draftLinkDays: 7,
  /** Final delivery link lifetime (the email also carries PDF + DOCX copies). */
  finalLinkDays: 30,
  /** Admin is signed out after this much inactivity. */
  adminIdleMinutes: 30,
  /** Admin must sign in again after this long, however active. */
  adminMaxSessionHours: 12,
} as const;
