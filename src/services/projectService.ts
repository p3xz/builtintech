import { IProject, SupportedLanguage } from "@/types/learning";

const PROJECTS_STORAGE_KEY = "builtintech_projects_v1";

const INITIAL_DEMO_PROJECTS: IProject[] = [
  {
    id: "proj-001",
    userId: "u-101",
    username: "cypher_dev",
    displayName: "Cypher",
    title: "Binary Tree Visualizer in Python",
    description: "An ASCII tree traversal renderer supporting In-Order, Pre-Order, and Post-Order depth visualization.",
    language: "python",
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def print_tree(root, level=0, prefix="Root: "):
    if root is not None:
        print(" " * (level * 4) + prefix + str(root.val))
        if root.left or root.right:
            print_tree(root.left, level + 1, "L--- ")
            print_tree(root.right, level + 1, "R--- ")

# Build demo tree
root = TreeNode(10, TreeNode(5, TreeNode(2), TreeNode(7)), TreeNode(15, None, TreeNode(20)))
print("ASCII Binary Search Tree:")
print_tree(root)`,
    visibility: "public",
    tags: ["Algorithms", "Binary Tree", "ASCII"],
    likesCount: 38,
    forksCount: 12,
    viewsCount: 240,
    createdAt: "2026-10-04T12:00:00Z",
    updatedAt: "2026-10-04T12:00:00Z",
  },
  {
    id: "proj-002",
    userId: "u-102",
    username: "maya_code",
    displayName: "Maya",
    title: "Async Rate Limiter Token Bucket",
    description: "A production-grade token bucket rate limiter implementation in JavaScript with leaky queue draining.",
    language: "javascript",
    code: `class TokenBucket {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRatePerSec;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  tryConsume(tokens = 1) {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}

const bucket = new TokenBucket(5, 1);
console.log("Consume 3:", bucket.tryConsume(3));
console.log("Consume 3 again:", bucket.tryConsume(3));`,
    visibility: "public",
    tags: ["Systems", "Rate Limiting", "Backend"],
    likesCount: 54,
    forksCount: 19,
    viewsCount: 410,
    createdAt: "2026-10-05T14:30:00Z",
    updatedAt: "2026-10-05T14:30:00Z",
  },
  {
    id: "proj-003",
    userId: "u-103",
    username: "chen_k",
    displayName: "Chen",
    title: "C++ High Performance Matrix Multiplier",
    description: "Cache-friendly block matrix multiplication benchmarking naive vs transposed algorithms.",
    language: "cpp",
    code: `#include <iostream>
#include <vector>

using namespace std;

void multiply(const vector<vector<int>>& A, const vector<vector<int>>& B, vector<vector<int>>& C, int N) {
    for(int i = 0; i < N; i++) {
        for(int k = 0; k < N; k++) {
            for(int j = 0; j < N; j++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}

int main() {
    int N = 2;
    vector<vector<int>> A = {{1, 2}, {3, 4}};
    vector<vector<int>> B = {{5, 6}, {7, 8}};
    vector<vector<int>> C(N, vector<int>(N, 0));
    multiply(A, B, C, N);
    cout << "C[0][0]: " << C[0][0] << ", C[1][1]: " << C[1][1] << endl;
    return 0;
}`,
    visibility: "public",
    tags: ["Performance", "C++", "Matrices"],
    likesCount: 29,
    forksCount: 7,
    viewsCount: 180,
    createdAt: "2026-10-06T09:15:00Z",
    updatedAt: "2026-10-06T09:15:00Z",
  },
];

export function getAllStoredProjects(): IProject[] {
  if (typeof window === "undefined") {
    return INITIAL_DEMO_PROJECTS;
  }
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PROJECTS));
    return INITIAL_DEMO_PROJECTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DEMO_PROJECTS;
  }
}

export function saveAllStoredProjects(projects: IProject[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }
}

export function getPublicProjects(search: string = "", language: string = "all"): IProject[] {
  const projects = getAllStoredProjects().filter((p) => p.visibility === "public");
  return projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      p.username.toLowerCase().includes(search.toLowerCase());
    const matchesLang = language === "all" || p.language === language;
    return matchesSearch && matchesLang;
  });
}

export function getUserProjects(username?: string): IProject[] {
  const all = getAllStoredProjects();
  if (!username) return all;
  return all.filter((p) => p.username.toLowerCase() === username.toLowerCase());
}

export function getProjectById(id: string): IProject | undefined {
  return getAllStoredProjects().find((p) => p.id === id);
}

export function createProject(data: {
  title: string;
  description: string;
  language: SupportedLanguage;
  code: string;
  visibility: "public" | "private";
  tags?: string[];
  username?: string;
  displayName?: string;
}): IProject {
  const all = getAllStoredProjects();
  const newProject: IProject = {
    id: "proj-" + Date.now(),
    userId: "local-user",
    username: data.username || "me",
    displayName: data.displayName || "My Code",
    title: data.title || "Untitled Project",
    description: data.description || "Created in Built In Tech Studio",
    language: data.language,
    code: data.code,
    visibility: data.visibility,
    tags: data.tags || [data.language],
    likesCount: 0,
    forksCount: 0,
    viewsCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.unshift(newProject);
  saveAllStoredProjects(all);
  return newProject;
}

export function updateProject(
  id: string,
  data: Partial<Pick<IProject, "title" | "description" | "code" | "visibility" | "language" | "tags">>
): IProject | undefined {
  const all = getAllStoredProjects();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  all[index] = {
    ...all[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  saveAllStoredProjects(all);
  return all[index];
}

export function deleteProject(id: string): boolean {
  const all = getAllStoredProjects();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length !== all.length) {
    saveAllStoredProjects(filtered);
    return true;
  }
  return false;
}
