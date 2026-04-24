import CreatorWorkspace from "@/components/dashboard/CreatorWorkspace";
import { authOptions } from "@/lib/auth";
import { getCreatorWorkspace } from "@/lib/stream-data";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/login");
  }

  const workspace = await getCreatorWorkspace(
    session.user.id,
    session.user.id,
  );

  if (!workspace) {
    redirect("/login");
  }

  return (
    <CreatorWorkspace
      creator={workspace.creator}
      initialCurrentVideo={workspace.currentVideo}
      initialStreams={workspace.streams}
      mode="creator"
      participantSignedIn
    />
  );
}
