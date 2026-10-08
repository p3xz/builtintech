import { NextResponse } from "next/server";
import { connectToDatabase, getDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  // Check the unified insidcode database
  let dbStatus = "unavailable";
  let dbLatencyMs = -1;
  try {
    const t0 = Date.now();
    await connectToDatabase();
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbStatus = "connected";
      dbLatencyMs = Date.now() - t0;
    }
  } catch {
    dbStatus = "unavailable";
  }

  // Cross-check with the native driver too
  if (dbStatus !== "connected") {
    try {
      const t0 = Date.now();
      const db = await getDatabase();
      await db.admin().ping();
      dbStatus = "connected";
      dbLatencyMs = Date.now() - t0;
    } catch {
      // already unavailable
    }
  }

  const groqConfigured = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  const onlineCompilerConfigured = Boolean(
    process.env.ONLINECOMPILER_API_KEY && process.env.ONLINECOMPILER_API_KEY.trim().length > 0
  );
  const authConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  const isHealthy = dbStatus === "connected";
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "error",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: Date.now() - startTime,
      databases: {
        insidcode: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
      services: {
        groqAiReferee: {
          configured: groqConfigured,
          model: "llama-3.3-70b-versatile",
        },
        onlineCompiler: {
          configured: onlineCompilerConfigured,
          engine: "onlinecompiler.io v1",
        },
        auth: {
          configured: authConfigured,
          provider: "google-oauth",
        },
      },
      environment: process.env.NODE_ENV || "development",
    },
    { status: statusCode }
  );
}
