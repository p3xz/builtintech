import mongoose from "mongoose";
import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Ensure reliable DNS resolution for MongoDB Atlas SRV connection strings
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore in environments where setServers is restricted
}

/**
 * Single-database architecture: everything lives in the `insidcode` database.
 *
 * Environment variables:
 *   MONGODB_URI            – Atlas connection string (defaults to INSIDCODE_MONGODB_URI)
 *   MONGODB_DB_NAME        – Database name (defaults to "insidcode")
 *   INSIDCODE_MONGODB_URI  – Legacy alias, used as fallback for MONGODB_URI
 *   INSIDCODE_DB_NAME      – Legacy alias, used as fallback for MONGODB_DB_NAME
 */

function getUri(): string {
  return (
    process.env.MONGODB_URI ||
    process.env.INSIDCODE_MONGODB_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/insidcode"
  );
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
      .catch((err) => {
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
 * Lazy MongoClient for the unified database.
 * Does NOT connect at import time. Connection starts on first actual use.
 * Failures clear the cached promise so the next call retries instead of
 * reusing a rejected promise. Errors propagate to the caller.
 */
function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const uri = getUri();
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    global._mongoClientPromise = client.connect().catch((err) => {
      global._mongoClientPromise = undefined;
      console.error(
        "[MongoDB] Client connection failed:",
        err?.message || err
      );
      console.error("[MongoDB] URI host:", sanitizedUri(uri));
      throw err;
    });
  }
  return global._mongoClientPromise;
}


// Backwards-compatible lazy exports. These behave like promises but do not
// trigger a connection until first awaited/used. Safe to import anywhere.
export const clientPromise: Promise<MongoClient> = {
  then: (onFulfilled, onRejected) =>
    getClientPromise().then(onFulfilled, onRejected),
  catch: (onRejected) => getClientPromise().catch(onRejected),
  finally: (onFinally) => getClientPromise().finally(onFinally),
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>;

// Legacy alias — points to the same single connection
export const insidcodeClientPromise: Promise<MongoClient> = clientPromise;

/**
 * Access the unified database (insidcode).
 * All collections live here: users, questions, submissions, duelrooms,
 * courses, modules, lessons, ranks, achievements, etc.
 */
export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(getDbName());
}

/** @deprecated Use getDatabase() — both point to the same insidcode database */
export async function getBuiltInTechDb(): Promise<Db> {
  return getDatabase();
}

/** Legacy alias — points to the same unified database */
export async function getInsidCodeDb(): Promise<Db> {
  return getDatabase();
}
