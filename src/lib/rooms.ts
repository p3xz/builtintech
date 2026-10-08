import { Room, ClientRoom } from "@/types/room";
import { connectToDatabase } from "@/lib/mongodb";
import { DuelRoom } from "@/models/DuelRoom";

// ─── Room Code Generation ───────────────────────────────────────────────────

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ─── DB Helpers ──────────────────────────────────────────────────────────────

function dbDocToRoom(dbRoom: any): Room {
  return {
    roomCode: dbRoom.roomCode,
    problemId: dbRoom.problemId,
    difficulty: dbRoom.difficulty,
    status: dbRoom.status as any,
    endsAt: dbRoom.endsAt ? new Date(dbRoom.endsAt).getTime() : undefined,
    player1: {
      name: dbRoom.player1.username,
      code: dbRoom.player1.code || "",
      status: dbRoom.player1.status as any,
      testsPassed: dbRoom.player1.testsPassed || 0,
      totalTests: dbRoom.player1.totalTests || 0,
      submittedAt: dbRoom.player1.submittedAt
        ? new Date(dbRoom.player1.submittedAt).getTime()
        : undefined,
    },
    player2: dbRoom.player2
      ? {
          name: dbRoom.player2.username,
          code: dbRoom.player2.code || "",
          status: dbRoom.player2.status as any,
          testsPassed: dbRoom.player2.testsPassed || 0,
          totalTests: dbRoom.player2.totalTests || 0,
          submittedAt: dbRoom.player2.submittedAt
            ? new Date(dbRoom.player2.submittedAt).getTime()
            : undefined,
        }
      : undefined,
    judgeResult: dbRoom.judgeResult as any,
  };
}

function roomToDbFields(room: Room) {
  return {
    roomCode: room.roomCode,
    problemId: room.problemId,
    difficulty: room.difficulty,
    status: room.status,
    endsAt: room.endsAt ? new Date(room.endsAt) : undefined,
    player1: {
      username: room.player1.name,
      displayName: room.player1.name,
      code: room.player1.code,
      status: room.player1.status,
      testsPassed: room.player1.testsPassed,
      totalTests: room.player1.totalTests,
      submittedAt: room.player1.submittedAt
        ? new Date(room.player1.submittedAt)
        : undefined,
    },
    player2: room.player2
      ? {
          username: room.player2.name,
          displayName: room.player2.name,
          code: room.player2.code,
          status: room.player2.status,
          testsPassed: room.player2.testsPassed,
          totalTests: room.player2.totalTests,
          submittedAt: room.player2.submittedAt
            ? new Date(room.player2.submittedAt)
            : undefined,
        }
      : undefined,
    judgeResult: room.judgeResult,
    winner: room.judgeResult?.winner || undefined,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

// ─── getRoom: ALWAYS reads from MongoDB (no stale in-memory cache) ──────────

export async function getRoom(
  roomCode: string
): Promise<Room | undefined> {
  const code = roomCode.toUpperCase();

  try {
    await connectToDatabase();
    const dbRoom = await DuelRoom.findOne({ roomCode: code }).lean();
    if (dbRoom) {
      return dbDocToRoom(dbRoom);
    }
  } catch (err) {
    console.error("[getRoom] MongoDB fetch error:", err);
  }

  return undefined;
}

// ─── setRoom: writes to MongoDB ─────────────────────────────────────────────

export async function setRoom(room: Room): Promise<void> {
  const code = room.roomCode.toUpperCase();

  try {
    await connectToDatabase();
    await DuelRoom.findOneAndUpdate(
      { roomCode: code },
      roomToDbFields(room),
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("[setRoom] MongoDB sync error:", err);
  }
}

// ─── atomicJoinRoom: Atomic Player 2 insertion + WAITING→ACTIVE ─────────────
// Uses findOneAndUpdate with query guard so it's safe against race conditions.
// Returns the updated Room, or null if the room wasn't joinable.

export async function atomicJoinRoom(
  roomCode: string,
  player2Name: string,
  player2Code: string,
  player2TotalTests: number
): Promise<Room | null> {
  const code = roomCode.toUpperCase();

  try {
    await connectToDatabase();

    const endsAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Atomic: only update if status=WAITING AND player2 does not exist yet
    const updated = await DuelRoom.findOneAndUpdate(
      {
        roomCode: code,
        status: "WAITING",
        player2: { $exists: false },
      },
      {
        $set: {
          status: "ACTIVE",
          endsAt,
          player2: {
            username: player2Name,
            displayName: player2Name,
            code: player2Code,
            status: "CODING",
            testsPassed: 0,
            totalTests: player2TotalTests,
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      // Could be: room not found, already ACTIVE, or player2 already set.
      // Try alternate: player2 is null (Mongoose may store it as null vs undefined)
      const updated2 = await DuelRoom.findOneAndUpdate(
        {
          roomCode: code,
          status: "WAITING",
          $or: [
            { player2: null },
            { player2: { $exists: false } },
          ],
        },
        {
          $set: {
            status: "ACTIVE",
            endsAt,
            player2: {
              username: player2Name,
              displayName: player2Name,
              code: player2Code,
              status: "CODING",
              testsPassed: 0,
              totalTests: player2TotalTests,
            },
          },
        },
        { new: true }
      );

      if (updated2) {
        return dbDocToRoom(updated2.toObject ? updated2.toObject() : updated2);
      }

      return null;
    }

    return dbDocToRoom(updated.toObject ? updated.toObject() : updated);
  } catch (err) {
    console.error("[atomicJoinRoom] Error:", err);
    return null;
  }
}

// ─── toClientRoom: Convert Room to client-safe representation ───────────────

export function toClientRoom(
  room: Room,
  requesterName?: string
): ClientRoom {
  const isFinished = room.status === "FINISHED";
  const req = (requesterName || "").trim().toLowerCase();

  const p1Name = (room.player1.name || "").trim().toLowerCase();
  const p1IsRequester = req !== "" && req === p1Name;

  const p1: ClientRoom["player1"] = {
    name: room.player1.name,
    status: room.player1.status,
    testsPassed: room.player1.testsPassed,
    totalTests: room.player1.totalTests,
    submittedAt: room.player1.submittedAt,
    code: isFinished || p1IsRequester ? room.player1.code : undefined,
  };

  let p2: ClientRoom["player2"] = undefined;
  if (room.player2) {
    const p2Name = (room.player2.name || "").trim().toLowerCase();
    const p2IsRequester = req !== "" && req === p2Name;

    p2 = {
      name: room.player2.name,
      status: room.player2.status,
      testsPassed: room.player2.testsPassed,
      totalTests: room.player2.totalTests,
      submittedAt: room.player2.submittedAt,
      code: isFinished || p2IsRequester ? room.player2.code : undefined,
    };
  }

  return {
    roomCode: room.roomCode,
    problemId: room.problemId,
    difficulty: room.difficulty,
    status: room.status,
    endsAt: room.endsAt,
    player1: p1,
    player2: p2,
    judgeResult: room.judgeResult,
  };
}
