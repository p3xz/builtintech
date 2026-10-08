import { IProject, SupportedLanguage } from "@/types/learning";

export async function getPublicProjects(search: string = "", language: string = "all"): Promise<IProject[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (language !== "all") params.set("language", language);
    const res = await fetch(`/api/projects/public?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data.projects || [];
    }
  } catch {
    // Handled
  }
  return [];
}

export async function getUserProjects(): Promise<IProject[]> {
  try {
    const res = await fetch("/api/user/projects");
    if (res.ok) {
      const data = await res.json();
      return data.projects || [];
    }
  } catch {
    // Handled
  }
  return [];
}

export async function createProject(data: {
  title: string;
  description: string;
  language: SupportedLanguage;
  code: string;
  visibility: "public" | "private";
  tags?: string[];
}): Promise<IProject | null> {
  try {
    const res = await fetch("/api/user/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return json.project || null;
    }
  } catch {
    // Handled
  }
  return null;
}

export async function updateProject(
  id: string,
  data: Partial<Pick<IProject, "title" | "description" | "code" | "visibility" | "language" | "tags">>
): Promise<IProject | null> {
  try {
    const res = await fetch("/api/user/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.project || null;
    }
  } catch {
    // Handled
  }
  return null;
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const res = await fetch("/api/user/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
