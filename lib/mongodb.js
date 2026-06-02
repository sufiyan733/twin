import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "twin";

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const options = {
  serverSelectionTimeoutMS: 10000,
};

let cached = globalThis._mongo;

if (!cached || cached.uri !== uri || cached.timeoutMS !== options.serverSelectionTimeoutMS) {
  cached = globalThis._mongo = {
    client: null,
    promise: null,
    uri,
    timeoutMS: options.serverSelectionTimeoutMS,
  };
}

export async function getMongoClient() {
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

export async function getDb() {
  const client = await getMongoClient();
  return client.db(dbName);
}
