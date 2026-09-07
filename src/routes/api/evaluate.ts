import { createFileRoute } from "@tanstack/react-router";
import { evaluatorSystemPrompt } from "@/lib/interviewer-prompt";

type Body = {
  roleTitle?: string;
  transcript?: { role: "user" | "assistant"; content: string }[];
};

const MODEL = "google/gemini-3.7-flash";

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in evaluation");
  return JSON.parse(raw.slice(start, end + 1));
}

export const Route = createFileRoute("/api/evaluate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const roleTitle = body.roleTitle;
        const transcript = body.transcript;
        if (!roleTitle || !Array.isArray(transcript)) {
          return new Response("Invalid request", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const conversation = transcript
          .map((m) => `${m.role === "assistant" ? "INTERVIEWER" : "CANDIDATE"}: ${m.content}`)
          .join("\n\n");

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: MODEL,
            stream: true,
            messages: [
              { role: "system", content: evaluatorSystemPrompt(roleTitle) },
              {
                role: "user",
                content: `Here is the full interview transcript. Return the JSON evaluation only.\n\n${conversation}`,
              },
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          return new Response(detail || "Could not generate the report.", {
            status: upstream.status || 502,
          });
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let text = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content;
              if (typeof delta === "string") text += delta;
            } catch {
              /* ignore partial frames */
            }
          }
        }

        try {
          const parsed = extractJson(text);
          return new Response(JSON.stringify({ ...parsed, role: roleTitle }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response("The report could not be read. Please try again.", { status: 502 });
        }
      },
    },
  },
});
