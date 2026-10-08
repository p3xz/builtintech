import { Room, ClientRoom } from "@/types/room";
import { connectToDatabase } from "@/lib/mongodb";
import { DuelRoom } from "@/models/DuelRoom";

// In-memory memory map for instantaneous sub-millisecond polling cache
const globalForRooms = globalThis as unknown as {
  roomsMap?: Map<string, Room>;
};

export const rooms: Map<string, Room> =
  globalForRooms.roomsMap || new Map<string, Room>();

if (process.env.NODE_ENV !== "production") {
  globalForRooms.roomsMap = rooms;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getRoom(roomCode: string): Promise<Room | undefined> {
  const code = roomCode.toUpperCase();
  const cachedRoom = rooms.get(code);
  if (cachedRoom) return cachedRoom;

  try {
    await connectToDatabase();
    const dbRoom = await DuelRoom.findOne({ roomCode: code }).lean();
    if (dbRoom) {
      const parsedRoom: Room = {
        roomCode: dbRoom.roomCode,
        problemId: dbRoom.problemId,
        difficulty: (dbRoom as any).difficulty,
        status: dbRoom.status as any,
        endsAt: dbRoom.endsAt ? new Date(dbRoom.endsAt).getTime() : undefined,
        player1: {
          name: dbRoom.player1.username,
          code: dbRoom.player1.code || "",
          status: dbRoom.player1.status as any,
          testsPassed: dbRoom.player1.testsPassed || 0,
          totalTests: dbRoom.player1.totalTests || 0,
          submittedAt: dbRoom.player1.submittedAt ? new Date(dbRoom.player1.submittedAt).getTime() : undefined,
        },
        player2: dbRoom.player2
          ? {
              name: dbRoom.player2.username,
              code: dbRoom.player2.code || "",
              status: dbRoom.player2.status as any,
              testsPassed: dbRoom.player2.testsPassed || 0,
              totalTests: dbRoom.player2.totalTests || 0,
              submittedAt: dbRoom.player2.submittedAt ? new Date(dbRoom.player2.submittedAt).getTime() : undefined,
            }
          : undefined,
        judgeResult: dbRoom.judgeResult as any,
      };

      rooms.set(code, parsedRoom);
      return parsedRoom;
    }
  } catch (err) {
    console.error("[getRoom] MongoDB fetch error:", err);
  }

  return undefined;
}

export async function setRoom(room: Room): Promise<void> {
  const code = room.roomCode.toUpperCase();
  rooms.set(code, room);

  try {
    await connectToDatabase();
    await DuelRoom.findOneAndUpdate(
      { roomCode: code },
      {
        roomCode: code,
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
          submittedAt: room.player1.submittedAt ? new Date(room.player1.submittedAt) : undefined,
        },
        player2: room.player2
          ? {
              username: room.player2.name,
              displayName: room.player2.name,
              code: room.player2.code,
              status: room.player2.status,
              testsPassed: room.player2.testsPassed,
              totalTests: room.player2.totalTests,
              submittedAt: room.player2.submittedAt ? new Date(room.player2.submittedAt) : undefined,
            }
          : undefined,
        judgeResult: room.judgeResult,
        winner: room.judgeResult?.winner || undefined,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours TTL
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("[setRoom] MongoDB sync error:", err);
  }
}

// Convert Room to ClientRoom based on requester's playerName
export function toClientRoom(room: Room, requesterName?: string): ClientRoom {
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
