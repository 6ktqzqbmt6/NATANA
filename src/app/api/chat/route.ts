import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authConfigured, authOptions } from "@/lib/auth";
import { isAllowedEmail } from "@/lib/access";
import { chatSchema, isSameOrigin, takeRateLimit } from "@/lib/chat-policy";
import { systemPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_BODY_BYTES = 180000;
const fail = (error: string, status: number) => Response.json({ error }, {
  status, headers: { "Cache-Control": "no-store" },
});

export async function POST(request: Request) {
  if (!authConfigured) return fail("로그인 설정이 필요합니다. 관리자에게 문의해 주세요.", 503);
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return fail("로그인이 필요합니다.", 401);
  if (!isAllowedEmail(session.user.email)) return fail("접근 권한이 없습니다.", 403);
  if (!isSameOrigin(request.headers.get("origin"), request.url, process.env.NEXTAUTH_URL))
    return fail("허용되지 않은 요청입니다.", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return fail("JSON 형식으로 요청해 주세요.", 415);
  if (!takeRateLimit(session.user.email.toLowerCase())) return fail("요청이 많습니다. 1분 후 다시 시도해 주세요.", 429);
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return fail("요청이 너무 큽니다.", 413);

  let input: unknown;
  try {
    // Bound the body even for chunked requests with no Content-Length header.
    const reader = request.body?.getReader();
    if (!reader) return fail("질문을 입력해 주세요.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); return fail("요청이 너무 큽니다.", 413); }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return fail("요청 내용을 확인해 주세요.", 400); }
  const parsed = chatSchema.safeParse(input);
  if (!parsed.success) return fail("질문 또는 대화 길이를 확인해 주세요. 긴 대화는 새로 시작해 주세요.", 400);
  if (!process.env.OPENAI_API_KEY) return fail("AI 연결 설정이 필요합니다. 관리자에게 문의해 주세요.", 503);

  try {
    const prompt = await systemPrompt(parsed.data.agentId);
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000, maxRetries: 0 });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: prompt,
      input: parsed.data.messages,
      max_output_tokens: 2400,
      store: false,
    }, { signal: request.signal });
    const content = response.output_text?.trim();
    if (!content) return fail("답변을 생성하지 못했습니다. 다시 시도해 주세요.", 502);
    return Response.json({ content, truncated: response.status === "incomplete" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // Never return upstream messages, request bodies or credentials to the browser/logs.
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) return fail("AI 사용 한도에 도달했습니다. 잠시 후 다시 시도하거나 관리자에게 문의해 주세요.", 429);
      if (error.status === 401 || error.status === 403 || error.status === 404)
        return fail("AI 연결 설정을 확인해야 합니다. 관리자에게 문의해 주세요.", 503);
    }
    return fail("AI 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.", 502);
  }
}
