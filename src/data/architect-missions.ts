import { IArchitectMission } from "@/types/learning";

export const ARCHITECT_MISSIONS: IArchitectMission[] = [
  {
    id: "mission-012",
    missionNumber: "MISSION #012",
    title: "The Campus Queue",
    subtitle: "Architect a resilient, high-throughput priority queue system with VIP fast-laning and latency tracking.",
    domain: "Data Structures & Systems Design",
    difficulty: "Beginner",
    language: "python",
    blueprint: `System Architecture Blueprint:
┌─────────────────────────────────────────────────────────────┐
│                   Campus Queue Dispatcher                   │
├────────────────────────┬────────────────────────────────────┤
│  Regular Student Queue │  [ FIFO Queue: Student 1, 2... ]   │
│  VIP / Priority Lane   │  [ Priority Queue: Exam Takers ]   │
│  Dispatcher Engine     │  [ Batch Serve & Telemetry Metrics ]│
└────────────────────────┴────────────────────────────────────┘`,
    totalXp: 300,
    phases: [
      {
        phaseNumber: 1,
        title: "Phase 1: Create Data Structure",
        description: "Initialize the CampusQueue class with internal storage for standard and VIP students.",
        requirements: [
          "Define `class CampusQueue:`",
          "Implement `__init__(self)` initializing `self.regular = []` and `self.vip = []`",
          "Implement `is_empty(self)` returning True if both lists are empty",
        ],
        starterCode: `class CampusQueue:
    def __init__(self):
        # Initialize internal storage
        self.regular = []
        self.vip = []

    def is_empty(self):
        # Return True if queue has zero students
        return len(self.regular) == 0 and len(self.vip) == 0

# Test harness
q = CampusQueue()
print("Initialized empty:", q.is_empty())`,
        testCases: [
          {
            name: "Initial empty check",
            input: "q = CampusQueue()\nprint(q.is_empty())",
            expectedOutput: "True",
          },
        ],
        hint: "Check both self.regular and self.vip lengths in is_empty().",
        xp: 50,
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Add Students (Enqueue)",
        description: "Add an `enqueue(self, name, is_vip=False)` method to route students to the correct queue.",
        requirements: [
          "If `is_vip == True`, append to `self.vip`",
          "Otherwise, append to `self.regular`",
          "Return the total count of waiting students",
        ],
        starterCode: `class CampusQueue:
    def __init__(self):
        self.regular = []
        self.vip = []

    def is_empty(self):
        return len(self.regular) == 0 and len(self.vip) == 0

    def enqueue(self, name, is_vip=False):
        if is_vip:
            self.vip.append(name)
        else:
            self.regular.append(name)
        return len(self.vip) + len(self.regular)

q = CampusQueue()
q.enqueue("Alice", is_vip=False)
q.enqueue("Bob", is_vip=True)
print("Total students:", len(q.vip) + len(q.regular))`,
        testCases: [
          {
            name: "Enqueue regular and VIP",
            input: "q = CampusQueue()\nq.enqueue('Alice')\nq.enqueue('Bob', True)\nprint(len(q.vip) + len(q.regular))",
            expectedOutput: "2",
          },
        ],
        hint: "Use append() and return total length.",
        xp: 60,
      },
      {
        phaseNumber: 3,
        title: "Phase 3: Serve Students (Dequeue with Priority)",
        description: "Serve VIP students first before regular students. If all queues are empty, return None.",
        requirements: [
          "Implement `dequeue(self)`",
          "If `self.vip` has students, pop and return the first VIP student (FIFO)",
          "Else if `self.regular` has students, pop and return the first regular student",
          "If empty, return `None`",
        ],
        starterCode: `class CampusQueue:
    def __init__(self):
        self.regular = []
        self.vip = []

    def is_empty(self):
        return len(self.regular) == 0 and len(self.vip) == 0

    def enqueue(self, name, is_vip=False):
        if is_vip:
            self.vip.append(name)
        else:
            self.regular.append(name)
        return len(self.vip) + len(self.regular)

    def dequeue(self):
        if self.vip:
            return self.vip.pop(0)
        if self.regular:
            return self.regular.pop(0)
        return None

q = CampusQueue()
q.enqueue("Student1", is_vip=False)
q.enqueue("VIP_Student", is_vip=True)
print("Served:", q.dequeue())`,
        testCases: [
          {
            name: "Priority serving check",
            input: "q = CampusQueue()\nq.enqueue('Student1', False)\nq.enqueue('VIP_Student', True)\nprint(q.dequeue())",
            expectedOutput: "VIP_Student",
          },
        ],
        hint: "Check self.vip first using self.vip.pop(0).",
        xp: 70,
      },
      {
        phaseNumber: 4,
        title: "Phase 4: Batch Processing & Edge Cases",
        description: "Add `serve_batch(self, count)` to process up to N students and return their names as a list.",
        requirements: [
          "Implement `serve_batch(self, count)`",
          "Repeatedly call dequeue() until count is reached or queue is empty",
          "Return list of served names",
        ],
        starterCode: `class CampusQueue:
    def __init__(self):
        self.regular = []
        self.vip = []

    def is_empty(self):
        return len(self.regular) == 0 and len(self.vip) == 0

    def enqueue(self, name, is_vip=False):
        if is_vip:
            self.vip.append(name)
        else:
            self.regular.append(name)
        return len(self.vip) + len(self.regular)

    def dequeue(self):
        if self.vip:
            return self.vip.pop(0)
        if self.regular:
            return self.regular.pop(0)
        return None

    def serve_batch(self, count):
        served = []
        for _ in range(count):
            student = self.dequeue()
            if student is None:
                break
            served.append(student)
        return served

q = CampusQueue()
q.enqueue("A", False)
q.enqueue("B", True)
q.enqueue("C", False)
print("Batch served:", q.serve_batch(2))`,
        testCases: [
          {
            name: "Serve batch of 2",
            input: "q = CampusQueue()\nq.enqueue('A', False)\nq.enqueue('B', True)\nq.enqueue('C', False)\nprint(q.serve_batch(2))",
            expectedOutput: "['B', 'A']",
          },
        ],
        hint: "Loop count times and break if student is None.",
        xp: 60,
      },
      {
        phaseNumber: 5,
        title: "Phase 5: Optimize & Telemetry Metrics",
        description: "Add metrics tracking: `get_stats()` returning total served count and remaining count.",
        requirements: [
          "Track `self.total_served = 0`",
          "Increment `self.total_served += 1` every time a student is dequeued",
          "Return `{'served': self.total_served, 'waiting': len(self.vip) + len(self.regular)}`",
        ],
        starterCode: `class CampusQueue:
    def __init__(self):
        self.regular = []
        self.vip = []
        self.total_served = 0

    def is_empty(self):
        return len(self.regular) == 0 and len(self.vip) == 0

    def enqueue(self, name, is_vip=False):
        if is_vip:
            self.vip.append(name)
        else:
            self.regular.append(name)
        return len(self.vip) + len(self.regular)

    def dequeue(self):
        if self.vip:
            self.total_served += 1
            return self.vip.pop(0)
        if self.regular:
            self.total_served += 1
            return self.regular.pop(0)
        return None

    def get_stats(self):
        return {
            "served": self.total_served,
            "waiting": len(self.vip) + len(self.regular)
        }

q = CampusQueue()
q.enqueue("Maya", False)
q.enqueue("Prof. Lee", True)
q.dequeue()
print(q.get_stats())`,
        testCases: [
          {
            name: "Telemetry check",
            input: "q = CampusQueue()\nq.enqueue('Maya', False)\nq.enqueue('Prof. Lee', True)\nq.dequeue()\nprint(q.get_stats()['served'])",
            expectedOutput: "1",
          },
        ],
        hint: "Increment self.total_served upon successful dequeue.",
        xp: 60,
      },
    ],
  },
];

export function getAllArchitectMissions(): IArchitectMission[] {
  return ARCHITECT_MISSIONS;
}

export function getArchitectMissionById(id: string): IArchitectMission | undefined {
  return ARCHITECT_MISSIONS.find((m) => m.id === id || m.missionNumber.toLowerCase().includes(id.toLowerCase()));
}
