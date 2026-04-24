"use client";

import { signIn, useSession } from "next-auth/react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { toast } from "sonner";
import NowPlayingSection from "@/components/dashboard/NowPlayingSection";
import QueueSection from "@/components/dashboard/QueueSection";
import ShareUrlSection from "@/components/dashboard/ShareUrlSection";
import UrlSubmissionSection from "@/components/dashboard/UrlSubmissionSection";
import type {
  CurrentVideo,
  DashboardCreator,
  DashboardMode,
  DashboardStream,
  VideoPreview,
} from "@/components/dashboard/types";
import {
  buildInlinePreview,
  getNowPlayingStream,
  getQueuedStreams,
} from "@/components/dashboard/utils";

type CreatorWorkspaceProps = {
  creator: DashboardCreator;
  initialCurrentVideo: CurrentVideo;
  initialStreams: DashboardStream[];
  mode: DashboardMode;
  participantSignedIn: boolean;
};

export default function CreatorWorkspace({
  creator,
  initialCurrentVideo,
  initialStreams,
  mode,
  participantSignedIn,
}: CreatorWorkspaceProps) {
  const { data: session, status } = useSession();
  const [currentVideo, setCurrentVideo] =
    useState<CurrentVideo>(initialCurrentVideo);
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

  const nowPlaying = getNowPlayingStream(currentVideo);
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
      setCurrentVideo(data.currentVideo ?? null);
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
        setCurrentVideo(data.currentVideo ?? null);
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

  const handleDelete = async (streamId: string) => {
    setBusyStreamId(streamId);

    try {
      const response = await fetch("/api/streams/delete", {
        method: "DELETE",
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
        throw new Error(data.message ?? "Failed to delete the video.");
      }

      startTransition(() => {
        setCurrentVideo(data.currentVideo ?? null);
        setStreams(data.streams ?? []);
      });

      toast.success(data.message ?? "Video removed from the queue.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete the video.",
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
        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <NowPlayingSection
            creatorDisplayName={creator.displayName}
            mode={mode}
            nowPlaying={nowPlaying}
          />

          <UrlSubmissionSection
            creator={creator}
            mode={mode}
            isAuthenticated={isAuthenticated}
            url={url}
            preview={preview}
            previewLoading={previewLoading}
            submitting={submitting}
            onUrlChange={setUrl}
            onSubmit={handleSubmit}
          />
        </section>

        <QueueSection
          queuedStreams={queuedStreams}
          isCreatorMode={mode === "creator"}
          busyStreamId={busyStreamId}
          onVote={handleVote}
          onPlayNow={handlePlayNow}
          onDelete={handleDelete}
        />
        <ShareUrlSection
          creator={creator}
          mode={mode}
          nowPlaying={nowPlaying}
          queueLength={queuedStreams.length}
          totalVotes={totalVotes}
          onCopyShareUrl={copyShareUrl}
        />
      </div>
    </main>
  );
}
