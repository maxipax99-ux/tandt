import type { ServiceId } from "./services";

/**
 * Questionnaire question sets, one per service. Edit freely: add, remove or
 * reword questions here and the form and validation follow automatically.
 * Keep `id`s stable once you have live orders (they key the stored answers).
 */

export interface Question {
  id: string;
  label: string;
  hint?: string;
  type: "text" | "textarea" | "date" | "select";
  options?: string[];
  required?: boolean;
  /** Max characters (defaults: text 200, textarea 5000). */
  max?: number;
}

export interface QuestionSet {
  title: string;
  intro: string;
  questions: Question[];
}

const speakerAndEvent: Question[] = [
  { id: "your_name", label: "Your name", type: "text", required: true, max: 100 },
  { id: "event_date", label: "Date of the event", type: "date" },
  { id: "speech_length", label: "How long should it be when spoken?", type: "select", options: ["2–3 minutes", "3–5 minutes", "5–7 minutes", "Not sure — please advise"], required: true },
];

const toneAndLimits: Question[] = [
  { id: "tone", label: "What tone would you like?", hint: "e.g. heartfelt with a few laughs, mostly funny, formal", type: "text", max: 300 },
  { id: "off_limits", label: "Anything we should avoid?", hint: "Topics, people, jokes or stories that are off-limits.", type: "textarea", max: 2000 },
  { id: "anything_else", label: "Anything else we should know?", type: "textarea" },
];

export const QUESTIONNAIRES: Record<ServiceId, QuestionSet> = {
  wedding: {
    title: "Wedding speech questionnaire",
    intro: "Tell us about the couple and your part in their story. Bullet points are perfect: we'll turn them into a speech.",
    questions: [
      ...speakerAndEvent,
      { id: "role", label: "Your role at the wedding", type: "select", options: ["Best man", "Maid / matron of honor", "Parent of the bride", "Parent of the groom", "Other"], required: true },
      { id: "couple_names", label: "The couple's names (and what you call them)", type: "text", required: true, max: 200 },
      { id: "relationship", label: "How do you know them, and for how long?", type: "textarea", required: true },
      { id: "how_they_met", label: "How did the couple meet?", type: "textarea" },
      { id: "stories", label: "Two or three stories you'd love to include", hint: "Funny, touching or telling. A sentence or two each is enough.", type: "textarea", required: true, max: 8000 },
      { id: "qualities", label: "What do you admire about each of them, and about them together?", type: "textarea" },
      { id: "thank_yous", label: "Anyone to thank or mention?", hint: "Hosts, family, people who couldn't be there.", type: "textarea", max: 2000 },
      ...toneAndLimits,
    ],
  },
  eulogy: {
    title: "Eulogy questionnaire",
    intro: "Take your time. Share whatever comes to mind, in any order. You can skip any question, and we'll talk through the rest on our call.",
    questions: [
      { id: "your_name", label: "Your name", type: "text", required: true, max: 100 },
      { id: "their_name", label: "Their full name, and what people called them", type: "text", required: true, max: 200 },
      { id: "relationship", label: "Your relationship to them", type: "text", required: true, max: 200 },
      { id: "service_date", label: "Date of the service", type: "date" },
      { id: "speech_length", label: "How long should the eulogy be?", type: "select", options: ["3–5 minutes", "5–7 minutes", "7–10 minutes", "Not sure — please advise"], required: true },
      { id: "life_outline", label: "An outline of their life", hint: "Where they grew up, work, family, places they lived: whatever feels important.", type: "textarea", max: 8000 },
      { id: "who_they_were", label: "What were they like?", hint: "Three words people would use to describe them, and why.", type: "textarea", required: true },
      { id: "memories", label: "Memories and stories you'd like to share", type: "textarea", required: true, max: 10000 },
      { id: "loves", label: "What did they love?", hint: "People, places, hobbies, sayings, songs, foods.", type: "textarea" },
      { id: "faith", label: "Should the eulogy reflect any faith or cultural traditions?", type: "textarea", max: 2000 },
      { id: "sensitivities", label: "Is there anything we should handle gently or leave out?", type: "textarea", max: 2000 },
      { id: "anything_else", label: "Anything else you'd like us to know?", type: "textarea" },
    ],
  },
  obituary: {
    title: "Obituary questionnaire",
    intro: "Obituaries need a few facts to be exactly right. Please double-check names and dates. You can skip anything that doesn't apply.",
    questions: [
      { id: "your_name", label: "Your name", type: "text", required: true, max: 100 },
      { id: "their_name", label: "Their full name (including any maiden name or nickname)", type: "text", required: true, max: 200 },
      { id: "birth", label: "Date and place of birth", type: "text", max: 200 },
      { id: "death", label: "Date and place of passing", type: "text", max: 200 },
      { id: "publication", label: "Where will it be published, and is there a word limit?", type: "text", max: 300 },
      { id: "life_outline", label: "Life story", hint: "Education, work, military service, places lived, achievements.", type: "textarea", required: true, max: 8000 },
      { id: "personality", label: "What were they like? What did they love?", type: "textarea", required: true },
      { id: "survived_by", label: "Survived by", hint: "Names and relationships, as you'd like them printed.", type: "textarea", max: 3000 },
      { id: "predeceased_by", label: "Predeceased by", type: "textarea", max: 2000 },
      { id: "service_details", label: "Service details", hint: "Date, time, place, and whether it's public or private.", type: "textarea", max: 2000 },
      { id: "donations", label: "In lieu of flowers / donation requests", type: "textarea", max: 1000 },
      { id: "anything_else", label: "Anything else you'd like us to know?", type: "textarea" },
    ],
  },
  other: {
    title: "Occasion speech questionnaire",
    intro: "Tell us about the occasion and the person (or people) you're celebrating.",
    questions: [
      ...speakerAndEvent,
      { id: "occasion", label: "What's the occasion?", hint: "e.g. 40th anniversary, retirement, 50th birthday, quinceañera, bar mitzvah", type: "text", required: true, max: 200 },
      { id: "honoree", label: "Who is being celebrated, and your relationship to them?", type: "textarea", required: true, max: 2000 },
      { id: "audience", label: "Who will be listening?", hint: "Family, colleagues, a mix, roughly how many people.", type: "text", max: 300 },
      { id: "stories", label: "Stories, achievements or moments to include", type: "textarea", required: true, max: 8000 },
      { id: "message", label: "If they remember one thing from your speech, what should it be?", type: "textarea", max: 2000 },
      ...toneAndLimits,
    ],
  },
};

export function maxLength(q: Question): number {
  return q.max ?? (q.type === "textarea" ? 5000 : 200);
}
