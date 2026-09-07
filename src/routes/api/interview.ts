import { createFileRoute } from "@tanstack/react-router";
import { interviewerSystemPrompt } from "@/lib/interviewer-prompt";

type Body = {
  roleTitle?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
};

const MODEL = "google/gemini-3.7-flash";

export const Route = createFileRoute("/api/interview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const roleTitle = body.roleTitle;
        const messages = body.messages;
        if (!roleTitle || !Array.isArray(messages)) {
          return new Response("Invalid request", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

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
            messages: [{ role: "system", content: interviewerSystemPrompt(roleTitle) }, ...messages],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          return new Response(detail || "The interviewer is unavailable right now.", {
            status: upstream.status || 502,
          });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
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
                    if (typeof delta === "string" && delta)
                      controller.enqueue(encoder.encode(delta));
                  } catch {
                    /* ignore partial frames */
                  }
                }
              }
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
