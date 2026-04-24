import CreatorWorkspace from "@/components/dashboard/CreatorWorkspace";
import { authOptions } from "@/lib/auth";
import { getCreatorWorkspace } from "@/lib/stream-data";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function CreatorRoomPage(
  props: { params: Promise<{ creatorId: string }> },
) {
  const { creatorId } = await props.params;
  const session = await getServerSession(authOptions);
  const workspace = await getCreatorWorkspace(creatorId, session?.user.id);

  if (!workspace) {
    notFound();
  }

  return (
    <CreatorWorkspace
      creator={workspace.creator}
      initialCurrentVideo={workspace.currentVideo}
      initialStreams={workspace.streams}
      mode="viewer"
      participantSignedIn={Boolean(session?.user)}
    />
  );
}
