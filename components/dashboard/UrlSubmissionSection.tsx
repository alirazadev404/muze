"use client";

import { signIn } from "next-auth/react";
import { ListMusic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  DashboardCreator,
  DashboardMode,
  VideoPreview,
} from "@/components/dashboard/types";
import { getPreviewThumbnail } from "@/components/dashboard/utils";

type UrlSubmissionSectionProps = {
  creator: DashboardCreator;
  mode: DashboardMode;
  isAuthenticated: boolean;
  url: string;
  preview: VideoPreview | null;
  previewLoading: boolean;
  submitting: boolean;
  onUrlChange: (value: string) => void;
  onSubmit: () => Promise<void>;
};

export default function UrlSubmissionSection({
  creator,
  mode,
  isAuthenticated,
  url,
  preview,
  previewLoading,
  submitting,
  onUrlChange,
  onSubmit,
}: UrlSubmissionSectionProps) {
  const isCreatorMode = mode === "creator";

  return (
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
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-white/6 px-4 text-sm text-white outline-none transition focus:border-teal-300/40"
          />

          <Button
            onClick={onSubmit}
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
                That gives the creator and the audience context before the track
                joins the live queue.
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
          {isCreatorMode ? "Creator-only playback controls" : "Audience voting only"}
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
  );
}
