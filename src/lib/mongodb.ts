import mongoose from "mongoose";
import { MongoClient, Db } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/builtintech";

const BUILTINTECH_DB_NAME = process.env.MONGODB_DB_NAME || "builtintech";

const INSIDCODE_URI =
  process.env.INSIDCODE_MONGODB_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/insidcode";

const INSIDCODE_DB_NAME = process.env.INSIDCODE_DB_NAME || "insidcode";

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
  // eslint-disable-next-line no-var
  var _insidcodeClientPromise: Promise<MongoClient> | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      dbName: BUILTINTECH_DB_NAME,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("[MongoDB] BuiltInTech mongoose connection failed:", err?.message || err);
        console.error("[MongoDB] URI host:", sanitizedUri(MONGODB_URI));
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
 * Lazy MongoClient for BuiltInTech.
 * Does NOT connect at import time. Connection starts on first actual use.
 * Failures clear the cached promise so the next call retries instead of
 * reusing a rejected promise. Errors propagate to the caller.
 */
function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    global._mongoClientPromise = client.connect().catch((err) => {
      global._mongoClientPromise = undefined;
      console.error(
        "[MongoDB] BuiltInTech client connection failed:",
        err?.message || err
      );
      console.error("[MongoDB] URI host:", sanitizedUri(MONGODB_URI));
      throw err;
    });
  }
  return global._mongoClientPromise;
}

/**
 * Lazy MongoClient for InsidCode.
 * Does NOT connect at import time. Connection starts on first actual use.
 * Failures clear the cached promise so the next call retries.
 * Errors propagate to the caller.
 */
function getInsidcodeClientPromise(): Promise<MongoClient> {
  if (!global._insidcodeClientPromise) {
    const client = new MongoClient(INSIDCODE_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    global._insidcodeClientPromise = client.connect().catch((err) => {
      global._insidcodeClientPromise = undefined;
      console.error(
        "[MongoDB] InsidCode client connection failed:",
        err?.message || err
      );
      console.error("[MongoDB] URI host:", sanitizedUri(INSIDCODE_URI));
      throw err;
    });
  }
  return global._insidcodeClientPromise;
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

export const insidcodeClientPromise: Promise<MongoClient> = {
  then: (onFulfilled, onRejected) =>
    getInsidcodeClientPromise().then(onFulfilled, onRejected),
  catch: (onRejected) => getInsidcodeClientPromise().catch(onRejected),
  finally: (onFinally) => getInsidcodeClientPromise().finally(onFinally),
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>;

/**
 * Access BuiltInTech Database (users, auth, education progress, practice,
 * curriculum, duels, submissions, Elo, Duel Points, leaderboard, history)
 */
export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(BUILTINTECH_DB_NAME);
}

export async function getBuiltInTechDb(): Promise<Db> {
  return getDatabase();
}

/**
 * Access InsidCode Database (questions, problem metadata, starter templates,
 * hidden test cases, difficulty, tags)
 */
export async function getInsidCodeDb(): Promise<Db> {
  const client = await getInsidcodeClientPromise();
  return client.db(INSIDCODE_DB_NAME);
}
