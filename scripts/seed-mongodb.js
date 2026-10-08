const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'built_in_tech';

const ALL_13_LANGUAGES = [
  { slug: 'python', name: 'Python', difficulty: 'Beginner', order: 1, icon: 'python', color: '#3776AB', desc: 'Clean syntax, data structures, backend engineering & AI scripts.' },
  { slug: 'javascript', name: 'JavaScript', difficulty: 'Beginner', order: 2, icon: 'javascript', color: '#F7DF1E', desc: 'The language of the web: modern DOM, asynchronous event loops & full-stack logic.' },
  { slug: 'typescript', name: 'TypeScript', difficulty: 'Intermediate', order: 3, icon: 'typescript', color: '#3178C6', desc: 'Typed JavaScript for enterprise web applications & robust architecture.' },
  { slug: 'html', name: 'HTML', difficulty: 'Beginner', order: 4, icon: 'html5', color: '#E34F26', desc: 'Semantic web document structure, accessibility, and modern HTML5 APIs.' },
  { slug: 'css', name: 'CSS', difficulty: 'Beginner', order: 5, icon: 'css3', color: '#1572B6', desc: 'Responsive layout design, Flexbox, CSS Grid, animations & typography.' },
  { slug: 'sql', name: 'SQL', difficulty: 'Beginner', order: 6, icon: 'database', color: '#336791', desc: 'Relational data querying, joins, aggregations, window functions & indexing.' },
  { slug: 'java', name: 'Java', difficulty: 'Intermediate', order: 7, icon: 'java', color: '#ED8B00', desc: 'Object-oriented software engineering, collections & robust backend systems.' },
  { slug: 'c', name: 'C', difficulty: 'Intermediate', order: 8, icon: 'c', color: '#A8B9CC', desc: 'Foundational low-level systems programming, pointers & manual memory management.' },
  { slug: 'cpp', name: 'C++', difficulty: 'Advanced', order: 9, icon: 'cpp', color: '#00599C', desc: 'High-performance systems programming, STL containers & modern C++ idioms.' },
  { slug: 'csharp', name: 'C#', difficulty: 'Intermediate', order: 10, icon: 'csharp', color: '#239120', desc: 'Enterprise .NET development, asynchronous tasks, LINQ & cross-platform apps.' },
  { slug: 'php', name: 'PHP', difficulty: 'Beginner', order: 11, icon: 'php', color: '#777BB4', desc: 'Server-side web scripting, REST API backends & modern dynamic systems.' },
  { slug: 'swift', name: 'Swift', difficulty: 'Intermediate', order: 12, icon: 'swift', color: '#F05138', desc: 'Modern Apple ecosystem engineering, protocol-oriented design & type safety.' },
  { slug: 'ruby', name: 'Ruby', difficulty: 'Beginner', order: 13, icon: 'ruby', color: '#CC342D', desc: 'Elegant developer-friendly programming, blocks & expressive OOP paradigms.' },
];

async function seed() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI} (${DB_NAME})...`);
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  // 1. Admin Account
  const adminEmail = 'nam4sh@gmail.com';
  await db.collection('users').updateOne(
    { email: adminEmail },
    {
      $set: {
        email: adminEmail,
        name: 'Platform Administrator',
        role: 'admin',
        experienceLevel: 'Advanced',
        selectedLanguages: ['python', 'javascript', 'sql'],
        xp: 500,
        level: 3,
        currentStreak: 7,
        longestStreak: 14,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
  console.log(`✅ Admin verified: ${adminEmail}`);

  // 2. Achievements
  const achievements = [
    { code: 'first_program', title: 'First Spark', description: 'Completed your first lesson.', icon: 'zap', category: 'learning', xpReward: 50, criteriaType: 'first_program', criteriaThreshold: 1 },
    { code: 'first_quiz', title: 'Knowledge Seeker', description: 'Passed your first knowledge checkpoint quiz.', icon: 'award', category: 'learning', xpReward: 75, criteriaType: 'first_quiz', criteriaThreshold: 1 },
    { code: 'streak_7', title: '7-Day Flame', description: 'Maintained an unbroken 7-day learning streak.', icon: 'flame', category: 'streak', xpReward: 150, criteriaType: 'streak_days', criteriaThreshold: 7 },
    { code: 'first_course', title: 'Graduate of the Forge', description: 'Graduated from your first course track.', icon: 'shield', category: 'mastery', xpReward: 300, criteriaType: 'first_course', criteriaThreshold: 1 },
    { code: 'polyglot_3', title: 'Polyglot Prodigy', description: 'Completed 3 or more distinct languages.', icon: 'globe', category: 'mastery', xpReward: 500, criteriaType: 'polyglot', criteriaThreshold: 3 },
  ];

  for (const ach of achievements) {
    await db.collection('achievements').updateOne({ code: ach.code }, { $set: ach }, { upsert: true });
  }
  console.log(`✅ Seeded ${achievements.length} Achievements.`);

  // 3. Courses, Modules, Lessons, Question Bank & Quizzes
  for (const lang of ALL_13_LANGUAGES) {
    const courseId = `course_${lang.slug}`;
    await db.collection('courses').updateOne(
      { courseId },
      {
        $set: {
          courseId,
          slug: lang.slug,
          title: `${lang.name} Master Track`,
          language: lang.name,
          description: lang.desc,
          difficulty: lang.difficulty,
          ordering: lang.order,
          icon: lang.icon,
          color: lang.color,
          published: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const mod1Id = `mod_${lang.slug}_fundamentals`;
    const quiz1Id = `quiz_${lang.slug}_mod1`;
    await db.collection('modules').updateOne(
      { moduleId: mod1Id },
      {
        $set: {
          moduleId: mod1Id,
          courseId,
          slug: 'fundamentals',
          title: `${lang.name} Fundamentals & Syntax`,
          description: `Variables, primitives, operators, and control flow in ${lang.name}.`,
          difficulty: 'Beginner',
          ordering: 1,
          published: true,
          quizId: quiz1Id,
          xpReward: 100,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const les1Id = `les_${lang.slug}_intro`;
    await db.collection('lessons').updateOne(
      { lessonId: les1Id },
      {
        $set: {
          lessonId: les1Id,
          moduleId: mod1Id,
          courseId,
          slug: 'intro-syntax',
          title: 'Syntax & Output Statements',
          content: `# ${lang.name} Fundamentals\n\nLearn core syntax statements and console printing.`,
          concepts: ['Syntax', 'Variables', 'Output'],
          ordering: 1,
          published: true,
          xpReward: 25,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Questions (MCQ, Fill in blank, Drag & drop, Debug, Output prediction, Coding exercise)
    const q1Id = `q_${lang.slug}_mcq_1`;
    await db.collection('questions').updateOne(
      { questionId: q1Id },
      {
        $set: {
          questionId: q1Id,
          courseId,
          moduleId: mod1Id,
          lessonId: les1Id,
          questionType: 'mcq',
          questionText: `Which describes immutable data structures in ${lang.name}?`,
          options: [
            'Cannot be modified in-place after creation',
            'Can be modified from any thread concurrently',
            'Has no data type',
            'Always saved to disk',
          ],
          correctAnswer: 'Cannot be modified in-place after creation',
          explanation: 'Immutable data types guarantee state preservation after instantiation.',
          difficulty: 'Beginner',
          ordering: 1,
          published: true,
          xpReward: 25,
        },
      },
      { upsert: true }
    );

    const q2Id = `q_${lang.slug}_fill_1`;
    await db.collection('questions').updateOne(
      { questionId: q2Id },
      {
        $set: {
          questionId: q2Id,
          courseId,
          moduleId: mod1Id,
          lessonId: les1Id,
          questionType: 'fill_blank',
          questionText: 'Fill in the assignment operator to set variable `points` to 50.',
          template: 'points ___ 50',
          blanks: ['='],
          correctAnswer: '=',
          explanation: "The assignment operator '=' assigns the right value to the variable.",
          difficulty: 'Beginner',
          ordering: 2,
          published: true,
          xpReward: 25,
        },
      },
      { upsert: true }
    );

    // Module Quiz (Gated)
    await db.collection('quizzes').updateOne(
      { quizId: quiz1Id },
      {
        $set: {
          quizId: quiz1Id,
          moduleId: mod1Id,
          courseId,
          title: `${lang.name} Fundamentals Checkpoint Quiz`,
          quizType: 'module_quiz',
          questionIds: [q1Id, q2Id],
          passPercentage: 66,
          xpReward: 75,
          published: true,
        },
      },
      { upsert: true }
    );
  }
  console.log('✅ Seeded 13 Language Courses, Modules, Lessons, Questions, and Quizzes into MongoDB.');

  await client.close();
  console.log('🎉 MongoDB seeding finished successfully!');
}

seed().catch(console.error);
