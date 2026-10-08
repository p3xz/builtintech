/**
 * Seed Diverse Ranked Users across all Rank Tiers and Leaderboard
 * 
 * Target: `insidcode.users`
 * 
 * Safe and idempotent (upserts by usernameNormalized).
 */

const { MongoClient } = require('mongodb');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'insidcode';

const RANKED_USERS = [
  {
    username: "alex_chen",
    displayName: "Alex Chen",
    email: "alex.chen.dev@example.com",
    role: "user",
    xp: 38500,
    duelRating: 2150,
    duelsPlayed: 88,
    duelsWon: 74,
    duelsLost: 14,
    currentStreak: 19,
    longestStreak: 25,
    solvedProblems: ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013"],
    attemptedProblems: ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013"],
    totalSubmissions: 142,
    acceptedSubmissions: 82,
    provider: "google",
    isDemoUser: true,
  },
  {
    username: "sarah_systems",
    displayName: "Sarah Jenkins",
    email: "sarah.j.systems@example.com",
    role: "user",
    xp: 28200,
    duelRating: 1940,
    duelsPlayed: 64,
    duelsWon: 51,
    duelsLost: 13,
    currentStreak: 12,
    longestStreak: 18,
    solvedProblems: ["001", "002", "003", "005", "008", "009", "011", "013"],
    attemptedProblems: ["001", "002", "003", "005", "008", "009", "011", "013"],
    totalSubmissions: 98,
    acceptedSubmissions: 61,
    provider: "google",
    isDemoUser: true,
  },
  {
    username: "dev_vikram",
    displayName: "Vikram Malhotra",
    email: "vikram.m.coder@example.com",
    role: "user",
    xp: 21400,
    duelRating: 1780,
    duelsPlayed: 52,
    duelsWon: 39,
    duelsLost: 13,
    currentStreak: 8,
    longestStreak: 14,
    solvedProblems: ["001", "002", "003", "004", "006", "007", "013"],
    attemptedProblems: ["001", "002", "003", "004", "006", "007", "013"],
    totalSubmissions: 76,
    acceptedSubmissions: 45,
    provider: "google",
    isDemoUser: true,
  },
  {
    username: "elena_rust",
    displayName: "Elena Rostova",
    email: "elena.rostova@example.com",
    role: "user",
    xp: 14600,
    duelRating: 1650,
    duelsPlayed: 41,
    duelsWon: 29,
    duelsLost: 12,
    currentStreak: 6,
    longestStreak: 11,
    solvedProblems: ["001", "002", "004", "005", "009"],
    attemptedProblems: ["001", "002", "004", "005", "009"],
    totalSubmissions: 59,
    acceptedSubmissions: 33,
    provider: "google",
    isDemoUser: true,
  },
  {
    username: "marcus_k",
    displayName: "Marcus King",
    email: "marcus.k.dev@example.com",
    role: "user",
    xp: 9800,
    duelRating: 1540,
    duelsPlayed: 33,
    duelsWon: 22,
    duelsLost: 11,
    currentStreak: 5,
    longestStreak: 9,
    solvedProblems: ["001", "002", "003", "007"],
    attemptedProblems: ["001", "002", "003", "007"],
    totalSubmissions: 47,
    acceptedSubmissions: 25,
    provider: "google",
    isDemoUser: true,
  },
  {
    username: "priya_algo",
    displayName: "Priya Sharma",
    email: "priya.sharma.codes@example.com",
    role: "user",
    xp: 5900,
    duelRating: 1420,
    duelsPlayed: 25,
    duelsWon: 16,
    duelsLost: 9,
    currentStreak: 4,
    longestStreak: 7,
    solvedProblems: ["001", "002", "003"],
    attemptedProblems: ["001", "002", "003"],
    totalSubmissions: 34,
    acceptedSubmissions: 18,
    provider: "google",
    isDemoUser: true,
  },
  {
    username: "lucas_dev",
    displayName: "Lucas Silva",
    email: "lucas.silva.io@example.com",
    role: "user",
    xp: 3400,
    duelRating: 1320,
    duelsPlayed: 18,
    duelsWon: 11,
    duelsLost: 7,
    currentStreak: 3,
    longestStreak: 5,
    solvedProblems: ["001", "002"],
    attemptedProblems: ["001", "002"],
    totalSubmissions: 26,
    acceptedSubmissions: 12,
    provider: "google",
    isDemoUser: true,
  },
  {
    username: "yuki_syntax",
    displayName: "Yuki Tanaka",
    email: "yuki.tanaka.dev@example.com",
    role: "user",
    xp: 1850,
    duelRating: 1240,
    duelsPlayed: 12,
    duelsWon: 7,
    duelsLost: 5,
    currentStreak: 2,
    longestStreak: 4,
    solvedProblems: ["001", "003"],
    attemptedProblems: ["001", "003"],
    totalSubmissions: 19,
    acceptedSubmissions: 8,
    provider: "google",
    isDemoUser: true,
  },
  {
    username: "chloe_code",
    displayName: "Chloe Bennett",
    email: "chloe.b.dev@example.com",
    role: "user",
    xp: 850,
    duelRating: 1150,
    duelsPlayed: 8,
    duelsWon: 4,
    duelsLost: 4,
    currentStreak: 2,
    longestStreak: 3,
    solvedProblems: ["001"],
    attemptedProblems: ["001"],
    totalSubmissions: 12,
    acceptedSubmissions: 5,
    provider: "google",
    isDemoUser: true,
  },
  {
    username: "jordan_smith",
    displayName: "Jordan Smith",
    email: "jordan.smith.codes@example.com",
    role: "user",
    xp: 320,
    duelRating: 1050,
    duelsPlayed: 4,
    duelsWon: 2,
    duelsLost: 2,
    currentStreak: 1,
    longestStreak: 2,
    solvedProblems: ["001"],
    attemptedProblems: ["001"],
    totalSubmissions: 6,
    acceptedSubmissions: 2,
    provider: "google",
    isDemoUser: true,
  }
];

async function seedRankedUsers() {
  console.log(`Connecting to MongoDB: ${DB_NAME}...`);
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCol = db.collection('users');

    console.log(`Seeding ${RANKED_USERS.length} ranked users across all tiers...`);

    for (const u of RANKED_USERS) {
      const normalized = u.username.toLowerCase();
      await usersCol.updateOne(
        { usernameNormalized: normalized },
        {
          $set: {
            ...u,
            providerAccountId: `demo_acc_${normalized}`,
            usernameNormalized: normalized,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
            preferences: {
              editorFontSize: 14,
              minimap: false,
              defaultLanguage: "python",
              reducedMotion: false,
            },
          },
        },
        { upsert: true }
      );
    }

    const totalCount = await usersCol.countDocuments();
    console.log(`✅ Ranked users seeded successfully! Total users in '${DB_NAME}.users': ${totalCount}`);
  } catch (err) {
    console.error('❌ Error seeding ranked users:', err);
  } finally {
    await client.close();
  }
}

seedRankedUsers();
