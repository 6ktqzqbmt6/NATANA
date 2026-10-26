import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authConfigured, authOptions } from "@/lib/auth";
export const runtime = "nodejs";
const handler = NextAuth(authOptions);
async function guardedHandler(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  if (!authConfigured) return Response.json({ error: "로그인 설정이 필요합니다." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return handler(request, context);
}
export { guardedHandler as GET, guardedHandler as POST };
