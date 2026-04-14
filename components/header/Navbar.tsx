"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const session = useSession();
  return (
    <div className="flex justify-between px-10 py-5">
      <div className="text-blue-600 font-bold">MuzeCollab</div>
      {session.data?.user && (
        <button
          className="bg-red-400 px-2 py-2 rounded-md cursor-pointer"
          onClick={() => signOut()}
        >
          Logout
        </button>
      )}
      {!session.data?.user && (
        <button
          className="bg-blue-400 px-2 py-2 rounded-md cursor-pointer"
          onClick={() => signIn()}
        >
          Sign In
        </button>
      )}
    </div>
  );
}
