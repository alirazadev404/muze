import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCreatorWorkspace } from "@/lib/stream-data";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const deleteStreamSchema = z.object({
  streamId: z.string().min(1),
});

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json(
      { message: "Unauthenticated user." },
      { status: 401 },
    );
  }

  try {
    const data = deleteStreamSchema.parse(await req.json());
    const stream = await prisma.stream.findUnique({
      where: { id: data.streamId },
      select: { id: true, userId: true },
    });

    if (!stream || stream.userId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only delete videos from your own queue." },
        { status: 403 },
      );
    }

    await prisma.$transaction([
      prisma.upvote.deleteMany({
        where: { streamId: data.streamId },
      }),
      prisma.stream.delete({
        where: { id: data.streamId },
      }),
    ]);

    const workspace = await getCreatorWorkspace(session.user.id, session.user.id);

    return NextResponse.json({
      message: "Video removed from the queue.",
      currentVideo: workspace?.currentVideo ?? null,
      streams: workspace?.streams ?? [],
    });
  } catch (error) {
    console.error("[DELETE /api/streams/delete]:", error);

    return NextResponse.json(
      { message: "Failed to delete the video." },
      { status: 400 },
    );
  }
}
