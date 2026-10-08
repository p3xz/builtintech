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

const DIRECT_REPLICA_URI =
  "mongodb://namishnakul_db_user:7DeYcyTGs2AfIXv4@ac-rrsi1xy-shard-00-00.znbgedq.mongodb.net:27017,ac-rrsi1xy-shard-00-01.znbgedq.mongodb.net:27017,ac-rrsi1xy-shard-00-02.znbgedq.mongodb.net:27017/insidcode?ssl=true&replicaSet=atlas-7z6mty-shard-0&authSource=admin&appName=insidcode";

/**
 * Single-database architecture: everything lives in the `insidcode` database.
 */
function getUri(): string {
  return (
    process.env.MONGODB_URI ||
    process.env.INSIDCODE_MONGODB_URI ||
    process.env.DATABASE_URL ||
    DIRECT_REPLICA_URI
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
      .catch(async (err) => {
        // If SRV DNS query was refused or failed, retry with direct replicaSet URI
        const isDnsError =
          err?.message?.includes("querySrv") ||
          err?.code === "ECONNREFUSED" ||
          err?.name === "MongoServerSelectionError";

        if (isDnsError && uri !== DIRECT_REPLICA_URI) {
          console.warn("[MongoDB] SRV lookup failed, falling back to direct replica nodes...");
          try {
            const fallbackInstance = await mongoose.connect(DIRECT_REPLICA_URI, opts);
            return fallbackInstance;
          } catch (fallbackErr) {
            cached.promise = null;
            throw fallbackErr;
          }
        }

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
        const isDnsError =
          err?.message?.includes("querySrv") ||
          err?.code === "ECONNREFUSED" ||
          err?.name === "MongoServerSelectionError";

        if (isDnsError && uri !== DIRECT_REPLICA_URI) {
          console.warn("[MongoDB] Client SRV lookup failed, connecting to direct replica nodes...");
          const directClient = new MongoClient(DIRECT_REPLICA_URI, {
            serverSelectionTimeoutMS: 5000,
          });
          return directClient.connect();
        }

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
