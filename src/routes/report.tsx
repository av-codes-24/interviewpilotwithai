import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Lightbulb, RotateCcw, TriangleAlert } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { getRole, verdict, type Report } from "@/lib/interview-data";
import { clearSession, loadSession, type SessionData } from "@/lib/interview-session";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Your Interview Report Card — InterviewPilot" },
      {
        name: "description",
        content:
          "Scores for every answer, two strengths, two weaknesses and a model answer for your weakest response.",
      },
      { property: "og:title", content: "Your Interview Report Card — InterviewPilot" },
      {
        property: "og:description",
        content: "See how your mock interview scored, question by question.",
      },
    ],
  }),
  component: ReportCard,
});

function scoreTone(score: number) {
  if (score >= 7) return "text-[var(--success)]";
  if (score >= 5) return "text-[var(--warning)]";
  return "text-destructive";
}

function ReportCard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <BrandHeader />
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold text-foreground">No interview to report on yet</h1>
          <p className="mt-3 text-muted-foreground">Run a mock interview to get your report card.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Choose a role
          </Link>
        </main>
      </div>
    );
  }

  const role = getRole(session.roleId);
  const report = session.report as Report | undefined;

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader
        right={
          <button
            onClick={() => {
              clearSession();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            New interview
          </button>
        }
      />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step 3 of 3 · Report card
        </span>
        <h1 className="mt-5 text-3xl font-bold text-foreground sm:text-4xl">
          {role?.title ?? "Interview"} mock interview
        </h1>

        {!report ? (
          <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            The scored report couldn't be generated for this interview. Try running it again.
          </p>
        ) : (
          <>
            <section className="surface-card mt-6 flex flex-wrap items-center gap-8 p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overall score
                </p>
                <p className="mt-1 text-5xl font-bold tabular-nums text-primary">
                  {report.overall_score}
                  <span className="text-2xl text-muted-foreground">/10</span>
                </p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Verdict
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {verdict(report.overall_score)}
                </p>
              </div>
            </section>

            <h2 className="mt-10 text-lg font-semibold text-foreground">Score by question</h2>
            <div className="mt-4 space-y-3">
              {report.scores?.map((s) => (
                <article key={s.question_number} className="surface-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                        Question {s.question_number}
                      </p>
                      <p className="mt-1 font-medium text-card-foreground">{s.question}</p>
                    </div>
                    <p className={`shrink-0 text-2xl font-bold tabular-nums ${scoreTone(s.score)}`}>
                      {s.score}
                      <span className="text-sm text-muted-foreground">/10</span>
                    </p>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(0, Math.min(10, s.score)) * 10}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {s.justification}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <section className="surface-card p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-card-foreground">
                  <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden />
                  Strengths
                </h2>
                <ul className="mt-4 space-y-3">
                  {report.strengths?.map((s, i) => (
                    <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="surface-card p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-card-foreground">
                  <TriangleAlert className="h-5 w-5 text-[var(--warning)]" aria-hidden />
                  Weaknesses
                </h2>
                <ul className="mt-4 space-y-3">
                  {report.weaknesses?.map((w, i) => (
                    <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {w}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="surface-card mt-5 border-l-4 border-l-accent p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-card-foreground">
                <Lightbulb className="h-5 w-5 text-accent" aria-hidden />
                Model answer — Question {report.weakest_question_number}
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {report.model_answer}
              </p>
            </section>

            <section className="mt-5 rounded-xl bg-primary p-7">
              <h2 className="text-base font-semibold text-primary-foreground">Final summary</h2>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85">
                {report.final_summary}
              </p>
            </section>
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={() => {
              clearSession();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Practise another role
          </button>
        </div>
      </main>
    </div>
  );
}
