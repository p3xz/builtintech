/**
 * Development Test User Seeder for Built In Tech
 * 
 * Seeds a verified development test user with:
 * - 6 of 8 modules completed in Python Fundamentals
 * - Passed quizzes with real percentage scores
 * - 450 XP, Level 3, 5-day active streak
 * - Education Rank: 'Apprentice I'
 * - Unlocked achievements ('first_program', 'first_quiz', 'first_module', 'streak_3')
 * - Clearly marked with `isTestUser: true` to prevent inclusion in production queries
 * 
 * Usage:
 *   node scripts/seed-test-user.js
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'insidcode';

const TEST_USER = {
  email: 'test.learner@builtintech.internal',
  name: 'Dev Test Learner',
  username: 'test_learner_dev',
  usernameNormalized: 'test_learner_dev',
  displayName: 'Dev Test Learner',
  role: 'user',
  experienceLevel: 'Intermediate',
  selectedLanguages: ['python', 'java'],
  xp: 450,
  level: 3,
  currentStreak: 5,
  longestStreak: 8,
  duelRating: 1000,
  duelsPlayed: 0,
  duelsWon: 0,
  duelsLost: 0,
  solvedProblems: [],
  attemptedProblems: [],
  totalSubmissions: 0,
  acceptedSubmissions: 0,
  isTestUser: true, // EXPLICIT TEST FLAG
  provider: 'google',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date(),
};

async function seedTestUser() {
  console.log('====================================================');
  console.log('🧪 BUILT IN TECH - TEST USER SEEDER (DEV ONLY)');
  console.log('====================================================');
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  console.log(`Database: ${DB_NAME}`);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  // 1. Upsert Test User
  const userResult = await db.collection('users').findOneAndUpdate(
    { email: TEST_USER.email },
    { $set: TEST_USER },
    { upsert: true, returnDocument: 'after' }
  );

  const userId = userResult?._id ? userResult._id.toString() : TEST_USER.email;
  console.log(`✅ Test User Seeded: ${TEST_USER.email} (ID: ${userId})`);

  // 2. Python Fundamentals 6 Modules Completed
  const completedModules = [
    'mod_python_environment_setup_python_basics',
    'mod_python_data_types_and_operators',
    'mod_python_control_flow',
    'mod_python_data_structures',
    'mod_python_functions',
    'mod_python_modules_and_file_io',
  ];

  const unlockedModules = [
    ...completedModules,
    'mod_python_oop_basics', // 7th module unlocked for next action!
  ];

  const completedLessons = [
    'les_mod_python_environment_setup_python_basics_interpreter_and_syntax',
    'les_mod_python_data_types_and_operators_primitives_and_casting',
    'les_mod_python_control_flow_conditionals_and_loops',
    'les_mod_python_data_structures_collections_and_comprehensions',
    'les_mod_python_functions_defining_functions_and_generators',
    'les_mod_python_modules_and_file_io_context_managers_and_io',
  ];

  const passedQuizzes = [
    'quiz_mod_python_environment_setup_python_basics',
    'quiz_mod_python_data_types_and_operators',
    'quiz_mod_python_control_flow',
    'quiz_mod_python_data_structures',
    'quiz_mod_python_functions',
    'quiz_mod_python_modules_and_file_io',
  ];

  // 3. Upsert User Progress
  await db.collection('user_progress').updateOne(
    { userId },
    {
      $set: {
        userId,
        userEmail: TEST_USER.email,
        currentCourse: 'course_python',
        currentModule: 'mod_python_oop_basics',
        currentLesson: 'les_mod_python_oop_basics_classes_and_dunder_methods',
        completedLessons,
        completedExercises: completedLessons,
        completedModules,
        unlockedModules,
        passedQuizzes,
        completedCourses: [],
        isTestUser: true,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
  console.log('✅ Seeded Python Fundamentals Progress: 6 / 8 modules completed (75%).');

  // 4. Seed Quiz Attempts
  for (const qId of passedQuizzes) {
    await db.collection('quiz_attempts').updateOne(
      { userId, quizId: qId },
      {
        $set: {
          userId,
          userEmail: TEST_USER.email,
          quizId: qId,
          courseId: 'course_python',
          scorePercentage: 100,
          passed: true,
          totalQuestions: 2,
          correctCount: 2,
          isTestUser: true,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }
  console.log(`✅ Seeded ${passedQuizzes.length} verified Quiz Attempts.`);

  // 5. Seed Unlocked Achievements
  const unlockedAchievements = ['first_program', 'first_quiz', 'first_module', 'streak_3'];
  for (const code of unlockedAchievements) {
    await db.collection('user_achievements').updateOne(
      { userId, achievementCode: code },
      {
        $set: {
          userId,
          achievementCode: code,
          isTestUser: true,
          unlockedAt: new Date('2026-01-05T12:00:00Z'),
        },
      },
      { upsert: true }
    );
  }
  console.log(`✅ Seeded ${unlockedAchievements.length} Unlocked Achievements.`);

  console.log('----------------------------------------------------');
  console.log('🎉 Development Test User Seeding Completed Successfully!');
  console.log('Credentials/Identity:');
  console.log(`   Email:    ${TEST_USER.email}`);
  console.log(`   Username: ${TEST_USER.username}`);
  console.log(`   XP:       ${TEST_USER.xp} (Level ${TEST_USER.level})`);
  console.log('----------------------------------------------------');

  await client.close();
}

if (require.main === module) {
  seedTestUser().catch(console.error);
}

module.exports = { seedTestUser };
