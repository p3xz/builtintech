import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let dbLatencyMs = -1;

  try {
    const dbStart = Date.now();
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      dbStatus = "healthy";
      dbLatencyMs = Date.now() - dbStart;
    } else {
      dbStatus = "connecting";
    }
  } catch (err: any) {
    dbStatus = `error: ${err?.message || "connection failed"}`;
  }

  const groqConfigured = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  const onlineCompilerConfigured = Boolean(
    process.env.ONLINECOMPILER_API_KEY && process.env.ONLINECOMPILER_API_KEY.trim().length > 0
  );
  const authSecretConfigured = Boolean(
    (process.env.AUTH_SECRET && process.env.AUTH_SECRET.trim().length > 0) ||
    (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim().length > 0)
  );

  const isHealthy = dbStatus === "healthy";
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: Date.now() - startTime,
      version: "2.0.0",
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        groqAiReferee: {
          configured: groqConfigured,
          model: "openai/gpt-oss-20b",
        },
        onlineCompiler: {
          configured: onlineCompilerConfigured,
          engine: "onlinecompiler.io v1",
        },
        auth: {
          configured: authSecretConfigured,
          methods: ["google-oauth", "email-otp"],
        },
      },
      environment: process.env.NODE_ENV || "development",
    },
    { status: statusCode }
  );
}
