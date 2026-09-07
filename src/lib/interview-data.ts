export type RoleId = "sde-intern" | "data-analyst" | "frontend-developer";

export type Role = {
  id: RoleId;
  title: string;
  blurb: string;
  focus: string[];
  level: string;
};

export const ROLES: Role[] = [
  {
    id: "sde-intern",
    title: "SDE Intern",
    blurb:
      "Data structures, problem solving and clean coding fundamentals, with a couple of behavioural questions.",
    focus: ["DSA & complexity", "Debugging", "Projects"],
    level: "Entry level",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb:
      "SQL, statistics and the judgement needed to turn messy numbers into decisions stakeholders trust.",
    focus: ["SQL", "Metrics & experiments", "Storytelling"],
    level: "Entry / mid level",
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    blurb:
      "React, browser fundamentals, accessibility and performance, plus how you work with designers.",
    focus: ["React & state", "Accessibility", "Performance"],
    level: "Mid level",
  },
];

export function getRole(id: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}

export const TOTAL_QUESTIONS = 10;
export const SECONDS_PER_QUESTION = 150;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type QuestionScore = {
  question_number: number;
  question: string;
  score: number;
  justification: string;
};

export type Report = {
  role: string;
  scores: QuestionScore[];
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  weakest_question_number: number;
  model_answer: string;
  final_summary: string;
};

export function verdict(overall: number) {
  if (overall >= 8) return "Strong hire signal";
  if (overall >= 6.5) return "Solid — a little polish needed";
  if (overall >= 4.5) return "Promising, needs practice";
  return "Needs significant preparation";
}
