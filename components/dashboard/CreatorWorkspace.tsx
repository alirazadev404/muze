"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  ListMusic,
  Loader2,
  PlayCircle,
  Radio,
  Sparkles,
  TvMinimalPlay,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  DashboardCreator,
  DashboardMode,
  DashboardStream,
  VideoPreview,
} from "@/components/dashboard/types";
import {
  buildInlinePreview,
  getNowPlayingStream,
  getPreviewThumbnail,
  getQueuedStreams,
  getStreamEmbedUrl,
  getStreamThumbnail,
  getSubmittedLabel,
} from "@/components/dashboard/utils";
import { cn } from "@/lib/utils";

type CreatorWorkspaceProps = {
  creator: DashboardCreator;
  initialStreams: DashboardStream[];
  mode: DashboardMode;
  participantSignedIn: boolean;
};

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/12 bg-white/6 p-4 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-300/55">
        {label}
      </p>
      <p className={cn("mt-3 text-3xl font-semibold tracking-tight", accent)}>
        {value}
      </p>
    </div>
  );
}

export default function CreatorWorkspace({
  creator,
  initialStreams,
  mode,
  participantSignedIn,
}: CreatorWorkspaceProps) {
  const { data: session, status } = useSession();
  const [streams, setStreams] = useState(initialStreams);
  const [url, setUrl] = useState("");
  const deferredUrl = useDeferredValue(url);
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyStreamId, setBusyStreamId] = useState<string | null>(null);

  const shareUrl =
    typeof window === "undefined"
      ? `/creator/${creator.id}`
      : `${window.location.origin}/creator/${creator.id}`;

  const nowPlaying = getNowPlayingStream(streams);
  const queuedStreams = getQueuedStreams(streams);
  const totalVotes = streams.reduce((sum, stream) => sum + stream.upvotes, 0);
  const isCreatorMode = mode === "creator";
  const isAuthenticated =
    status === "authenticated" && Boolean(session?.user || participantSignedIn);

  const ensureSignedIn = async () => {
    if (isAuthenticated) {
      return true;
    }

    await signIn("google", {
      callbackUrl:
        typeof window === "undefined"
          ? `/creator/${creator.id}`
          : window.location.href,
    });

    return false;
  };

  const refreshWorkspace = async (quiet = false) => {
    const endpoint = isCreatorMode
      ? "/api/streams/my"
      : `/api/streams?creatorId=${creator.id}`;

    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      if (!quiet) {
        toast.error(data.message ?? "Failed to refresh the queue.");
      }

      return;
    }

    startTransition(() => {
      setStreams(data.streams ?? []);
    });
  };

  const scheduledRefresh = useEffectEvent(() => {
    void refreshWorkspace(true);
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      scheduledRefresh();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!deferredUrl.trim()) {
      setPreview(null);
      setPreviewLoading(false);
      return;
    }

    const inlinePreview = buildInlinePreview(deferredUrl);
    setPreview(inlinePreview);

    if (!inlinePreview) {
      setPreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    setPreviewLoading(true);

    void fetch(`/api/streams/preview?url=${encodeURIComponent(deferredUrl)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Preview failed.");
        }

        setPreview(data.preview);
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return;
        }

        setPreview(inlinePreview);
        toast.error(error.message || "Could not preview that video yet.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setPreviewLoading(false);
        }
      });

    return () => controller.abort();
  }, [deferredUrl]);

  const handleSubmit = async () => {
    if (!(await ensureSignedIn())) {
      return;
    }

    if (!preview) {
      toast.error("Paste a valid YouTube URL first.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/streams", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamerId: creator.id,
          url: preview.url,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to add video.");
      }

      toast.success(data.message ?? "Video added to queue.");
      setUrl("");
      setPreview(null);
      await refreshWorkspace(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add video.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (stream: DashboardStream) => {
    if (!(await ensureSignedIn())) {
      return;
    }

    const endpoint = stream.hasUpvoted
      ? "/api/streams/downvote"
      : "/api/streams/upvote";
    const method = stream.hasUpvoted ? "DELETE" : "POST";
    const voteDelta = stream.hasUpvoted ? -1 : 1;

    startTransition(() => {
      setStreams((currentStreams) =>
        currentStreams.map((currentStream) =>
          currentStream.id === stream.id
            ? {
                ...currentStream,
                upvotes: Math.max(0, currentStream.upvotes + voteDelta),
                hasUpvoted: !currentStream.hasUpvoted,
              }
            : currentStream,
        ),
      );
    });

    setBusyStreamId(stream.id);

    try {
      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamId: stream.id,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Vote failed.");
      }

      await refreshWorkspace(true);
    } catch (error) {
      await refreshWorkspace(true);
      toast.error(error instanceof Error ? error.message : "Vote failed.");
    } finally {
      setBusyStreamId(null);
    }
  };

  const handlePlayNow = async (streamId: string) => {
    setBusyStreamId(streamId);

    try {
      const response = await fetch("/api/streams/currentVideo", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamId,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to change now playing.");
      }

      startTransition(() => {
        setStreams(data.streams ?? []);
      });

      toast.success("Now playing updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to change the current video.",
      );
    } finally {
      setBusyStreamId(null);
    }
  };

  const copyShareUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Creator share link copied.");
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-14 pt-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_32%),radial-gradient(circle_at_18%_24%,rgba(251,146,60,0.16),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(34,211,238,0.16),transparent_20%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(3,7,18,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/6 to-transparent" />

      <div className="relative mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/7 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.5)] backdrop-blur-2xl sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.25fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-teal-200/80">
                <Radio className="h-4 w-4" />
                {isCreatorMode ? "Creator Control Room" : "Audience Room"}
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-300/60">
                  {creator.displayName}
                </p>
                <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  A cinematic queue board for live music collaboration.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300/72 sm:text-lg">
                  {isCreatorMode
                    ? "Run the session from one place, preview every submission before it lands, and move the next video into the spotlight with a single action."
                    : "Vote on what should rise, submit the next great link, and follow the same live queue the creator is curating in real time."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Now playing"
                  value={nowPlaying ? "Live" : "Waiting"}
                  accent="text-teal-300"
                />
                <MetricCard
                  label="Queue depth"
                  value={queuedStreams.length.toString()}
                  accent="text-amber-300"
                />
                <MetricCard
                  label="Votes in room"
                  value={totalVotes.toString()}
                  accent="text-cyan-300"
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-white/12 bg-slate-950/55 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                      Share the room
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      /creator/{creator.id}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300/70">
                      Share this link with listeners so they can preview,
                      submit, upvote, and downvote without touching creator-only
                      controls.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-teal-400/12 p-3 text-teal-200">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={copyShareUrl}
                    className="h-11 flex-1 rounded-xl bg-teal-400 text-slate-950 hover:bg-teal-300"
                  >
                    <Copy className="h-4 w-4" />
                    Copy share link
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 flex-1 rounded-xl border-white/14 bg-white/6 text-white hover:bg-white/10"
                  >
                    <Link href={`/creator/${creator.id}`}>
                      Open public room
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/12 bg-[linear-gradient(135deg,rgba(251,146,60,0.14),rgba(15,23,42,0.86))] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-amber-200/80">
                  Room permissions
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-200/78">
                  <li>
                    Creator dashboard: submit, vote, and move any queued video
                    into now playing.
                  </li>
                  <li>
                    Public creator room: submit, upvote, and downvote only.
                  </li>
                  <li>
                    Every card shows a real video preview so the queue stays
                    readable at a glance.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/7 shadow-[0_24px_90px_rgba(2,6,23,0.42)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  {isCreatorMode
                    ? "Now playing"
                    : `${creator.displayName} live room`}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {nowPlaying?.title ?? "Queue is waiting for the first video"}
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-teal-200">
                <TvMinimalPlay className="h-3.5 w-3.5" />
                {nowPlaying ? "Broadcasting" : "Standby"}
              </div>
            </div>

            {nowPlaying ? (
              <div className="grid gap-6 p-6">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/80 shadow-[0_18px_50px_rgba(2,6,23,0.55)]">
                  <div className="aspect-video">
                    <iframe
                      src={getStreamEmbedUrl(nowPlaying)}
                      title={nowPlaying.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="rounded-[1.6rem] border border-dashed border-white/14 bg-slate-950/50 p-8 text-center">
                  <p className="text-lg font-medium text-white">
                    No video is playing yet.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300/68">
                    Submit the first YouTube URL and it will appear here with a
                    full preview player.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/12 bg-white/7 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.42)] backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    Submit a video
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Preview before it lands in queue
                  </h2>
                </div>
                {previewLoading && (
                  <Loader2 className="h-5 w-5 animate-spin text-teal-200" />
                )}
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4">
                <label
                  htmlFor="video-url"
                  className="text-xs uppercase tracking-[0.28em] text-slate-400"
                >
                  YouTube URL
                </label>
                <input
                  id="video-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-white/6 px-4 text-sm text-white outline-none transition focus:border-teal-300/40"
                />

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-4 h-11 w-full rounded-xl bg-amber-300 text-slate-950 hover:bg-amber-200"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ListMusic className="h-4 w-4" />
                  )}
                  Add to queue
                </Button>
              </div>

              <div className="mt-5">
                {preview ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/62">
                    <div className="aspect-video overflow-hidden border-b border-white/10">
                      <img
                        src={getPreviewThumbnail(preview)}
                        alt={preview.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                            Submission preview
                          </p>
                          <p className="mt-2 text-lg font-semibold text-white">
                            {preview.title}
                          </p>
                        </div>
                        <div className="rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-teal-200">
                          Ready
                        </div>
                      </div>
                      <p className="text-sm text-slate-300/70">
                        {preview.channel ?? "YouTube"}
                      </p>
                      <p className="text-sm leading-7 text-slate-300/66">
                        {preview.description ??
                          "We will attach the full YouTube details when this is submitted."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-white/14 bg-slate-950/45 p-6">
                    <p className="text-base font-medium text-white">
                      The preview panel wakes up as soon as the URL looks valid.
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300/68">
                      That gives the creator and the audience context before the
                      track joins the live queue.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/12 bg-white/7 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.42)] backdrop-blur-2xl">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Queue controls
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {isCreatorMode
                  ? "Creator-only playback controls"
                  : "Audience voting only"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300/70">
                {isCreatorMode
                  ? "The first queued video can be moved into now playing with one click. Everything else stays open for submissions and voting."
                  : "This public room keeps the interface familiar, but only the creator can promote the next video into playback."}
              </p>
              {!isCreatorMode && !isAuthenticated && (
                <Button
                  onClick={() =>
                    signIn("google", {
                      callbackUrl:
                        typeof window === "undefined"
                          ? `/creator/${creator.id}`
                          : window.location.href,
                    })
                  }
                  className="mt-4 h-11 rounded-xl bg-teal-400 text-slate-950 hover:bg-teal-300"
                >
                  Sign in with Google to vote
                </Button>
              )}
            </section>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/12 bg-white/7 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.42)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Live queue
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Animated movement as songs climb toward the spotlight.
              </h2>
            </div>
            <div className="rounded-full border border-cyan-300/24 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-200">
              {queuedStreams.length} waiting videos
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {queuedStreams.length > 0 ? (
              queuedStreams.map((stream, index) => (
                <article
                  key={`${stream.id}-${index}-${stream.upvotes}`}
                  className={cn(
                    "grid gap-5 rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-4 shadow-[0_16px_48px_rgba(2,6,23,0.32)] animate-in fade-in slide-in-from-bottom-4 duration-500 md:grid-cols-[220px_1fr_auto]",
                    index === 0 && "border-amber-300/30 bg-amber-300/8",
                  )}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-900/80">
                    <div className="aspect-video">
                      <img
                        src={getStreamThumbnail(stream)}
                        alt={stream.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300/72">
                        Queue #{index + 1}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300/72">
                        Submitted {getSubmittedLabel(stream.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold text-white">
                        {stream.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-300/72">
                        {stream.channel ?? "YouTube submission"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleVote(stream)}
                        disabled={busyStreamId === stream.id}
                        className={cn(
                          "h-10 rounded-xl",
                          stream.hasUpvoted
                            ? "bg-rose-400 text-slate-950 hover:bg-rose-300"
                            : "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
                        )}
                      >
                        {busyStreamId === stream.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Vote className="h-4 w-4" />
                        )}
                        {stream.hasUpvoted ? "Downvote" : "Upvote"}
                      </Button>

                      {isCreatorMode && (
                        <Button
                          onClick={() => handlePlayNow(stream.id)}
                          disabled={busyStreamId === stream.id}
                          className="h-10 rounded-xl bg-teal-400 text-slate-950 hover:bg-teal-300"
                        >
                          {busyStreamId === stream.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                          Play next
                        </Button>
                      )}

                      <Button
                        asChild
                        variant="outline"
                        className="h-10 rounded-xl border-white/14 bg-white/6 text-white hover:bg-white/10"
                      >
                        <a href={stream.url} target="_blank" rel="noreferrer">
                          Open source
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-row gap-3 md:flex-col md:items-end">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/7 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Votes
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {stream.upvotes}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.6rem] border border-dashed border-white/14 bg-slate-950/45 p-10 text-center">
                <p className="text-lg font-medium text-white">
                  The queue is empty for now.
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300/68">
                  Submit a YouTube URL and it will appear here with the same
                  preview treatment used in the player and submission panel.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
