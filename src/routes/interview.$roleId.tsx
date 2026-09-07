import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, SendHorizonal, SkipForward, Timer } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import {
  SECONDS_PER_QUESTION,
  TOTAL_QUESTIONS,
  getRole,
  type ChatMessage,
} from "@/lib/interview-data";
import { saveSession } from "@/lib/interview-session";

export const Route = createFileRoute("/interview/$roleId")({
  head: ({ params }) => {
    const role = getRole(params.roleId);
    const title = `${role?.title ?? "Mock"} Interview — InterviewPilot`;
    const description = `Answer ${TOTAL_QUESTIONS} timed ${role?.title ?? "role"} interview questions from an AI interviewer.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  beforeLoad: ({ params }) => {
    if (!getRole(params.roleId)) throw notFound();
  },
  component: InterviewChat,
});

function questionNumberFrom(text: string) {
  const match = [...text.matchAll(/Question\s+(\d{1,2})\s*\/\s*10/gi)].pop();
  return match ? Number(match[1]) : null;
}

function InterviewChat() {
  const { roleId } = Route.useParams();
  const role = getRole(roleId)!;
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [finishing, setFinishing] = useState(false);

  const startedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const finishInterview = useCallback(
    async (transcript: ChatMessage[]) => {
      setFinishing(true);
      saveSession({ roleId: role.id, transcript, finishedAt: Date.now() });
      try {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleTitle: role.title, transcript }),
        });
        if (!res.ok) throw new Error(await res.text());
        const report = await res.json();
        saveSession({ roleId: role.id, transcript, report, finishedAt: Date.now() });
      } catch {
        setError("Your report card couldn't be generated. Showing what we have.");
      }
      navigate({ to: "/report" });
    },
    [navigate, role.id, role.title],
  );

  const send = useCallback(
    async (userText: string | null) => {
      if (busy) return;
      setError(null);
      setBusy(true);
      const next: ChatMessage[] = userText
        ? [...messagesRef.current, { role: "user", content: userText }]
        : [...messagesRef.current];
      if (userText) setMessages(next);
      setInput("");

      try {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleTitle: role.title,
            messages: next.length
              ? next
              : [{ role: "user", content: "I'm ready to begin the interview." }],
          }),
        });
        if (!res.ok || !res.body) throw new Error(await res.text());

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setStreaming(acc);
        }
        setStreaming("");
        const withReply: ChatMessage[] = [...next, { role: "assistant", content: acc }];
        setMessages(withReply);

        const asked = questionNumberFrom(acc);
        if (asked) {
          setCurrent(asked);
          setSecondsLeft(SECONDS_PER_QUESTION);
        }
        if (!asked && /report card/i.test(acc)) {
          void finishInterview(withReply);
          return;
        }
      } catch (e) {
        setError(
          e instanceof Error && e.message
            ? "The interviewer couldn't respond. Please try again."
            : "Something went wrong.",
        );
      } finally {
        setBusy(false);
        setTimeout(() => inputRef.current?.focus(), 40);
      }
    },
    [busy, finishInterview, role.title],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void send(null);
  }, [send]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    if (!current || busy || finishing) return;
    if (secondsLeft <= 0) {
      void send("(No answer — I ran out of time on this question.)");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, current, busy, finishing, send]);

  const progress = Math.min(100, (Math.max(current, 1) / TOTAL_QUESTIONS) * 100);
  const low = secondsLeft <= 30;
  const mm = String(Math.floor(Math.max(secondsLeft, 0) / 60)).padStart(1, "0");
  const ss = String(Math.max(secondsLeft, 0) % 60).padStart(2, "0");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BrandHeader
        right={
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              {role.title}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-sm font-semibold tabular-nums ${
                low ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"
              }`}
            >
              <Timer className="h-4 w-4" aria-hidden />
              {mm}:{ss}
            </span>
          </div>
        }
      />

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Step 2 of 3 · Interview</span>
            <span>
              Question {Math.max(current, 1)} of {TOTAL_QUESTIONS}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-8">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.content} />
          ))}
          {streaming && <Bubble role="assistant" text={streaming} />}
          {busy && !streaming && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {finishing ? "Marking your interview…" : "The interviewer is thinking…"}
            </div>
          )}
          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-card">
        <form
          className="mx-auto flex max-w-3xl items-end gap-3 px-6 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) void send(input.trim());
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            autoFocus
            disabled={busy || finishing}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) void send(input.trim());
              }
            }}
            rows={2}
            placeholder="Type your answer… (Enter to send, Shift+Enter for a new line)"
            className="min-h-[56px] flex-1 resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
          />
          <button
            type="button"
            disabled={busy || finishing}
            onClick={() => void send("I'd like to skip this question.")}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <SkipForward className="h-4 w-4" aria-hidden />
            Skip
          </button>
          <button
            type="submit"
            disabled={busy || finishing || !input.trim()}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <SendHorizonal className="h-4 w-4" aria-hidden />
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
          {text}
        </p>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
        AI
      </span>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</div>
    </div>
  );
}
