import { createServerFn } from "@tanstack/react-start";

const WEBHOOK_URL =
  "https://workflow.ccbp.in/webhook/f93cf81b-1ff0-433f-a934-1aa45ee33ad5";

export const generatePodcast = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => {
    if (!input || typeof input.text !== "string" || !input.text.trim()) {
      throw new Error("Please enter a topic");
    }
    return { text: input.text.trim() };
  })
  .handler(async ({ data }) => {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: data.text }),
    });

    if (!res.ok) {
      return { audioFile: null as string | null, error: "Request failed" };
    }

    const raw = await res.text();
    let payload: unknown = null;
    try {
      payload = JSON.parse(raw);
    } catch {
      return { audioFile: null as string | null, error: "Invalid response" };
    }

    const item = Array.isArray(payload) ? payload[0] : payload;
    const obj = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const audioFile = typeof obj["audioFile"] === "string" ? (obj["audioFile"] as string) : null;
    const script = typeof obj["text"] === "string" ? (obj["text"] as string) : null;

    if (!audioFile && !script)
      return { audioFile: null as string | null, script: null as string | null, error: "No result returned" };
    return { audioFile, script, error: null as string | null };
  });
