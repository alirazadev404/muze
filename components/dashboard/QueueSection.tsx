"use client";

import { ExternalLink, Loader2, PlayCircle, Trash2, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardStream } from "@/components/dashboard/types";
import {
  getStreamThumbnail,
  getSubmittedLabel,
} from "@/components/dashboard/utils";
import { cn } from "@/lib/utils";

type QueueSectionProps = {
  queuedStreams: DashboardStream[];
  isCreatorMode: boolean;
  busyStreamId: string | null;
  onVote: (stream: DashboardStream) => Promise<void>;
  onPlayNow: (streamId: string) => Promise<void>;
  onDelete: (streamId: string) => Promise<void>;
};

export default function QueueSection({
  queuedStreams,
  isCreatorMode,
  busyStreamId,
  onVote,
  onPlayNow,
  onDelete,
}: QueueSectionProps) {
  return (
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
                    onClick={() => void onVote(stream)}
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
                    <>
                      <Button
                        onClick={() => void onPlayNow(stream.id)}
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
                      <Button
                        onClick={() => void onDelete(stream.id)}
                        disabled={busyStreamId === stream.id}
                        variant="outline"
                        className="h-10 rounded-xl border-rose-300/25 bg-rose-400/10 text-rose-100 hover:bg-rose-400/18"
                      >
                        {busyStreamId === stream.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </>
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
              Submit a YouTube URL and it will appear here with the same preview
              treatment used in the player and submission panel.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
