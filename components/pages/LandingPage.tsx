"use client";

import { useState } from "react";
import {
  ArrowRight,
  Disc3,
  Music,
  Play,
  Radio,
  ThumbsUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { redirect } from "next/navigation";

interface Track {
  id: string;
  title: string;
  artist: string;
  upvotes: number;
  userVoted: boolean;
}

interface CreatorSpace {
  id: string;
  name: string;
  description: string;
  followers: number;
  currentTrack: Track;
  tracks: Track[];
  color: string;
}

const creatorSpaces: CreatorSpace[] = [
  {
    id: "1",
    name: "Luna Studios",
    description: "Electronic and ambient sessions for late-night listeners.",
    followers: 24500,
    color: "from-primary to-fuchsia-400",
    currentTrack: {
      id: "1-1",
      title: "Midnight Echoes",
      artist: "Luna Studios",
      upvotes: 342,
      userVoted: false,
    },
    tracks: [
      {
        id: "1-1",
        title: "Midnight Echoes",
        artist: "Luna Studios",
        upvotes: 342,
        userVoted: false,
      },
      {
        id: "1-2",
        title: "Neon Dreams",
        artist: "Luna Studios",
        upvotes: 289,
        userVoted: true,
      },
      {
        id: "1-3",
        title: "Crystal Wave",
        artist: "Luna Studios",
        upvotes: 156,
        userVoted: false,
      },
    ],
  },
  {
    id: "2",
    name: "Urban Beats",
    description: "Sharp, high-energy drops with a community-first pulse.",
    followers: 31200,
    color: "from-primary to-rose-400",
    currentTrack: {
      id: "2-1",
      title: "City Lights",
      artist: "Urban Beats",
      upvotes: 518,
      userVoted: false,
    },
    tracks: [
      {
        id: "2-1",
        title: "City Lights",
        artist: "Urban Beats",
        upvotes: 518,
        userVoted: false,
      },
      {
        id: "2-2",
        title: "Street Flow",
        artist: "Urban Beats",
        upvotes: 401,
        userVoted: false,
      },
      {
        id: "2-3",
        title: "Crown",
        artist: "Urban Beats",
        upvotes: 267,
        userVoted: true,
      },
    ],
  },
  {
    id: "3",
    name: "Folk and Indie",
    description: "Warm acoustic storytelling shaped by listener momentum.",
    followers: 15800,
    color: "from-primary to-cyan-400",
    currentTrack: {
      id: "3-1",
      title: "Golden Hour",
      artist: "Folk and Indie",
      upvotes: 234,
      userVoted: false,
    },
    tracks: [
      {
        id: "3-1",
        title: "Golden Hour",
        artist: "Folk and Indie",
        upvotes: 234,
        userVoted: false,
      },
      {
        id: "3-2",
        title: "Wanderlust",
        artist: "Folk and Indie",
        upvotes: 198,
        userVoted: false,
      },
      {
        id: "3-3",
        title: "Home",
        artist: "Folk and Indie",
        upvotes: 412,
        userVoted: true,
      },
    ],
  },
];

const steps = [
  {
    title: "Join a creator room",
    description:
      "Step into a space that already feels curated, active, and connected to a real audience.",
  },
  {
    title: "Vote with context",
    description:
      "Support the tracks you want next while seeing what the rest of the community is rallying behind.",
  },
  {
    title: "Keep the energy moving",
    description:
      "Creators stay in control, fans stay involved, and every session feels more alive than a static playlist.",
  },
];

export default function LandingPage() {
  const [spaces, setSpaces] = useState<CreatorSpace[]>(creatorSpaces);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    creatorSpaces[0]?.id ?? "",
  );

  const toggleVote = (spaceId: string, trackId: string) => {
    setSpaces((currentSpaces) =>
      currentSpaces.map((space) => {
        if (space.id !== spaceId) {
          return space;
        }

        return {
          ...space,
          currentTrack:
            space.currentTrack.id === trackId
              ? {
                  ...space.currentTrack,
                  upvotes: space.currentTrack.userVoted
                    ? space.currentTrack.upvotes - 1
                    : space.currentTrack.upvotes + 1,
                  userVoted: !space.currentTrack.userVoted,
                }
              : space.currentTrack,
          tracks: space.tracks.map((track) =>
            track.id === trackId
              ? {
                  ...track,
                  upvotes: track.userVoted
                    ? track.upvotes - 1
                    : track.upvotes + 1,
                  userVoted: !track.userVoted,
                }
              : track,
          ),
        };
      }),
    );
  };

  const currentSpace =
    spaces.find((space) => space.id === selectedSpaceId) ?? spaces[0];
  const upcomingTracks = currentSpace
    ? currentSpace.tracks.filter(
        (track) => track.id !== currentSpace.currentTrack.id,
      )
    : [];
  const totalFollowers = spaces.reduce(
    (sum, space) => sum + space.followers,
    0,
  );
  const totalVotes = spaces.reduce(
    (sum, space) =>
      sum +
      space.tracks.reduce((trackSum, track) => trackSum + track.upvotes, 0),
    0,
  );
  const totalTracks = spaces.reduce(
    (sum, space) => sum + space.tracks.length,
    0,
  );

  return (
    <main className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-primary)_24%,black)_0%,transparent_82%)]" />
      <div className="pointer-events-none absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/16 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-64 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />

      <section className="relative px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-sm text-foreground/70 shadow-sm backdrop-blur">
              <Radio className="h-4 w-4 text-primary" />
              Community-led listening for creators who want real feedback
            </div>

            <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Turn passive listeners into a{" "}
              <span className="text-primary">live music community</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/70 sm:text-xl">
              MuzeCollab gives fans a meaningful voice in what plays next, while
              creators keep the room feeling polished, intentional, and alive.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-11 px-5 shadow-lg shadow-primary/20"
              >
                <a href="#creators">
                  Explore Spaces
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 px-5 bg-background/70"
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Active listeners",
                  value: `${Math.round(totalFollowers / 1000)}k+`,
                  icon: Users,
                },
                {
                  label: "Track votes cast",
                  value: totalVotes.toLocaleString(),
                  icon: ThumbsUp,
                },
                {
                  label: "Curated tracks",
                  value: totalTracks.toString(),
                  icon: Disc3,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur"
                >
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <p className="text-2xl font-semibold text-foreground">
                    {value}
                  </p>
                  <p className="text-sm text-foreground/60">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {currentSpace && (
            <Card className="relative overflow-hidden border border-primary/15 bg-background/75 p-0 shadow-2xl shadow-primary/10 backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--color-primary)_18%,black),transparent_42%)]" />
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-transparent" />

              <div className="relative space-y-8 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-foreground/45">
                      Featured room
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-foreground">
                      {currentSpace.name}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-foreground/65">
                      {currentSpace.description}
                    </p>
                  </div>
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${currentSpace.color} text-primary-foreground shadow-lg`}
                  >
                    <Music className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-border/70 bg-card/85 p-5">
                    <p className="text-sm text-foreground/55">Now playing</p>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground">
                      {currentSpace.currentTrack.title}
                    </h3>
                    <p className="mt-1 text-sm text-foreground/60">
                      by {currentSpace.currentTrack.artist}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-foreground/45">
                          Community votes
                        </p>
                        <p className="mt-1 text-3xl font-semibold text-primary">
                          {currentSpace.currentTrack.upvotes}
                        </p>
                      </div>
                      <Button
                        size="lg"
                        onClick={() =>
                          toggleVote(
                            currentSpace.id,
                            currentSpace.currentTrack.id,
                          )
                        }
                        className="h-11 px-4 shadow-lg shadow-primary/20"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {currentSpace.currentTrack.userVoted ? "Voted" : "Vote"}
                      </Button>
                    </div>
                  </div>

                  {/* <div className="rounded-2xl border border-primary/12 bg-primary/8 p-5">
                    <p className="text-sm text-foreground/55">
                      Why it feels better
                    </p>
                    <ul className="mt-4 space-y-4">
                      {[
                        "Fans can influence the queue without hijacking the room.",
                        "Creators get real-time taste signals instead of guesswork.",
                        "Sessions feel premium, social, and more memorable.",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-sm leading-6 text-foreground/75"
                        >
                          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div> */}
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground/55">
                        Queue preview
                      </p>
                      <p className="mt-1 text-lg font-medium text-foreground">
                        Two tracks ready to follow the current mood
                      </p>
                    </div>
                    <div className="hidden items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-xs text-foreground/60 sm:flex">
                      <Play className="h-3.5 w-3.5 text-primary" />
                      Updated live
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {upcomingTracks.map((track, index) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/70 p-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                          0{index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {track.title}
                          </p>
                          <p className="truncate text-sm text-foreground/60">
                            {track.artist}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleVote(currentSpace.id, track.id)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                            track.userVoted
                              ? "border-primary/30 bg-primary/12 text-primary"
                              : "border-border bg-background text-foreground/70 hover:border-primary/25 hover:text-foreground"
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {track.upvotes}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-background p-8 text-center shadow-xl shadow-primary/10 sm:p-12">
          <p className="text-sm uppercase tracking-[0.22em] text-primary">
            Ready to launch a better room?
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold text-foreground sm:text-5xl">
            Create a music space that feels more personal and more premium.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-foreground/70">
            Bring your community into the decision-making without losing your
            creative direction.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => redirect("/login")}
              size="lg"
              className="h-11 px-5 shadow-lg shadow-primary/20"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-primary/15 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_18%,black),transparent_72%)] p-8 shadow-lg shadow-primary/5 sm:p-10">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              A simple loop that keeps music sessions feeling collaborative.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card
                key={step.title}
                className="border border-border/70 bg-background/85 p-6 shadow-sm backdrop-blur"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-foreground/65">
                    {step.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/70 bg-background/75 px-4 py-10 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                MuzeCollab
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground/60">
              Helping creators turn listening sessions into shared experiences.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-foreground/60">
            <a href="#creators" className="transition hover:text-foreground">
              Explore
            </a>
            <a
              href="#how-it-works"
              className="transition hover:text-foreground"
            >
              How it works
            </a>
            <a href="#" className="transition hover:text-foreground">
              Contact
            </a>
          </div>

          <p className="text-sm text-foreground/50">
            Copyright 2026 MuzeCollab
          </p>
        </div>
      </footer>
    </main>
  );
}
