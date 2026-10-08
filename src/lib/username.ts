import { User } from "@/models/User";

export async function generateUniqueUsername(base: string): Promise<string> {
  const cleaned = base
    .replace(/[^A-Za-z0-9_]/g, "")
    .trim()
    .slice(0, 16);

  const candidate = cleaned.length >= 3 ? cleaned : `coder_${Math.floor(1000 + Math.random() * 9000)}`;

  const existing = await User.findOne({ usernameNormalized: candidate.toLowerCase() });
  if (!existing) {
    return candidate;
  }

  // Append random suffix
  for (let i = 0; i < 10; i++) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const withSuffix = `${candidate.slice(0, 12)}_${randomSuffix}`;
    const found = await User.findOne({ usernameNormalized: withSuffix.toLowerCase() });
    if (!found) {
      return withSuffix;
    }
  }

  return `user_${Date.now().toString().slice(-6)}`;
}
