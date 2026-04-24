export type Streams = {
  id: string;
  type: string;
  url: string;
  title: string;
  sThumbnail: string | null;
  mThumbnail: string | null;
  bThumbnail: string | null;
  description: string | null;
  channel: string | null;
  userId: string;
  active: boolean;
  extractedId: string;
  hasUpvoted: boolean;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatorSummary = {
  id: string;
  email: string;
  displayName: string;
};

export type StreamsList = {
  currentVideo: Streams | null;
  creator: CreatorSummary;
  streams: Streams[];
};
