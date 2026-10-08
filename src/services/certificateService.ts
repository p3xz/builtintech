import { ICertificate, SupportedLanguage } from "@/types/learning";
import { getCourseById } from "@/data/courses";
import { getLocalProgress } from "./courseService";

const CERTIFICATES_STORAGE_KEY = "builtintech_certificates_v1";

const DEMO_CERTIFICATES: ICertificate[] = [
  {
    id: "cert-py-001",
    certificateId: "BIT-PY-2026-9812",
    userId: "local-user",
    username: "learner",
    displayName: "Tech Explorer",
    courseId: "python-fundamentals",
    courseTitle: "Python Fundamentals",
    language: "python",
    issuedAt: "2026-10-06T15:30:00Z",
    grade: "Distinction",
    verificationHash: "8f3b219e4a6c810d",
  },
];

export function getUserCertificates(): ICertificate[] {
  if (typeof window === "undefined") return DEMO_CERTIFICATES;

  const stored = localStorage.getItem(CERTIFICATES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(DEMO_CERTIFICATES));
    return DEMO_CERTIFICATES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEMO_CERTIFICATES;
  }
}

export function getCertificateById(id: string): ICertificate | undefined {
  return getUserCertificates().find(
    (c) => c.id === id || c.certificateId.toLowerCase() === id.toLowerCase()
  );
}

export function issueCertificateForCourse(
  courseId: string,
  username: string = "Learner",
  displayName: string = "Tech Explorer"
): ICertificate | null {
  const course = getCourseById(courseId);
  if (!course) return null;

  const certs = getUserCertificates();
  const existing = certs.find((c) => c.courseId === courseId);
  if (existing) return existing;

  const newCert: ICertificate = {
    id: `cert-${course.language}-${Date.now().toString(36)}`,
    certificateId: `BIT-${course.language.toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: "local-user",
    username,
    displayName,
    courseId: course.courseId,
    courseTitle: course.title,
    language: course.language as SupportedLanguage,
    issuedAt: new Date().toISOString(),
    grade: "Passed",
    verificationHash: Math.random().toString(36).substring(2, 12),
  };

  certs.push(newCert);
  if (typeof window !== "undefined") {
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(certs));
  }

  return newCert;
}
