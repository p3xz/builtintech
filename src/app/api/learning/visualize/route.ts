import { NextRequest, NextResponse } from "next/server";
import { generateExecutionTrace } from "@/lib/visualizer";

export async function POST(req: NextRequest) {
  try {
    const { language = "python", code = "" } = await req.json();

    if (!code.trim()) {
      return NextResponse.json({ error: "Code cannot be empty" }, { status: 400 });
    }

    const trace = generateExecutionTrace(language, code);
    return NextResponse.json({ success: true, trace });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate visualization trace" }, { status: 500 });
  }
}
