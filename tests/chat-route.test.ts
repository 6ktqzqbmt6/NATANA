import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ session: vi.fn(), create: vi.fn(), configured: true }));
vi.mock("server-only", () => ({}));
vi.mock("next-auth", () => ({ getServerSession: mocks.session }));
vi.mock("@/lib/auth", () => ({ authOptions: {}, get authConfigured() { return mocks.configured; } }));
vi.mock("openai", async (importOriginal) => {
  const original = await importOriginal<typeof import("openai")>();
  return { default: class {
    static APIError = original.default.APIError;
    responses = { create: mocks.create };
  } };
});
import { POST } from "../src/app/api/chat/route";

const payload = { agentId: "brand-strategy", messages: [{ role: "user", content: "포지셔닝을 제안해줘" }] };
function request(body: unknown = payload, origin = "https://natana.test") {
  return new Request("https://natana.test/api/chat", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("ALLOWED_EMAILS", "team@example.com");
  vi.stubEnv("NEXTAUTH_URL", "https://natana.test");
  vi.stubEnv("OPENAI_API_KEY", "test-key-not-real");
  mocks.configured = true;
  mocks.session.mockResolvedValue({ user: { email: "team@example.com" } });
  mocks.create.mockResolvedValue({ output_text: "테스트 답변", status: "completed" });
});
describe("chat API access and model boundary", () => {
  it("denies unconfigured authentication without invoking the model", async () => {
    mocks.configured = false;
    expect((await POST(request())).status).toBe(503);
    expect(mocks.session).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("denies unauthenticated requests", async () => {
    mocks.session.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects previously signed-in users removed from the allowlist", async () => {
    mocks.session.mockResolvedValue({ user: { email: "removed@example.com" } });
    expect((await POST(request())).status).toBe(403);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects cross-site requests", async () => {
    expect((await POST(request(payload, "https://evil.test"))).status).toBe(403);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects invalid roles before invoking the model", async () => {
    expect((await POST(request({ ...payload, agentId: "../../.env" }))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("limits bodies without trusting Content-Length", async () => {
    expect((await POST(request({ ...payload, padding: "x".repeat(180001) }))).status).toBe(413);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("returns an actionable configuration error when no API key is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect((await POST(request())).status).toBe(503);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("loads the selected local role, disables storage and returns only the answer", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ content: "테스트 답변", truncated: false });
    const call = mocks.create.mock.calls[0][0];
    expect(call.instructions).toContain("브랜드 전략 에이전트");
    expect(call.instructions).toContain("웹 검색");
    expect(call.store).toBe(false);
    expect(call.max_output_tokens).toBe(2400);
    expect(call.input).toEqual(payload.messages);
  });
  it("does not leak provider errors or credentials", async () => {
    mocks.create.mockRejectedValue(new Error("sensitive upstream details test-key-not-real"));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("test-key-not-real");
  });
  it("reports output truncation", async () => {
    mocks.create.mockResolvedValue({ output_text: "일부 답변", status: "incomplete" });
    expect((await (await POST(request())).json()).truncated).toBe(true);
  });
});
