export type RoleId = "sde-intern" | "data-analyst" | "frontend-developer";

export type Question = {
  id: string;
  prompt: string;
  seconds: number;
  keywords: string[];
  modelAnswer: string;
};

export type Role = {
  id: RoleId;
  title: string;
  blurb: string;
  level: string;
  questions: Question[];
};

export const ROLES: Role[] = [
  {
    id: "sde-intern",
    title: "SDE Intern",
    blurb: "Data structures, problem solving and clean coding fundamentals.",
    level: "Entry level · 4 questions",
    questions: [
      {
        id: "sde-1",
        prompt: "Tell me about yourself and why software engineering interests you.",
        seconds: 120,
        keywords: ["project", "learn", "build", "team", "code"],
        modelAnswer:
          "I'm a final-year CS student who enjoys turning ideas into working software. Last semester I built a course-scheduling tool in React and Node that ~200 classmates used, which taught me how to handle real users, edge cases and feedback. I'm drawn to engineering because it rewards curiosity: every bug is a small puzzle. I'm now looking for an internship where I can learn from code review and ship production features on a team.",
      },
      {
        id: "sde-2",
        prompt: "Explain the difference between an array and a linked list, and when you'd pick each.",
        seconds: 150,
        keywords: ["memory", "index", "insert", "o(1)", "o(n)", "contiguous", "pointer"],
        modelAnswer:
          "An array stores elements in contiguous memory, so indexing is O(1) but inserting or deleting in the middle is O(n) because elements shift. A linked list stores nodes with pointers, so insertion and deletion at a known position is O(1), but access is O(n) and it costs extra memory per node with poor cache locality. I'd use an array when reads dominate or I need random access, and a linked list when I'm frequently inserting or removing at the ends and don't need indexing.",
      },
      {
        id: "sde-3",
        prompt: "Describe a bug you struggled with. How did you find and fix it?",
        seconds: 150,
        keywords: ["debug", "log", "reproduce", "test", "root cause", "fix"],
        modelAnswer:
          "In a group project our list view randomly dropped items. I first reproduced it reliably by scripting the same sequence of API calls, then added logging around the state updates. The root cause was two concurrent fetches resolving out of order, so a stale response overwrote fresh data. I fixed it by tracking a request id and ignoring responses that were no longer the latest, and added a regression test that fires overlapping requests.",
      },
      {
        id: "sde-4",
        prompt: "How would you design a simple URL shortener?",
        seconds: 180,
        keywords: ["hash", "database", "id", "redirect", "collision", "scale", "cache"],
        modelAnswer:
          "I'd store a mapping of short code to long URL in a database keyed by the code. To create a code I'd take an auto-incrementing id and base62-encode it, which avoids collisions entirely; a random code plus a uniqueness check also works. Reads are a lookup and a 301/302 redirect, and since reads massively outnumber writes I'd cache hot codes in memory. Extras worth mentioning: expiry dates, click analytics and rate limiting on creation.",
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb: "SQL, statistics and turning messy numbers into decisions.",
    level: "Entry / mid · 4 questions",
    questions: [
      {
        id: "da-1",
        prompt: "Walk me through an analysis you ran end to end. What changed because of it?",
        seconds: 150,
        keywords: ["data", "sql", "insight", "stakeholder", "metric", "decision"],
        modelAnswer:
          "I analysed why weekly signups dropped 18%. I pulled events with SQL, segmented by channel and device, and found the drop was almost entirely mobile users on one signup step. I validated it against funnel data, then shared a short dashboard with the product lead. They shipped a fix to the mobile form and signups recovered within two weeks — I kept a monitoring query so we'd catch a repeat early.",
      },
      {
        id: "da-2",
        prompt: "What is the difference between an INNER JOIN and a LEFT JOIN? Give an example where it matters.",
        seconds: 120,
        keywords: ["null", "rows", "match", "left", "inner", "table"],
        modelAnswer:
          "An INNER JOIN returns only rows that match in both tables; a LEFT JOIN returns every row from the left table and fills unmatched right-side columns with NULL. It matters when counting customers with no orders: an INNER JOIN silently drops them and makes retention look better than it is, while a LEFT JOIN keeps them so you can count the NULLs.",
      },
      {
        id: "da-3",
        prompt: "A key metric drops 20% overnight. How do you investigate?",
        seconds: 150,
        keywords: ["segment", "tracking", "compare", "hypothesis", "pipeline", "seasonality"],
        modelAnswer:
          "First I check whether it's real or instrumentation: did a tracking release, pipeline job or data source fail? Then I segment — by region, platform, channel, new vs returning — because a uniform drop suggests measurement while a concentrated drop suggests a product or market cause. I compare against the same weekday last weeks to rule out seasonality, list the plausible hypotheses, and test the cheapest ones first. Finally I write up the finding with the evidence and the confidence level.",
      },
      {
        id: "da-4",
        prompt: "How do you explain a statistically insignificant A/B test result to a non-technical stakeholder?",
        seconds: 120,
        keywords: ["sample", "confidence", "significant", "effect", "decision", "risk"],
        modelAnswer:
          "I'd say we didn't see a difference we can trust — the change we measured is small enough that it could easily be noise given the sample we collected. Then I'd give the practical range: 'the true effect is somewhere between -1% and +2%,' and ask what decision depends on it. If the change is cheap and harmless we can ship it anyway; if it's costly we either run longer to get a tighter range or move on to a bigger bet.",
      },
    ],
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    blurb: "React, browser fundamentals, accessibility and performance.",
    level: "Mid level · 4 questions",
    questions: [
      {
        id: "fe-1",
        prompt: "What's a frontend project you're proud of, and what made it hard?",
        seconds: 150,
        keywords: ["react", "component", "state", "performance", "users", "design"],
        modelAnswer:
          "I rebuilt a booking flow in React that had a 40% drop-off. The hard part was state: four steps, browser back, and a payment step that couldn't be re-submitted. I modelled it as a single reducer with a URL-synced step, so refresh and back worked naturally, and made the payment call idempotent. Drop-off fell to 24% and the code became far easier to test.",
      },
      {
        id: "fe-2",
        prompt: "Explain the difference between useMemo, useCallback and useEffect.",
        seconds: 150,
        keywords: ["render", "memo", "dependency", "side effect", "function", "value"],
        modelAnswer:
          "useMemo caches a computed value between renders, useCallback caches a function identity, and useEffect runs a side effect after render. The first two are performance tools — they matter when a computation is expensive or when a stable identity keeps a memoized child from re-rendering. useEffect is for synchronising with the outside world: subscriptions, timers, imperative DOM work. All three take a dependency array, and getting those dependencies wrong is the usual source of stale-value bugs.",
      },
      {
        id: "fe-3",
        prompt: "How do you make a custom dropdown accessible?",
        seconds: 150,
        keywords: ["keyboard", "aria", "focus", "screen reader", "escape", "role"],
        modelAnswer:
          "Start from a native <select> if the design allows it. If not: the trigger is a button with aria-haspopup and aria-expanded, the list uses role=listbox with role=option children, and the selected option is marked aria-selected. Keyboard support is non-negotiable — arrow keys move the active option, Enter selects, Escape closes and returns focus to the trigger. Focus must be trapped while open and visibly styled, and I'd test the whole thing with a screen reader, not just by reading the spec.",
      },
      {
        id: "fe-4",
        prompt: "A page feels slow on first load. What do you check and fix?",
        seconds: 180,
        keywords: ["bundle", "image", "lazy", "network", "cache", "lighthouse", "render"],
        modelAnswer:
          "I'd measure before guessing: a Lighthouse run plus the network and performance panels to see whether the cost is bytes, requests, or main-thread work. Common wins are code-splitting large routes, deferring third-party scripts, serving properly sized modern-format images with width/height set, and caching static assets aggressively. If it's render cost, I'd look at unnecessary re-renders and long tasks. Then I'd re-measure and track the Core Web Vitals so it doesn't regress.",
      },
    ],
  },
];

export function getRole(id: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}

export type AnswerRecord = {
  questionId: string;
  text: string;
  secondsUsed: number;
};

export type QuestionScore = {
  question: Question;
  answer: AnswerRecord;
  score: number;
  strengths: string[];
  weaknesses: string[];
};

const FILLERS = ["um", "uh", "like", "basically", "stuff", "things"];

export function scoreAnswer(question: Question, answer: AnswerRecord): QuestionScore {
  const text = answer.text.trim();
  const words = text ? text.split(/\s+/) : [];
  const lower = text.toLowerCase();
  const hits = question.keywords.filter((k) => lower.includes(k));
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Depth (0-40)
  let depth = 0;
  if (words.length >= 120) depth = 40;
  else if (words.length >= 80) depth = 34;
  else if (words.length >= 45) depth = 27;
  else if (words.length >= 20) depth = 17;
  else if (words.length > 0) depth = 8;

  if (words.length >= 80) strengths.push("Answered with real depth and detail.");
  if (words.length > 0 && words.length < 45)
    weaknesses.push("Answer was short — add a concrete example and outcome.");
  if (words.length === 0) weaknesses.push("No answer was recorded for this question.");

  // Relevance (0-40)
  const coverage = question.keywords.length ? hits.length / question.keywords.length : 0;
  const relevance = Math.round(coverage * 40);
  if (coverage >= 0.5)
    strengths.push(`Covered key ideas: ${hits.slice(0, 4).join(", ")}.`);
  else {
    const missed = question.keywords.filter((k) => !hits.includes(k)).slice(0, 3);
    weaknesses.push(`Missed expected points such as ${missed.join(", ")}.`);
  }

  // Structure & delivery (0-20)
  let delivery = 10;
  const hasNumbers = /\d/.test(text);
  if (hasNumbers) {
    delivery += 5;
    strengths.push("Backed the answer with specific numbers.");
  }
  const fillerCount = FILLERS.filter((f) => new RegExp(`\\b${f}\\b`).test(lower)).length;
  if (fillerCount >= 2) {
    delivery -= 5;
    weaknesses.push("Some vague filler wording — be more precise.");
  }
  if (words.length >= 30 && /[.!?].+[.!?]/.test(text)) {
    delivery += 5;
    strengths.push("Clear, well-structured delivery.");
  }
  const pace = answer.secondsUsed / question.seconds;
  if (words.length > 0 && pace > 0.98) {
    weaknesses.push("Ran out of time — practise getting to the point sooner.");
  } else if (words.length >= 45 && pace < 0.6) {
    strengths.push("Efficient — a complete answer well inside the time limit.");
  }
  delivery = Math.max(0, Math.min(20, delivery));

  const score = words.length === 0 ? 0 : Math.max(0, Math.min(100, depth + relevance + delivery));

  return { question, answer, score, strengths, weaknesses };
}

export function verdict(score: number) {
  if (score >= 80) return "Strong hire signal";
  if (score >= 65) return "Solid — a little polish needed";
  if (score >= 45) return "Promising, needs practice";
  return "Needs significant preparation";
}
