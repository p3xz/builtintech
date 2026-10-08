import mongoose from "mongoose";
import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Ensure reliable DNS resolution for MongoDB Atlas SRV connection strings
try {
  dns.setDefaultResultOrder?.("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore in environments where setServers is restricted
}

/**
 * Single-database architecture: everything lives in the `insidcode` database.
 */
function getUri(): string {
  const uri =
    process.env.MONGODB_URI ||
    process.env.INSIDCODE_MONGODB_URI ||
    process.env.DATABASE_URL;
  if (!uri) {
    throw new Error(
      "[MongoDB] No connection string configured. Set MONGODB_URI environment variable."
    );
  }
  return uri;
}

function getDbName(): string {
  return (
    process.env.MONGODB_DB_NAME ||
    process.env.INSIDCODE_DB_NAME ||
    "insidcode"
  );
}

function sanitizedUri(uri: string): string {
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:<redacted>@");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = getUri();
  const dbName = getDbName();

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      dbName,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch(async (err) => {
        cached.promise = null;
        console.error("[MongoDB] Mongoose connection failed:", err?.message || err);
        console.error("[MongoDB] URI host:", sanitizedUri(uri));
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

/**
 * Lazy MongoClient for the unified database with automatic direct-node fallback.
 */
function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const uri = getUri();
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    global._mongoClientPromise = client
      .connect()
      .catch(async (err) => {
        global._mongoClientPromise = undefined;
        console.error("[MongoDB] Client connection failed:", err?.message || err);
        console.error("[MongoDB] URI host:", sanitizedUri(uri));
        throw err;
      });
  }
  return global._mongoClientPromise;
}

export const clientPromise: Promise<MongoClient> = {
  then: (onFulfilled, onRejected) =>
    getClientPromise().then(onFulfilled, onRejected),
  catch: (onRejected) => getClientPromise().catch(onRejected),
  finally: (onFinally) => getClientPromise().finally(onFinally),
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>;

export const insidcodeClientPromise: Promise<MongoClient> = clientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(getDbName());
}

export async function getBuiltInTechDb(): Promise<Db> {
  return getDatabase();
}

export async function getInsidCodeDb(): Promise<Db> {
  return getDatabase();
}
