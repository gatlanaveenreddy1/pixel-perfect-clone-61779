import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { generatePodcast } from "@/lib/podcast.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PodPuff — Turn Any Topic Into a Podcast" },
      {
        name: "description",
        content:
          "Type a topic and generate a friendly, listenable podcast episode in seconds with PodPuff.",
      },
      { property: "og:title", content: "PodPuff — Turn Any Topic Into a Podcast" },
      {
        property: "og:description",
        content:
          "Type a topic and generate a friendly, listenable podcast episode in seconds with PodPuff.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const run = useServerFn(generatePodcast);

  const generate = async () => {
    if (status === "loading" || !topic.trim()) return;
    setStatus("loading");
    setAudioFile(null);
    setScript(null);
    try {
      const result = await run({ data: { text: topic.trim() } });
      if (!result.audioFile && !result.script) {
        setStatus("error");
        return;
      }
      setAudioFile(result.audioFile ?? null);
      setScript(result.script ?? null);
      setStatus("done");
      setTopic("");
    } catch {
      setStatus("error");
    }
  };


  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6"
      style={{ backgroundImage: "var(--gradient-soft)" }}
    >
      <section
        className="w-full max-w-xl rounded-3xl bg-card/80 p-6 backdrop-blur-sm sm:p-10"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <header className="text-center">
          <span className="inline-block rounded-full bg-accent px-4 py-1 text-xs font-semibold tracking-wide text-accent-foreground">
            ✨ instant episodes
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            PodPuff
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Pick a topic, press the button, and we'll whip up a cozy little podcast.
          </p>
        </header>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
        >
          <label htmlFor="topic" className="sr-only">
            Podcast topic
          </label>
          <input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Type podcast topic here..."
            className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-base text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/25"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground transition-colors duration-200 hover:bg-secondary hover:text-secondary-foreground focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-70"
          >
            🔊 Generate Podcast
          </button>
        </form>

        <div className="mt-8 flex min-h-32 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted/60 p-6 text-center">
          {status === "loading" ? (
            <div className="flex flex-col items-center gap-3" aria-live="polite">
              <div className="flex items-center gap-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-3 w-3 animate-pulse rounded-full bg-primary"
                    style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1s" }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Creating podcast... please wait!</p>
            </div>
          ) : status === "done" && (audioFile || script) ? (
            <>
              <p className="text-base font-semibold text-foreground">
                {audioFile
                  ? "🎉 Podcast is ready! Click play to listen"
                  : "🎉 Your podcast script is ready!"}
              </p>
              {audioFile ? (
                <>
                  <audio controls preload="metadata" src={audioFile} className="w-full">
                    Your browser does not support audio playback.
                  </audio>
                  <a
                    href={audioFile}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary underline underline-offset-4"
                  >
                    Open audio in a new tab
                  </a>
                </>
              ) : null}
              {script ? (
                <p className="whitespace-pre-line text-left text-sm text-muted-foreground">
                  {script}
                </p>
              ) : null}
            </>
          ) : status === "error" ? (
            <p className="text-base font-semibold text-destructive">
              Oops! Something went wrong. Please try again
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Podcast will appear here.</p>
          )}
        </div>

      </section>
    </main>
  );
}
