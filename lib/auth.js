import "@/lib/dns-fix";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { MongoClient } from "mongodb";

let cachedAuth;

const DEFAULT_TRUSTED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://twin-l3hf.vercel.app",
];

function toOrigin(url) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url.includes("://") ? url : `https://${url}`).origin;
  } catch {
    return null;
  }
}

function getAuthBaseUrl() {
  return (
    toOrigin(process.env.BETTER_AUTH_URL) ||
    toOrigin(process.env.NEXT_PUBLIC_BETTER_AUTH_URL) ||
    toOrigin(process.env.VERCEL_URL)
  );
}

function getTrustedOrigins() {
  return [
    ...DEFAULT_TRUSTED_ORIGINS,
    getAuthBaseUrl(),
    toOrigin(process.env.NEXT_PUBLIC_APP_URL),
    // VERCEL_URL is auto-set by Vercel to the current deployment URL (covers previews too)
    toOrigin(process.env.VERCEL_URL),
    toOrigin(process.env.VERCEL_BRANCH_URL),
  ].filter(Boolean);
}

let authMongoClient;

function getMongoDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalThis._authMongoClient) {
      globalThis._authMongoClient = new MongoClient(uri);
    }
    authMongoClient = globalThis._authMongoClient;
  } else {
    if (!authMongoClient) {
      authMongoClient = new MongoClient(uri);
    }
  }

  return authMongoClient.db(process.env.MONGODB_DB || "twin");
}


export function getAuth() {
  if (!cachedAuth) {
    cachedAuth = betterAuth({
      baseURL: getAuthBaseUrl() || undefined,
      trustedOrigins: getTrustedOrigins(),
      database: mongodbAdapter(getMongoDb()),

      emailAndPassword: {
        enabled: true,
      },

      session: {
        expiresIn: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 24,
        cookieCache: {
          enabled: true,
          maxAge: 60 * 5,
        },
      },

      plugins: [
        username({
          minUsernameLength: 3,
          maxUsernameLength: 20,
        }),
      ],

      advanced: {
        // Fix cookie name mismatch between dev (HTTP) and prod (HTTPS).
        // In production better-auth's sign-in handler auto-detects HTTPS and
        // writes __Secure-better-auth.session_token. useSecureCookies must match
        // that so getSession() reads the cookie under the same name.
        // NODE_ENV is always "production" in Vercel builds and "development" in
        // `next dev`, making it the only reliable signal here.
        cookiePrefix: "better-auth",
        useSecureCookies: process.env.NODE_ENV === "production",
      },
    });
  }

  return cachedAuth;
}

export const auth = {
  handler(request) {
    try {
      return getAuth().handler(request);
    } catch (error) {
      console.error("Auth configuration error:", error);

      return Response.json(
        {
          error: "Auth is not configured.",
        },
        { status: 500 }
      );
    }
  },
};
