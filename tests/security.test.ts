import { describe, expect, it } from "vitest";
import { buildCsp } from "@/lib/csp";
import { escapeHtml } from "@/lib/email";
import { answersSchema } from "@/lib/questionnaire";
import { hashToken, looksLikeToken, newToken } from "@/lib/tokens";
import { checkoutSchema } from "@/lib/validation";

describe("tokens", () => {
  it("are 32 random bytes, stored as sha256", () => {
    const { token, hash } = newToken();
    expect(looksLikeToken(token)).toBe(true);
    expect(hash).toBe(hashToken(token));
    expect(hash).toHaveLength(64);
    expect(newToken().token).not.toBe(token);
  });
});

describe("validation", () => {
  it("rejects unknown services, add-ons and missing consent", () => {
    expect(checkoutSchema.safeParse({ service: "wedding", addOns: [], agree: "on" }).success).toBe(true);
    expect(checkoutSchema.safeParse({ service: "free", addOns: [], agree: "on" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ service: "wedding", addOns: ["discount"], agree: "on" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ service: "wedding", addOns: [] }).success).toBe(false);
  });
  it("questionnaire rejects unknown fields and over-long answers", () => {
    const schema = answersSchema("obituary");
    const base = { your_name: "A", their_name: "B", life_outline: "x", personality: "y", recording_consent: "No, please don't record" };
    expect(schema.safeParse(base).success).toBe(true);
    expect(schema.safeParse({ ...base, evil: "1" }).success).toBe(false);
    expect(schema.safeParse({ ...base, your_name: "x".repeat(101) }).success).toBe(false);
  });
});

describe("csp / escaping", () => {
  it("builds a strict CSP", () => {
    const csp = buildCsp("abc", false);
    expect(csp).toContain("'nonce-abc'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-eval");
  });
  it("escapes html in emails", () => {
    expect(escapeHtml(`<a href="x">'&`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;");
  });
});
