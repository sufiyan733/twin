import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Always point the client at the correct origin so cookies are scoped right.
  // Falls back to relative paths in dev (where NEXT_PUBLIC_BETTER_AUTH_URL is unset).
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || undefined,

  fetchOptions: {
    // Required for cross-origin cookie sending on HTTPS (Vercel production).
    credentials: "include",
  },

  plugins: [usernameClient()],
});

export const { useSession, signOut, signIn, signUp } = authClient;
