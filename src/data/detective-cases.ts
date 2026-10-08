import { IDetectiveCase } from "@/types/learning";

export const DETECTIVE_CASES: IDetectiveCase[] = [
  {
    id: "case-047",
    caseNumber: "CASE #047",
    title: "The Missing Database",
    subtitle: "A production database dropped offline at 03:14 UTC. Find the root cause and reconstruct the query.",
    domain: "Database & Security",
    difficulty: "Beginner",
    scenario: `At 03:14 AM, the automated alert system notified the on-call engineer that the student grades table was inaccessible. 
The database logs, backup manifest, and access logs have been preserved below. 
Investigate the evidence files, determine what query executed right before the failure, and write the corrective recovery script.`,
    xpReward: 150,
    evidenceFiles: [
      {
        name: "server.log",
        type: "log",
        content: `[2026-10-08 03:10:02 UTC] [INFO] Connection pool established (max: 20).
[2026-10-08 03:12:45 UTC] [AUTH] User 'migration_bot' authenticated from IP 192.168.1.45.
[2026-10-08 03:13:58 UTC] [QUERY] EXECUTE "SELECT COUNT(*) FROM student_roster WHERE active = 1;"
[2026-10-08 03:14:02 UTC] [WARN] Heavy query executed without WHERE safeguard.
[2026-10-08 03:14:03 UTC] [QUERY] EXECUTE "TRUNCATE TABLE student_roster;"
[2026-10-08 03:14:05 UTC] [ERROR] Table 'student_roster' is now empty. 0 rows returned.
[2026-10-08 03:14:10 UTC] [ALERT] Data integrity breach detected. Freezing tables.`,
        clues: [
          "Check line [03:14:03 UTC] - notice the destructive command executed by migration_bot.",
          "TRUNCATE TABLE wiped all records in student_roster.",
        ],
      },
      {
        name: "access.log",
        type: "log",
        content: `192.168.1.10 - - [08/Oct/2026:03:00:12] "GET /api/health" 200 45
192.168.1.45 - - [08/Oct/2026:03:12:40] "POST /api/auth/token" 200 128
192.168.1.45 - - [08/Oct/2026:03:14:01] "POST /api/db/exec" 200 0
192.168.1.99 - - [08/Oct/2026:03:15:00] "GET /api/students" 500 240`,
        clues: ["IP 192.168.1.45 sent the destructive POST to /api/db/exec at 03:14:01."],
      },
      {
        name: "backup.sql",
        type: "sql",
        content: `-- Built In Tech Daily Snapshot: 2026-10-08 02:00:00 UTC
CREATE TABLE IF NOT EXISTS student_roster (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gpa NUMERIC(3, 2) DEFAULT 3.50,
    status VARCHAR(20) DEFAULT 'enrolled'
);

INSERT INTO student_roster (id, name, email, gpa, status) VALUES
(1, 'Alice Chen', 'alice@campus.edu', 3.92, 'enrolled'),
(2, 'Bob Martinez', 'bob@campus.edu', 3.45, 'enrolled'),
(3, 'Charlie Kim', 'charlie@campus.edu', 3.88, 'enrolled');`,
        clues: ["The backup snapshot from 02:00:00 contains the clean schema and 3 seed records."],
      },
    ],
    tasks: [
      {
        id: "task-1",
        prompt: "Identify the exact destructive SQL statement that cleared the table at 03:14:03 UTC.",
        hint: "Inspect server.log around 03:14:03 UTC.",
        type: "choice",
        options: [
          "DROP DATABASE builtintech;",
          "TRUNCATE TABLE student_roster;",
          "DELETE FROM student_roster WHERE active = 0;",
          "ALTER TABLE student_roster DROP COLUMN name;",
        ],
        correctOptionIndex: 1,
        xp: 40,
      },
      {
        id: "task-2",
        prompt: "Which IP address authenticated as 'migration_bot' and executed the query?",
        hint: "Check access.log and server.log for the IP address associated with migration_bot.",
        type: "text",
        expectedAnswer: "192.168.1.45",
        xp: 40,
      },
      {
        id: "task-3",
        prompt: "Write the SQL command to verify if student records exist after running the restore from backup.sql.",
        hint: "Use SELECT COUNT(*) FROM student_roster;",
        type: "query",
        expectedKeywords: ["SELECT", "COUNT", "student_roster"],
        expectedAnswer: "SELECT COUNT(*) FROM student_roster;",
        xp: 70,
      },
    ],
    solutionSummary: "Case Solved! You diagnosed that an automated script at 192.168.1.45 executed TRUNCATE TABLE student_roster without safeguards. Restoring from backup.sql recovered all student data.",
  },
  {
    id: "case-023",
    caseNumber: "CASE #023",
    title: "The Silent Memory Leak",
    subtitle: "A microservice's memory graph climbed from 200MB to 4GB over 24 hours. Pinpoint the unbounded cache.",
    domain: "Performance & Systems",
    difficulty: "Intermediate",
    scenario: `The background worker service crashes with OutOfMemoryError every evening. 
Inspect the profiling snapshot, garbage collection logs, and code snippet to identify the rogue collection and suggest the fix.`,
    xpReward: 200,
    evidenceFiles: [
      {
        name: "worker.py",
        type: "code",
        content: `import time

# Global cache without TTL or eviction limit
REQUEST_CACHE = []

def process_event(event_id, payload):
    # Bug: Appending to global list on every request without ever clearing or pruning
    REQUEST_CACHE.append({
        "id": event_id,
        "payload": payload,
        "timestamp": time.time()
    })
    return {"status": "processed", "id": event_id}`,
        clues: ["REQUEST_CACHE is an unbounded global list that grows indefinitely."],
      },
      {
        name: "gc.log",
        type: "log",
        content: `[GC Worker-1] Full GC: Heap usage 94% -> 93.8% (collected 12KB).
[GC Worker-1] Severe object retention in global root namespace.
[GC Worker-1] OutOfMemoryError: GC overhead limit exceeded.`,
        clues: ["Garbage collector is unable to reclaim memory because objects are referenced globally."],
      },
    ],
    tasks: [
      {
        id: "task-1",
        prompt: "What data structure in worker.py is causing the unbounded memory growth?",
        hint: "Look at the global variable at the top of worker.py.",
        type: "choice",
        options: ["REQUEST_CACHE", "payload", "event_id", "time.time()"],
        correctOptionIndex: 0,
        xp: 50,
      },
      {
        id: "task-2",
        prompt: "Which data structure pattern from collections would prevent this by maintaining a fixed-size buffer?",
        hint: "Consider collections.deque(maxlen=1000) or an LRU Cache.",
        type: "choice",
        options: ["collections.deque(maxlen=N)", "set()", "dict without keys", "tuple"],
        correctOptionIndex: 0,
        xp: 50,
      },
      {
        id: "task-3",
        prompt: "Type the name of the decorator from 'functools' often used for bounded caching in Python.",
        hint: "lru_cache",
        type: "text",
        expectedAnswer: "lru_cache",
        xp: 100,
      },
    ],
    solutionSummary: "Case Solved! Unbounded append() calls to global list REQUEST_CACHE created an unstoppable memory leak. Switching to a bounded deque or functools.lru_cache solved the leak.",
  },
];

export function getAllDetectiveCases(): IDetectiveCase[] {
  return DETECTIVE_CASES;
}

export function getDetectiveCaseById(id: string): IDetectiveCase | undefined {
  return DETECTIVE_CASES.find((c) => c.id === id || c.caseNumber.toLowerCase().includes(id.toLowerCase()));
}
