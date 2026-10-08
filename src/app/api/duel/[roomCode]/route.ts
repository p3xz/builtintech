import { NextRequest, NextResponse } from "next/server";
import { getRoom, setRoom, toClientRoom } from "@/lib/rooms";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;
    const { searchParams } = new URL(request.url);
    const playerName = searchParams.get("playerName") || undefined;

    if (!roomCode) {
      return NextResponse.json(
        { error: "roomCode is required" },
        { status: 400 }
      );
    }

    const room = await getRoom(roomCode);
    if (!room) {
      return NextResponse.json(
        { error: `Room '${roomCode.toUpperCase()}' not found` },
        { status: 404 }
      );
    }

    // Auto-finish if timer expired
    if (room.status === "ACTIVE" && room.endsAt && Date.now() >= room.endsAt) {
      room.status = "FINISHED";
      await setRoom(room);
    }

    // If both players are solved, room is also finished
    if (
      room.status === "ACTIVE" &&
      room.player1.status === "SOLVED" &&
      room.player2?.status === "SOLVED"
    ) {
      room.status = "FINISHED";
      await setRoom(room);
    }

    return NextResponse.json(toClientRoom(room, playerName));
  } catch (err: unknown) {
    console.error("Error fetching duel room:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
