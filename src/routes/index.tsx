import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, ClipboardCheck, MessageSquareText } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { ROLES, TOTAL_QUESTIONS } from "@/lib/interview-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InterviewPilot — Practise Role-Based Mock Interviews" },
      {
        name: "description",
        content:
          "Pick a role, answer 10 timed interview questions from an AI interviewer, and get a scored report card with strengths, weaknesses and a model answer.",
      },
      { property: "og:title", content: "InterviewPilot — Practise Role-Based Mock Interviews" },
      {
        property: "og:description",
        content:
          "Timed AI mock interviews for SDE Intern, Data Analyst and Frontend Developer roles, with a scored report card at the end.",
      },
    ],
  }),
  component: RolePicker,
});

const STEPS = [
  { icon: MessageSquareText, label: `${TOTAL_QUESTIONS} questions, one at a time` },
  { icon: Clock, label: "Timer on every answer" },
  { icon: ClipboardCheck, label: "Scored report card at the end" },
];

function RolePicker() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step 1 of 3 · Choose your role
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Practise the interview before it counts.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            An AI interviewer asks you {TOTAL_QUESTIONS} role-specific questions, one at a time, on
            the clock. No feedback until the end — then a full report card.
          </p>
          <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
            {STEPS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-accent" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ROLES.map((role) => (
            <Link
              key={role.id}
              to="/interview/$roleId"
              params={{ roleId: role.id }}
              className="surface-card group flex flex-col p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                {role.level}
              </span>
              <h2 className="mt-2 text-xl font-semibold text-card-foreground">{role.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{role.blurb}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {role.focus.map((f) => (
                  <span
                    key={f}
                    className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
              <span className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary">
                Start interview
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
