import type { CreatorSummary, Streams } from "@/types/streams.types";

export type DashboardMode = "creator" | "viewer";

export type DashboardStream = Streams;

export type DashboardCreator = CreatorSummary;

export type CurrentVideo = Streams | null;

export type VideoPreview = {
  url: string;
  videoId: string;
  title: string;
  channel: string | null;
  description: string | null;
  sThumbnail: string | null;
  mThumbnail: string | null;
  bThumbnail: string | null;
};
