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
        console.error("[MongoDB] Connection failure:", err);
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

// BuiltInTech Client Promise
let clientPromise: Promise<MongoClient>;
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// InsidCode Client Promise
let insidcodeClientPromise: Promise<MongoClient>;
if (process.env.NODE_ENV === "development") {
  if (!global._insidcodeClientPromise) {
    const client = new MongoClient(INSIDCODE_URI);
    global._insidcodeClientPromise = client.connect();
  }
  insidcodeClientPromise = global._insidcodeClientPromise;
} else {
  const client = new MongoClient(INSIDCODE_URI);
  insidcodeClientPromise = client.connect();
}

export { clientPromise, insidcodeClientPromise };

/**
 * Access BuiltInTech Database (Education, Users, Progress, Ranks, Achievements, Certificates)
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(BUILTINTECH_DB_NAME);
}

export async function getBuiltInTechDb(): Promise<Db> {
  return getDatabase();
}

/**
 * Access InsidCode Database (330 Arena Questions, Duel Rooms, Submissions)
 */
export async function getInsidCodeDb(): Promise<Db> {
  const client = await insidcodeClientPromise;
  return client.db(INSIDCODE_DB_NAME);
}
