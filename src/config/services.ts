/**
 * Services, add-ons and prices.
 *
 * This is the ONE place to change what you sell and what it costs.
 * Prices are in US cents (19900 = $199.00). The server always reads prices
 * from here when creating a Stripe Checkout session — prices sent from the
 * browser are never trusted.
 */

export type ServiceId = "wedding" | "eulogy" | "obituary" | "other";
export type AddOnId = "rush" | "coaching" | "extra_revision";
export type Mood = "celebration" | "memorial";

export interface Service {
  id: ServiceId;
  name: string;
  shortName: string;
  description: string;
  examples: string;
  priceCents: number;
  deliveryBusinessDays: number;
  mood: Mood;
}

export interface AddOn {
  id: AddOnId;
  name: string;
  description: string;
  /** Either a fixed price in cents, or a percentage of the base service price. */
  pricing: { type: "fixed"; cents: number } | { type: "percentOfBase"; percent: number };
}

export const SERVICES: Record<ServiceId, Service> = {
  wedding: {
    id: "wedding",
    name: "Wedding speech",
    shortName: "Wedding speech",
    description: "A heartfelt, funny-in-the-right-places toast for the best man, maid of honor, or a parent.",
    examples: "Best man, maid of honor, father or mother of the bride or groom",
    priceCents: 19900,
    deliveryBusinessDays: 5,
    mood: "celebration",
  },
  eulogy: {
    id: "eulogy",
    name: "Eulogy",
    shortName: "Eulogy",
    description: "A gentle, honest tribute that captures who they were, ready for you to read aloud.",
    examples: "Funeral, memorial service, celebration of life",
    priceCents: 24900,
    deliveryBusinessDays: 3,
    mood: "memorial",
  },
  obituary: {
    id: "obituary",
    name: "Obituary",
    shortName: "Obituary",
    description: "A clear, loving obituary ready for the newspaper, funeral home, or online memorial page.",
    examples: "Newspaper notice, funeral home website, online memorial",
    priceCents: 17900,
    deliveryBusinessDays: 3,
    mood: "memorial",
  },
  other: {
    id: "other",
    name: "Other occasions",
    shortName: "Occasion speech",
    description: "A personal speech or toast for the other milestones worth marking.",
    examples: "Anniversary, retirement, milestone birthday, quinceañera, bar or bat mitzvah",
    priceCents: 14900,
    deliveryBusinessDays: 5,
    mood: "celebration",
  },
};

export const ADD_ONS: Record<AddOnId, AddOn> = {
  rush: {
    id: "rush",
    name: "Rush delivery (24–48 hours)",
    description: "Your draft within 48 hours of receiving your questionnaire and holding the intake call.",
    pricing: { type: "percentOfBase", percent: 50 },
  },
  coaching: {
    id: "coaching",
    name: "Delivery coaching call (20 min)",
    description: "Practice out loud with us and get tips on pacing, pauses, and nerves.",
    pricing: { type: "fixed", cents: 7500 },
  },
  extra_revision: {
    id: "extra_revision",
    name: "Extra revision round",
    description: "A second round of edits on top of the one already included.",
    pricing: { type: "fixed", cents: 4900 },
  },
};

export const SERVICE_IDS = Object.keys(SERVICES) as ServiceId[];
export const ADD_ON_IDS = Object.keys(ADD_ONS) as AddOnId[];

/** Hours a rush order has, counted from when the questionnaire arrives. */
export const RUSH_HOURS = 48;

/** Revision rounds included with every order (before add-ons). */
export const INCLUDED_REVISIONS = 1;

export const EVERY_ORDER_INCLUDES = [
  "A questionnaire to gather your stories",
  "A 15-minute intake call",
  "One complete draft",
  "One round of edits",
] as const;
