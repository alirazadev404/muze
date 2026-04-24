"use client";

import Link from "next/link";
import { ArrowUpRight, Copy, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CurrentVideo,
  DashboardCreator,
  DashboardMode,
} from "@/components/dashboard/types";
import { cn } from "@/lib/utils";

type ShareUrlSectionProps = {
  creator: DashboardCreator;
  mode: DashboardMode;
  nowPlaying: CurrentVideo;
  queueLength: number;
  totalVotes: number;
  onCopyShareUrl: () => Promise<void>;
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

export default function ShareUrlSection({
  creator,
  mode,
  nowPlaying,
  queueLength,
  totalVotes,
  onCopyShareUrl,
}: ShareUrlSectionProps) {
  const isCreatorMode = mode === "creator";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/7 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.5)] backdrop-blur-2xl sm:p-8">
      <div className="grid grid-cols-2 gap-4">
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
                Share this link with listeners so they can preview, submit,
                upvote, and downvote without touching creator-only controls.
              </p>
            </div>
            <div className="rounded-2xl bg-teal-400/12 p-3 text-teal-200">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={onCopyShareUrl}
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
              Creator dashboard: submit, vote, and move any queued video into
              now playing.
            </li>
            <li>Public creator room: submit, upvote, and downvote only.</li>
            <li>
              Every card shows a real video preview so the queue stays readable
              at a glance.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
