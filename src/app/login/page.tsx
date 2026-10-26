import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfigured, authOptions } from "@/lib/auth";
import { isAllowedEmail } from "@/lib/access";
import LoginButton from "@/components/login-button";
export const dynamic = "force-dynamic";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = authConfigured ? await getServerSession(authOptions) : null;
  if (isAllowedEmail(session?.user?.email)) redirect("/");
  const { error } = await searchParams;
  return <main className="login-page">
    <section className="login-art" aria-label="NATANA 브랜드 스튜디오">
      <div className="wordmark">NATANA<span>BRAND STUDIO</span></div>
      <div className="login-headline"><span className="eyebrow">A SPACE FOR YOUR NEXT IDEA</span><h1>브랜드의 다음을,<br />함께 만듭니다.</h1><p>하나의 브랜드, 일곱 개의 관점.<br />생각에서 실행까지 이어지는 NATANA의 작업 공간.</p></div>
      <span className="art-caption">NATANA · BEAUTY IN THE MAKING</span>
    </section>
    <section className="login-panel"><div className="login-card">
      <span className="eyebrow">WELCOME TO THE STUDIO</span><h2>좋은 아이디어의 시작</h2><p>승인된 Google 계정으로 로그인하고<br />NATANA의 에이전트와 대화를 시작하세요.</p>
      {error && <div className="notice error" role="alert">{error === "AccessDenied" ? "승인되지 않은 계정입니다. 관리자에게 이메일 등록을 요청해 주세요." : "로그인을 완료하지 못했습니다. 다시 시도하거나 관리자에게 문의해 주세요."}</div>}
      {!authConfigured && <div className="notice" role="status">관리자가 로그인 설정을 준비 중입니다. 설정 완료 후 이용할 수 있습니다.</div>}
      <LoginButton disabled={!authConfigured} />
      <div className="login-note">NATANA 팀 전용 공간입니다.<br />접근 권한은 관리자가 승인한 이메일에만 부여됩니다.</div>
    </div><span className="panel-footer">NATANA INTERNAL WORKSPACE</span></section>
  </main>;
}
