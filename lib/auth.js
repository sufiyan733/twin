import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { MongoClient } from "mongodb";

let cachedAuth;

function getMongoDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  const client = new MongoClient(uri);
  return client.db(process.env.MONGODB_DB || "twin");
}

export function getAuth() {
  if (!cachedAuth) {
    cachedAuth = betterAuth({
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
