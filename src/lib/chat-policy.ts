import { z } from "zod";
import { agentIds } from "./agents";

export const chatSchema = z.object({
  agentId: z.enum(agentIds),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(12000),
  }).strict()).min(1).max(20),
}).strict().superRefine((value, context) => {
  if (value.messages.reduce((total, item) => total + item.content.length, 0) > 40000)
    context.addIssue({ code: "custom", message: "대화가 너무 깁니다. 새 대화를 시작해 주세요." });
  if (value.messages.some((item, index) => item.role !== (index % 2 === 0 ? "user" : "assistant")))
    context.addIssue({ code: "custom", message: "대화 순서가 올바르지 않습니다." });
  if (value.messages.at(-1)?.role !== "user")
    context.addIssue({ code: "custom", message: "마지막 메시지는 사용자 질문이어야 합니다." });
});

// Instance-local burst protection; not a shared quota across Vercel instances.
const windows = new Map<string, { count: number; resetAt: number }>();
export function takeRateLimit(key: string, now = Date.now()) {
  for (const [id, value] of windows) if (value.resetAt <= now) windows.delete(id);
  const existing = windows.get(key);
  if (existing && existing.count >= 10) return false;
  windows.set(key, { count: (existing?.count ?? 0) + 1, resetAt: existing?.resetAt ?? now + 60000 });
  return true;
}

export function isSameOrigin(origin: string | null, requestUrl: string, configuredUrl?: string) {
  if (!origin) return false;
  try { return origin === new URL(configuredUrl || requestUrl).origin; }
  catch { return false; }
}
