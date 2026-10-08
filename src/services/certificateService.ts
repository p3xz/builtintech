import { ICertificate, SupportedLanguage } from "@/types/learning";
import { getCourseById } from "@/data/courses";

export async function getUserCertificates(): Promise<ICertificate[]> {
  try {
    const res = await fetch("/api/user/certificates");
    if (res.ok) {
      const data = await res.json();
      return data.certificates || [];
    }
  } catch {
    // API error
  }
  return [];
}

export async function issueCertificateForCourse(
  courseId: string
): Promise<ICertificate | null> {
  try {
    const res = await fetch("/api/user/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.certificate || null;
    }
  } catch {
    // API error
  }
  return null;
}
