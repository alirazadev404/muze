"use client";

import { TvMinimalPlay } from "lucide-react";
import type { CurrentVideo, DashboardMode } from "@/components/dashboard/types";
import { getStreamEmbedUrl } from "@/components/dashboard/utils";

type NowPlayingSectionProps = {
  creatorDisplayName: string;
  mode: DashboardMode;
  nowPlaying: CurrentVideo;
};

export default function NowPlayingSection({
  creatorDisplayName,
  mode,
  nowPlaying,
}: NowPlayingSectionProps) {
  const isCreatorMode = mode === "creator";

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/7 shadow-[0_24px_90px_rgba(2,6,23,0.42)] backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            {isCreatorMode ? "Now playing" : `${creatorDisplayName} live room`}
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
              Submit the first YouTube URL and it will appear here with a full
              preview player.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
