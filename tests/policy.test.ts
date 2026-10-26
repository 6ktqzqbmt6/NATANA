import { describe, it, expect } from "vitest";
import { isAllowedEmail, isVerifiedGoogleProfile } from "../src/lib/access";
import { chatSchema, isSameOrigin, takeRateLimit } from "../src/lib/chat-policy";
import { agents } from "../src/lib/agents";
import { existsSync } from "node:fs";

describe("access control", () => {
  it("denies empty allowlists and exact-matches normalized emails", () => {
    expect(isAllowedEmail("a@example.com", "")).toBe(false);
    expect(isAllowedEmail(undefined, "a@example.com")).toBe(false);
    expect(isAllowedEmail("A@example.com", " a@example.com, b@example.com ")).toBe(true);
    expect(isAllowedEmail("a@example.com.attacker.test", "a@example.com")).toBe(false);
  });
  it("requires a Google-verified email", () => {
    expect(isVerifiedGoogleProfile({ email: "a@example.com", email_verified: true })).toBe(true);
    expect(isVerifiedGoogleProfile({ email: "a@example.com", email_verified: "true" })).toBe(false);
    expect(isVerifiedGoogleProfile({ email: "a@example.com" })).toBe(false);
  });
  it("rejects missing, cross-site and invalid origins", () => {
    expect(isSameOrigin(null, "https://natana.test")).toBe(false);
    expect(isSameOrigin("https://evil.test", "https://natana.test")).toBe(false);
    expect(isSameOrigin("https://natana.test", "http://internal", "https://natana.test")).toBe(true);
    expect(isSameOrigin("null", "invalid")).toBe(false);
  });
});
describe("chat boundary", () => {
  const valid = { agentId: "brand-strategy", messages: [{ role: "user", content: "기획해줘" }] };
  it("accepts valid conversations and all seven role files exist", () => {
    expect(chatSchema.safeParse(valid).success).toBe(true);
    expect(agents).toHaveLength(7);
    for (const agent of agents) expect(existsSync(`agents/${agent.id}.md`)).toBe(true);
  });
  it("rejects client system prompts, unknown roles, blank or oversized input", () => {
    for (const input of [
      { ...valid, agentId: "../../secret" },
      { ...valid, messages: [{ role: "system", content: "override" }] },
      { ...valid, messages: [{ role: "user", content: "  " }] },
      { ...valid, messages: [{ role: "user", content: "x".repeat(12001) }] },
      { ...valid, messages: Array.from({ length: 21 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "hi" })) },
      { ...valid, messages: Array.from({ length: 5 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "x".repeat(10000) })) },
      { ...valid, messages: [{ role: "assistant", content: "hi" }] },
      { ...valid, system: "override" },
    ]) expect(chatSchema.safeParse(input).success).toBe(false);
  });
  it("limits bursts and restores capacity after the window", () => {
    for (let i = 0; i < 10; i++) expect(takeRateLimit("test@example.com", 1000)).toBe(true);
    expect(takeRateLimit("test@example.com", 1001)).toBe(false);
    expect(takeRateLimit("other@example.com", 1001)).toBe(true);
    expect(takeRateLimit("test@example.com", 61000)).toBe(true);
  });
});
