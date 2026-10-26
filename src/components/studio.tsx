"use client";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import Markdown from "react-markdown";
import { agents, type AgentId } from "@/lib/agents";

type Message = { role: "user" | "assistant"; content: string };
type Conversation = { messages: Message[]; draft: string; error: string; truncated: boolean };
const empty = (): Conversation => ({ messages: [], draft: "", error: "", truncated: false });
export default function Studio({ email }: { email: string }) {
  const [active, setActive] = useState<AgentId>("brand-strategy");
  const [conversations, setConversations] = useState<Partial<Record<AgentId, Conversation>>>({});
  const [busy, setBusy] = useState<AgentId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const agent = agents.find((item) => item.id === active)!;
  const current = conversations[active] ?? empty();
  function update(id: AgentId, patch: Partial<Conversation>) {
    setConversations((state) => ({ ...state, [id]: { ...(state[id] ?? empty()), ...patch } }));
  }
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [active, current.messages.length, busy]);
  useEffect(() => () => controller.current?.abort(), []);
  function select(id: AgentId) { setActive(id); setMenuOpen(false); setConfirmReset(false); }
  async function send(event?: React.FormEvent) {
    event?.preventDefault();
    const text = current.draft.trim();
    if (!text || pending.current) return;
    if (current.messages.length >= 20) { update(active, { error: "대화가 길어졌습니다. 새 대화를 시작해 주세요." }); return; }
    pending.current = true;
    const id = active;
    const previous = current.messages;
    const next: Message[] = [...previous, { role: "user", content: text }];
    update(id, { messages: next, draft: "", error: "", truncated: false });
    setBusy(id);
    const abort = new AbortController(); controller.current = abort;
    const timer = setTimeout(() => abort.abort(), 55000);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: id, messages: next }), signal: abort.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "답변을 받지 못했습니다.");
      if (typeof result.content !== "string") throw new Error("답변 형식을 확인하지 못했습니다.");
      update(id, { messages: [...next, { role: "assistant", content: result.content }], truncated: result.truncated === true });
    } catch (error) {
      update(id, { messages: previous, draft: text, error: abort.signal.aborted ? "응답 대기를 중단했습니다. 질문을 다시 보내실 수 있습니다." : error instanceof Error ? error.message : "연결을 확인하고 다시 시도해 주세요." });
    } finally { clearTimeout(timer); setBusy(null); pending.current = false; controller.current = null; }
  }
  return <div className="studio">
    <aside className={`sidebar ${menuOpen ? "open" : ""}`} id="agent-navigation">
      <a className="wordmark" href="/" aria-label="NATANA 스튜디오 홈">NATANA<span>BRAND STUDIO</span></a>
      <div className="sidebar-label">YOUR SPECIALISTS <span>07</span></div>
      <nav aria-label="에이전트 선택">{agents.map((item) => <button key={item.id} aria-current={item.id === active ? "page" : undefined} className={`agent-nav ${item.id === active ? "selected" : ""}`} onClick={() => select(item.id)}><span className="nav-number">{item.mark}</span><span>{item.short}</span><span className="nav-arrow" aria-hidden="true">↗</span></button>)}</nav>
      <div className="sidebar-bottom"><span className="team-indicator"><i /> NATANA TEAM</span><span className="email" title={email}>{email}</span><button className="text-button" onClick={() => signOut({ callbackUrl: "/login" })}>로그아웃 <span aria-hidden="true">↗</span></button></div>
    </aside>
    {menuOpen && <button className="menu-scrim" aria-label="에이전트 메뉴 닫기" onClick={() => setMenuOpen(false)} />}
    <main className="workspace">
      <header className="workspace-header"><div className="breadcrumb"><button className="mobile-menu" aria-label="에이전트 메뉴" aria-expanded={menuOpen} aria-controls="agent-navigation" onClick={() => setMenuOpen(!menuOpen)}>☰</button><span>WORKSPACE</span><span className="crumb-divider">/</span><strong>{agent.short}</strong></div><span className="private-badge"><i /> 팀 전용</span></header>
      <section className="agent-heading"><div><div className="eyebrow">{agent.mark} / {agent.tag}</div><h1>{agent.name}</h1><p>{agent.description}</p></div><button className="new-chat" disabled={busy === active || !current.messages.length} onClick={() => setConfirmReset(true)}><span aria-hidden="true">＋</span> 새 대화</button></section>
      {confirmReset && <div className="reset-bar" role="alert">이 역할의 대화를 지울까요?<div><button onClick={() => { update(active, empty()); setConfirmReset(false); }}>지우고 시작</button><button onClick={() => setConfirmReset(false)}>취소</button></div></div>}
      <section className="conversation" aria-label={`${agent.name} 대화`}>
        {!current.messages.length && busy !== active ? <div className="welcome"><div className="welcome-symbol" aria-hidden="true">✳</div><span className="eyebrow">LET’S MAKE SOMETHING MEANINGFUL</span><h2>어떤 생각을<br />함께 발전시켜 볼까요?</h2><p>작은 질문도, 아직 정리되지 않은 아이디어도 좋아요.<br />{agent.short}의 관점으로 함께 풀어갑니다.</p><div className="starters">{agent.starters.map((text) => <button key={text} onClick={() => { update(active, { draft: text, error: "" }); input.current?.focus(); }}><span>{text}</span><span aria-hidden="true">↗</span></button>)}</div><span className="capability-note">텍스트 상담 · 실시간 웹 검색 및 이미지 생성 미지원</span></div> : <div className="messages">{current.messages.map((message, index) => <article key={index} className={`message ${message.role}`}><span className="message-avatar" aria-hidden="true">{message.role === "user" ? "YOU" : "N"}</span><div className="message-body"><div className="message-label">{message.role === "user" ? "나" : agent.name}</div>{message.role === "user" ? <div className="user-text">{message.content}</div> : <div className="markdown"><Markdown components={{ a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>, img: () => null }}>{message.content}</Markdown></div>}</div></article>)}{busy === active && <div className="message assistant" role="status"><span className="message-avatar" aria-hidden="true">N</span><div className="thinking">생각을 정리하고 있습니다<span>…</span></div></div>}<div ref={end} /></div>}
      </section>
      <div className="composer-wrap">{current.error && <p className="chat-error" role="alert">{current.error}</p>}{current.truncated && <p className="chat-error" role="status">답변 길이 한도에 도달했습니다. “이어서 설명해줘”라고 요청할 수 있습니다.</p>}
        <form className="composer" onSubmit={send}><label className="sr-only" htmlFor="message">{agent.name}에게 질문하기</label><textarea ref={input} id="message" rows={2} placeholder={`${agent.short} 에이전트에게 질문해 보세요…`} value={current.draft} maxLength={12000} disabled={busy === active} onChange={(event) => update(active, { draft: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} /><div className="composer-bottom"><span>{current.draft.length.toLocaleString()} / 12,000 <span className="keyboard-hint">· Shift + Enter 줄바꿈</span></span>{busy === active ? <button type="button" className="stop-button" onClick={() => controller.current?.abort()}>중단 ■</button> : <button className="send-button" type="submit" aria-label="메시지 보내기" disabled={!current.draft.trim() || busy !== null}><span aria-hidden="true">↑</span></button>}</div></form>
        <p className="disclaimer">AI 답변은 검토가 필요합니다. 대화는 새로고침 시 초기화되며, 답변을 위해 OpenAI API로 전송됩니다.</p>
      </div>
    </main>
  </div>;
}
