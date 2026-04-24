"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Disc3, LogOut, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const isLoading = status === "loading";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/12 bg-slate-950/55 px-4 py-3 shadow-[0_14px_50px_rgba(2,6,23,0.32)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Disc3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              MuzeCollab
            </p>
            <p className="text-sm font-medium text-white">
              Creator queue control
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300 md:flex">
          <Radio className="h-3.5 w-3.5 text-teal-200" />
          Live collaborative playback
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button
                asChild
                variant="outline"
                className="hidden h-10 rounded-full border-white/14 bg-white/6 px-4 text-white hover:bg-white/10 sm:inline-flex"
              >
                <Link href="/dashboard">
                  <Sparkles className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="h-10 rounded-full border-white/14 bg-white/6 px-4 text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Button
              disabled={isLoading}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="h-10 rounded-full bg-teal-400 px-4 text-slate-950 hover:bg-teal-300"
            >
              {isLoading ? "Loading" : "Sign in"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
