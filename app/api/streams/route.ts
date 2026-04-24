import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCreatorWorkspace } from "@/lib/stream-data";
import { extractYouTubeId, getYtDetails } from "@/lib/utils";
import { createStreamSchema } from "@/zod-schemas/streamerSchemas";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json(
      { message: "Sign in to submit videos." },
      { status: 401 },
    );
  }

  try {
    const data = createStreamSchema.parse(await req.json());
    const ytId = extractYouTubeId(data.url);

    if (!ytId) {
      return NextResponse.json(
        { message: "Invalid YouTube URL." },
        { status: 400 },
      );
    }

    const ytDetail = await getYtDetails(ytId);

    if (!ytDetail?.title) {
      return NextResponse.json(
        { message: "Could not fetch YouTube video details." },
        { status: 400 },
      );
    }

    const stream = await prisma.stream.create({
      data: {
        userId: data.streamerId,
        url: data.url,
        extractedId: ytId,
        type: "Youtube",
        title: ytDetail.title,
        channel: ytDetail.channel,
        sThumbnail: ytDetail.sThumbnail,
        mThumbnail: ytDetail.mThumbnail,
        bThumbnail: ytDetail.bThumbnail,
        description: ytDetail.description,
        active: false,
      },
    });

    return NextResponse.json(
      {
        message: "Video added to queue.",
        id: stream.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/streams]:", error);

    return NextResponse.json(
      { message: "Failed to create stream." },
      { status: 400 },
    );
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const session = await getServerSession(authOptions);

  if (!creatorId) {
    return NextResponse.json(
      { message: "creatorId is required." },
      { status: 400 },
    );
  }

  try {
    const workspace = await getCreatorWorkspace(creatorId, session?.user.id);

    if (!workspace) {
      return NextResponse.json(
        { message: "Creator not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("[GET /api/streams]:", error);

    return NextResponse.json(
      { message: "Failed to fetch the creator queue." },
      { status: 500 },
    );
  }
}
