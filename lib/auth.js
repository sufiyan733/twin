import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.MONGODB_DB || "twin");

export const auth = betterAuth({
  database: mongodbAdapter(db),

  // Username + Password auth
  emailAndPassword: {
    enabled: true,
  },

  // 30-day session
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  plugins: [
    username({
      // Enforce unique usernames — no two users can share one
      minUsernameLength: 3,
      maxUsernameLength: 20,
    }),
  ],
});
