import type { Streams } from "@/types/streams.types";

type CurrentVideoStore = Map<string, Streams>;

const globalForCurrentVideo = globalThis as unknown as {
  currentVideoStore?: CurrentVideoStore;
};

function getStore() {
  if (!globalForCurrentVideo.currentVideoStore) {
    globalForCurrentVideo.currentVideoStore = new Map<string, Streams>();
  }

  return globalForCurrentVideo.currentVideoStore;
}

export function getCurrentVideoForCreator(creatorId: string) {
  return getStore().get(creatorId) ?? null;
}

export function setCurrentVideoForCreator(creatorId: string, stream: Streams) {
  getStore().set(creatorId, stream);
}

export function clearCurrentVideoForCreator(creatorId: string) {
  getStore().delete(creatorId);
}
