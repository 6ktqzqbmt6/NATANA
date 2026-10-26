"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
export default function LoginButton({ disabled }: { disabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  return <><button className="google-button" disabled={disabled || loading} onClick={async () => {
    setLoading(true); setError(false);
    try { await signIn("google", { callbackUrl: "/" }); }
    catch { setError(true); setLoading(false); }
  }}><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.3 2.9-7.5ZM12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.7-5.6-4H3v2.7A10 10 0 0 0 12 22ZM6.4 14a6 6 0 0 1 0-4V7.3H3a10 10 0 0 0 0 9.4L6.4 14ZM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.3L6.4 10A6 6 0 0 1 12 6Z"/></svg>{loading ? "연결 중…" : "Google 계정으로 시작하기"}<span aria-hidden="true">↗</span></button>
  {error && <p role="alert">로그인 연결에 실패했습니다. 다시 시도해 주세요.</p>}</>;
}
