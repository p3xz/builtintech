import { NextResponse } from "next/server";
import { connectToDatabase, getBuiltInTechDb, getInsidCodeDb } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  // 1. Check Built In Tech Database
  let builtintechStatus = "unavailable";
  let builtintechLatencyMs = -1;
  try {
    const t0 = Date.now();
    await connectToDatabase();
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      builtintechStatus = "connected";
      builtintechLatencyMs = Date.now() - t0;
    }
  } catch {
    builtintechStatus = "unavailable";
  }

  // 2. Check InsidCode Database
  let insidcodeStatus = "unavailable";
  let insidcodeLatencyMs = -1;
  try {
    const t0 = Date.now();
    const insidDb = await getInsidCodeDb();
    await insidDb.admin().ping();
    insidcodeStatus = "connected";
    insidcodeLatencyMs = Date.now() - t0;
  } catch {
    insidcodeStatus = "unavailable";
  }

  const groqConfigured = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  const onlineCompilerConfigured = Boolean(
    process.env.ONLINECOMPILER_API_KEY && process.env.ONLINECOMPILER_API_KEY.trim().length > 0
  );
  const authConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  const isHealthy = builtintechStatus === "connected";
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? (insidcodeStatus === "connected" ? "ok" : "degraded") : "error",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: Date.now() - startTime,
      databases: {
        builtintech: {
          status: builtintechStatus,
          latencyMs: builtintechLatencyMs,
        },
        insidcode: {
          status: insidcodeStatus,
          latencyMs: insidcodeLatencyMs,
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

