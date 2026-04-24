import { formatDistanceToNow } from "date-fns";
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from "@/lib/utils";
import type {
  CurrentVideo,
  DashboardStream,
  VideoPreview,
} from "@/components/dashboard/types";

export function sortDashboardStreams(streams: DashboardStream[]) {
  return [...streams].sort((left, right) => {
    if (left.upvotes !== right.upvotes) {
      return right.upvotes - left.upvotes;
    }

    return (
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
  });
}

export function getNowPlayingStream(currentVideo: CurrentVideo) {
  return currentVideo ?? null;
}

export function getQueuedStreams(streams: DashboardStream[]) {
  return sortDashboardStreams(streams);
}

export function getPreviewThumbnail(
  preview: Pick<VideoPreview, "videoId" | "bThumbnail" | "mThumbnail" | "sThumbnail">,
) {
  return (
    preview.bThumbnail ??
    preview.mThumbnail ??
    preview.sThumbnail ??
    getYouTubeThumbnailUrl(preview.videoId)
  );
}

export function getStreamThumbnail(stream: DashboardStream) {
  return getPreviewThumbnail({
    videoId: stream.extractedId,
    bThumbnail: stream.bThumbnail,
    mThumbnail: stream.mThumbnail,
    sThumbnail: stream.sThumbnail,
  });
}

export function getStreamEmbedUrl(stream: DashboardStream) {
  return getYouTubeEmbedUrl(stream.extractedId);
}

export function getPreviewEmbedUrl(preview: Pick<VideoPreview, "videoId">) {
  return getYouTubeEmbedUrl(preview.videoId);
}

export function getSubmittedLabel(createdAt: string) {
  return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
}

export function buildInlinePreview(url: string): VideoPreview | null {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return null;
  }

  return {
    url,
    videoId,
    title: "Fetching video preview...",
    channel: "YouTube",
    description: "Previewing the submitted track before it enters the queue.",
    sThumbnail: null,
    mThumbnail: null,
    bThumbnail: null,
  };
}
