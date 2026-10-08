import mongoose from "mongoose";
import { MongoClient, Db } from "mongodb";

function getBuiltInTechUri(): string {
  return (
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/builtintech"
  );
}

function getBuiltInTechDbName(): string {
  return process.env.MONGODB_DB_NAME || "builtintech";
}

function getInsidCodeUri(): string {
  return (
    process.env.INSIDCODE_MONGODB_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/insidcode"
  );
}

function getInsidCodeDbName(): string {
  return process.env.INSIDCODE_DB_NAME || "insidcode";
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
  // eslint-disable-next-line no-var
  var _insidcodeClientPromise: Promise<MongoClient> | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = getBuiltInTechUri();
  const dbName = getBuiltInTechDbName();

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
        console.error("[MongoDB] BuiltInTech mongoose connection failed:", err?.message || err);
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
 * Lazy MongoClient for BuiltInTech.
 * Does NOT connect at import time. Connection starts on first actual use.
 * Failures clear the cached promise so the next call retries instead of
 * reusing a rejected promise. Errors propagate to the caller.
 */
function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const uri = getBuiltInTechUri();
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    global._mongoClientPromise = client.connect().catch((err) => {
      global._mongoClientPromise = undefined;
      console.error(
        "[MongoDB] BuiltInTech client connection failed:",
        err?.message || err
      );
      console.error("[MongoDB] URI host:", sanitizedUri(uri));
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
    const uri = getInsidCodeUri();
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    global._insidcodeClientPromise = client.connect().catch((err) => {
      global._insidcodeClientPromise = undefined;
      console.error(
        "[MongoDB] InsidCode client connection failed:",
        err?.message || err
      );
      console.error("[MongoDB] URI host:", sanitizedUri(uri));
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
  return client.db(getBuiltInTechDbName());
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
  return client.db(getInsidCodeDbName());
}

