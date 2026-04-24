import { prisma } from "@/lib/db";
import { getCurrentVideoForCreator } from "@/lib/current-video-store";

type RawStream = Awaited<ReturnType<typeof prisma.stream.findMany>>[number] & {
  _count?: {
    upvotes: number;
  };
  upvotes?: Array<{ id: string }>;
};

export type CreatorProfile = {
  id: string;
  email: string;
  displayName: string;
};

export type SerializedStream = {
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
  upvotes: number;
  hasUpvoted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatorWorkspace = {
  creator: CreatorProfile;
  currentVideo: SerializedStream | null;
  streams: SerializedStream[];
};

function formatCreator(email: string, id: string): CreatorProfile {
  const handle = email.split("@")[0] ?? "creator";
  const displayName = handle
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

  return {
    id,
    email,
    displayName: displayName || "Creator Room",
  };
}

function serializeStream(stream: RawStream): SerializedStream {
  return {
    id: stream.id,
    type: stream.type,
    url: stream.url,
    title: stream.title,
    sThumbnail: stream.sThumbnail,
    mThumbnail: stream.mThumbnail,
    bThumbnail: stream.bThumbnail,
    description: stream.description,
    channel: stream.channel,
    userId: stream.userId,
    active: stream.active,
    extractedId: stream.extractedId,
    upvotes: stream._count?.upvotes ?? 0,
    hasUpvoted: Boolean(stream.upvotes?.length),
    createdAt: stream.createdAt.toISOString(),
    updatedAt: stream.updatedAt.toISOString(),
  };
}

export async function getCreatorWorkspace(
  creatorId: string,
  viewerId?: string | null,
): Promise<CreatorWorkspace | null> {
  const [creator, streams] = await Promise.all([
    prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true, email: true },
    }),
    prisma.stream.findMany({
      where: { userId: creatorId },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        ...(viewerId
          ? {
              upvotes: {
                where: { userId: viewerId },
                select: { id: true },
              },
            }
          : {}),
      },
    }),
  ]);

  if (!creator) {
    return null;
  }

  const serializedStreams = (streams as RawStream[]).map(serializeStream);
  const storedCurrentVideo = getCurrentVideoForCreator(creatorId);
  const dbCurrentVideo =
    serializedStreams.find((stream) => stream.active) ?? null;
  const currentVideo = storedCurrentVideo ?? dbCurrentVideo;
  const queueStreams = serializedStreams
    .filter((stream) => stream.id !== currentVideo?.id)
    .sort((left, right) => {
      if (left.upvotes !== right.upvotes) {
        return right.upvotes - left.upvotes;
      }

      return (
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      );
    });

  return {
    creator: formatCreator(creator.email, creator.id),
    currentVideo,
    streams: queueStreams,
  };
}
