import { z } from "zod";
import { QUESTIONNAIRES, maxLength, type Question } from "@/config/questionnaires";
import type { ServiceId } from "@/config/services";

export const RECORDING_CONSENT: Question = {
  id: "recording_consent",
  label: "May we record the intake call?",
  hint: "Recording is optional and only helps your writer take accurate notes. If you say yes, we'll ask everyone on the call for permission again at the start. Recordings are deleted with your other notes.",
  type: "select",
  options: ["No, please don't record", "Yes, I consent to recording"],
  required: true,
};

export function questionsFor(service: ServiceId): Question[] {
  return [...QUESTIONNAIRES[service].questions, RECORDING_CONSENT];
}

/** Builds the Zod schema for a service's questionnaire from the config. */
export function answersSchema(service: ServiceId) {
  const shape: Record<string, z.ZodType> = {};
  for (const q of questionsFor(service)) {
    let field: z.ZodType;
    if (q.type === "select") {
      field = z.enum(q.options as [string, ...string[]]);
    } else if (q.type === "date") {
      field = z.union([z.iso.date(), z.literal("")]);
    } else {
      const base = z.string().trim().max(maxLength(q), `Please keep this under ${maxLength(q)} characters.`);
      field = q.required ? base.min(1, "This question is required.") : base;
    }
    if (!q.required) field = field.optional();
    shape[q.id] = field;
  }
  return z.object(shape).strict();
}

export function answersFromForm(service: ServiceId, formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const q of questionsFor(service)) {
    const v = formData.get(`a_${q.id}`);
    if (typeof v === "string" && (v !== "" || q.required)) out[q.id] = v;
  }
  return out;
}
