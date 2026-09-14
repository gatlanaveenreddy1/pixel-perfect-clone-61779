import { createServerFn } from "@tanstack/react-start";

const WEBHOOK_URL =
  "https://workflow.ccbp.in/webhook-test/f93cf81b-1ff0-433f-a934-1aa45ee33ad5";

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
    const audioFile =
      item && typeof item === "object" && typeof (item as any).audioFile === "string"
        ? ((item as any).audioFile as string)
        : null;

    if (!audioFile) return { audioFile: null as string | null, error: "No audio returned" };
    return { audioFile, error: null as string | null };
  });
