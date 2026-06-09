import "@/lib/dns-fix";
import { MongoClient } from "mongodb";

const options = {
  serverSelectionTimeoutMS: 10000,
};

function getMongoConfig() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  return {
    uri,
    dbName: process.env.MONGODB_DB || "twin",
  };
}

export async function getMongoClient() {
  const { uri } = getMongoConfig();
  let cached = globalThis._mongo;

  if (!cached || cached.uri !== uri || cached.timeoutMS !== options.serverSelectionTimeoutMS) {
    cached = globalThis._mongo = {
      client: null,
      promise: null,
      uri,
      timeoutMS: options.serverSelectionTimeoutMS,
    };
  }

  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    const client = new MongoClient(uri, options);
    cached.promise = client.connect();
  }

  cached.client = await cached.promise;
  return cached.client;
}

let indexesCreated = false;

export async function getDb() {
  const { dbName } = getMongoConfig();
  const client = await getMongoClient();
  const db = client.db(dbName);

  if (!indexesCreated) {
    try {
      await db.collection("friendRequests").createIndex(
        { senderId: 1, receiverId: 1 },
        { unique: true }
      );
      await db.collection("friendRequests").createIndex({ receiverId: 1, status: 1 });
      indexesCreated = true;
    } catch (e) {
      console.error("Failed to create indexes", e);
    }
  }

  return db;
}
