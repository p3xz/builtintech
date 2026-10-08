/**
 * Comprehensive Education Curriculum Seed Script for Built In Tech
 * 
 * Seeds:
 * 1. The 4 published curriculum tracks:
 *    - Python Fundamentals (8 Modules)
 *    - Java Object-Oriented Core (12 Modules)
 *    - C & C++ Systems Foundations (12 Modules)
 *    - C Low-Level Programming (12 Modules)
 * 2. 9 additional courses marked published: false (Unavailable / Coming Soon)
 * 3. Complete modules, lessons, questions (MCQ, Fill in blank, code exercise), and checkpoint quizzes
 * 4. Education Ranks collection (XP tiers)
 * 5. Platform Achievements collection
 * 6. Daily Missions
 * 7. Admin user (nam4sh@gmail.com)
 * 
 * Usage:
 *   node scripts/seed-education.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'builtintech';

// ── 4 PUBLISHED COURSES WITH EXACT MODULE CURRICULA ──
const PUBLISHED_COURSES = [
  {
    courseId: 'course_python',
    slug: 'python',
    title: 'Python Fundamentals',
    language: 'Python',
    difficulty: 'Beginner',
    ordering: 1,
    icon: 'python',
    color: '#3776AB',
    description: 'Master Python from core syntax to algorithmic thinking, data structures, OOP, and type safety.',
    published: true,
    modules: [
      {
        slug: 'environment-setup-python-basics',
        title: 'Environment Setup & Python Basics',
        description: 'Interpreter setup, dynamic typing, syntax, indentation, and standard I/O.',
        lessons: [
          {
            slug: 'interpreter-and-syntax',
            title: 'Python Interpreter & Indentation',
            content: '# Python Setup & Syntax\n\nPython uses indentation to define code blocks. Learn how statements execute line by line.',
            concepts: ['Interpreter', 'Indentation', 'print()'],
            xp: 25,
            questions: [
              {
                type: 'mcq',
                text: 'How does Python define code blocks instead of using curly braces {}?',
                options: ['Indentation (whitespace)', 'Semicolons', 'Tags like <block>', 'Square brackets []'],
                correctAnswer: 'Indentation (whitespace)',
                explanation: 'Python uses uniform indentation (conventionally 4 spaces) to delimit code blocks.',
                xp: 25,
              },
            ],
          },
        ],
      },
      {
        slug: 'data-types-and-operators',
        title: 'Data Types & Operators',
        description: 'Integers, floats, booleans, strings, type casting, arithmetic, and logical operators.',
        lessons: [
          {
            slug: 'primitives-and-casting',
            title: 'Primitives & Type Casting',
            content: '# Primitives & Casting\n\nUnderstand int, float, str, bool, and explicit type conversion with int(), float(), str().',
            concepts: ['int', 'float', 'str', 'bool', 'Type Casting'],
            xp: 25,
            questions: [
              {
                type: 'fill_blank',
                text: 'Convert the string variable `s = "42"` to an integer.',
                template: 'num = ___(s)',
                blanks: ['int'],
                correctAnswer: 'int',
                explanation: 'int("42") converts the numeric string "42" into integer 42.',
                xp: 25,
              },
            ],
          },
        ],
      },
      {
        slug: 'control-flow',
        title: 'Control Flow',
        description: 'Conditional branching (if/elif/else), while loops, for loops, and loop control statements.',
        lessons: [
          {
            slug: 'conditionals-and-loops',
            title: 'Conditionals & Range Iteration',
            content: '# Control Flow\n\nMaster if/elif/else statements and iterating over collections using for x in range().',
            concepts: ['if/elif/else', 'for loop', 'range()', 'break/continue'],
            xp: 25,
            questions: [
              {
                type: 'mcq',
                text: 'What does `range(1, 5)` generate when iterated?',
                options: ['1, 2, 3, 4', '1, 2, 3, 4, 5', '0, 1, 2, 3, 4', '1, 3, 5'],
                correctAnswer: '1, 2, 3, 4',
                explanation: 'range(start, stop) generates integers up to but excluding stop.',
                xp: 25,
              },
            ],
          },
        ],
      },
      {
        slug: 'data-structures',
        title: 'Data Structures',
        description: 'Lists, dictionaries, tuples, sets, slicing, and list/dict comprehensions.',
        lessons: [
          {
            slug: 'collections-and-comprehensions',
            title: 'Collections & Comprehensions',
            content: '# Data Structures\n\nWork with mutable lists, fast key-value dicts, unique sets, and concise comprehensions.',
            concepts: ['List', 'Dict', 'Set', 'Tuple', 'Comprehensions'],
            xp: 25,
            questions: [
              {
                type: 'mcq',
                text: 'Which Python collection type enforces unique elements with O(1) membership checking?',
                options: ['Set', 'List', 'Tuple', 'String'],
                correctAnswer: 'Set',
                explanation: 'Sets store unique hashable items and provide average O(1) lookup.',
                xp: 25,
              },
            ],
          },
        ],
      },
      {
        slug: 'functions',
        title: 'Functions',
        description: 'Parameters, *args, **kwargs, lambda expressions, decorators, and generators with yield.',
        lessons: [
          {
            slug: 'defining-functions-and-generators',
            title: 'Functions, Decorators & Generators',
            content: '# Functions & Generators\n\nLearn first-class functions, higher-order decorators, and memory-efficient generators with yield.',
            concepts: ['def', '*args', '**kwargs', 'Decorators', 'yield'],
            xp: 25,
            questions: [
              {
                type: 'mcq',
                text: 'Which keyword turns a standard function into a memory-efficient generator iterator?',
                options: ['yield', 'return', 'generate', 'async'],
                correctAnswer: 'yield',
                explanation: 'The yield statement suspends execution and yields values lazily without buffering in memory.',
                xp: 25,
              },
            ],
          },
        ],
      },
      {
        slug: 'modules-and-file-io',
        title: 'Modules & File I/O',
        description: 'Importing modules, package layout, context managers (with open), JSON serialization.',
        lessons: [
          {
            slug: 'context-managers-and-io',
            title: 'Context Managers & File I/O',
            content: '# File I/O & Modules\n\nSafely read and write files with the `with` statement and organize code into importable packages.',
            concepts: ['with open()', 'read/write', 'import', 'json'],
            xp: 25,
            questions: [
              {
                type: 'mcq',
                text: 'Why is `with open(...) as f:` preferred over manual `f.close()`?',
                options: [
                  'It guarantees file closure even if an exception occurs',
                  'It makes file reading faster',
                  'It encrypts file contents',
                  'It bypasses OS file permissions',
                ],
                correctAnswer: 'It guarantees file closure even if an exception occurs',
                explanation: 'Context managers invoke __exit__ to ensure resource cleanup reliably.',
                xp: 25,
              },
            ],
          },
        ],
      },
      {
        slug: 'oop-basics',
        title: 'Object-Oriented Programming Basics',
        description: 'Classes, __init__, instance vs class variables, inheritance, and dunder methods.',
        lessons: [
          {
            slug: 'classes-and-dunder-methods',
            title: 'Classes, Objects & Dunder Methods',
            content: '# OOP in Python\n\nCreate custom types with class, initialize attributes in __init__, and implement __str__ and __repr__.',
            concepts: ['class', '__init__', 'self', 'Inheritance', '__str__'],
            xp: 25,
            questions: [
              {
                type: 'fill_blank',
                text: 'Fill in the initializer method name for a Python class.',
                template: 'def ___(self, name):',
                blanks: ['__init__'],
                correctAnswer: '__init__',
                explanation: '__init__ is the constructor method in Python classes.',
                xp: 25,
              },
            ],
          },
        ],
      },
      {
        slug: 'testing-and-type-hints',
        title: 'Testing & Type Hints',
        description: 'Type annotations (typing module), pytest/unittest basics, assertions, and defensive coding.',
        lessons: [
          {
            slug: 'typing-and-unit-tests',
            title: 'Type Hints & Automated Testing',
            content: '# Testing & Type Hints\n\nAdd type safety with annotations and write test suites with pytest or unittest.',
            concepts: ['Type Hints', 'Union/Optional', 'pytest', 'assert'],
            xp: 25,
            questions: [
              {
                type: 'mcq',
                text: 'Which type annotation represents a value that can be either an integer or None?',
                options: ['Optional[int]', 'List[int]', 'Any[int]', 'Nullable<int>'],
                correctAnswer: 'Optional[int]',
                explanation: 'Optional[T] (or Union[T, None]) denotes a type that may be None.',
                xp: 25,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── 2. JAVA OBJECT-ORIENTED CORE ──
  {
    courseId: 'course_java',
    slug: 'java',
    title: 'Java Object-Oriented Core',
    language: 'Java',
    difficulty: 'Intermediate',
    ordering: 2,
    icon: 'java',
    color: '#ED8B00',
    description: 'Master enterprise Java: OOP, generics, collections, functional lambdas, streams, I/O, JUnit, and SOLID design patterns.',
    published: true,
    modules: [
      { slug: 'java-fundamentals', title: 'Java Fundamentals', description: 'JVM architecture, bytecode, primitive types, control structures, and methods.' },
      { slug: 'classes-and-objects', title: 'Classes & Objects', description: 'Class declarations, constructors, heap memory allocation, and reference semantics.' },
      { slug: 'encapsulation', title: 'Encapsulation', description: 'Access modifiers (private, protected, public), getters/setters, immutability, and records.' },
      { slug: 'inheritance', title: 'Inheritance', description: 'Superclasses, method overriding with @Override, the super keyword, and Object class methods.' },
      { slug: 'polymorphism', title: 'Polymorphism', description: 'Dynamic method dispatch, runtime polymorphism, upcasting, downcasting, and instanceof.' },
      { slug: 'abstraction-and-interfaces', title: 'Abstraction & Interfaces', description: 'Abstract classes, interface contracts, default methods, and multiple inheritance of type.' },
      { slug: 'generics', title: 'Generics', description: 'Type parameters, generic classes & methods, bounded type parameters, and wildcard generics (? extends / ? super).' },
      { slug: 'collections-framework', title: 'Collections Framework', description: 'List (ArrayList, LinkedList), Set (HashSet, TreeSet), Map (HashMap, TreeMap), and algorithms.' },
      { slug: 'lambdas-and-functional-java', title: 'Lambdas & Functional Java', description: 'Functional interfaces, lambda expressions, method references, Predicate, Function, and Consumer.' },
      { slug: 'streams-and-optional', title: 'Streams & Optional', description: 'Stream pipelines, filter, map, flatMap, collectors, parallel streams, and null safety with Optional.' },
      { slug: 'io-and-junit-testing', title: 'I/O & JUnit Testing', description: 'NIO.2 paths, files, buffered readers, unit testing with JUnit 5 assertions, and test lifecycles.' },
      { slug: 'solid-and-design-patterns', title: 'SOLID & Design Patterns Introduction', description: 'Single Responsibility, Open-Closed, Liskov, Interface Segregation, Dependency Inversion, Factory & Singleton patterns.' },
    ],
  },

  // ── 3. C & C++ SYSTEMS FOUNDATIONS ──
  {
    courseId: 'course_cpp',
    slug: 'cpp',
    title: 'C & C++ Systems Foundations',
    language: 'C++',
    difficulty: 'Intermediate',
    ordering: 3,
    icon: 'cpp',
    color: '#00599C',
    description: 'Foundational systems engineering: memory layout, pointers, RAII, templates, STL, smart pointers, modern C++20, and concurrency.',
    published: true,
    modules: [
      { slug: 'c-fundamentals', title: 'C Fundamentals', description: 'C compilation stages, data representations, control flow, functions, and arrays.' },
      { slug: 'pointers-and-memory', title: 'Pointers & Memory', description: 'Address-of operator &, dereference *, pointer arithmetic, stack vs heap, and malloc/free.' },
      { slug: 'preprocessor-and-structs', title: 'Preprocessor & Structs', description: 'Macros, header guards, struct layout, memory alignment, padding, and typedef.' },
      { slug: 'c-file-io', title: 'C File I/O', description: 'Standard streams, fopen, fread, fwrite, fseek, and binary file representations.' },
      { slug: 'cpp-fundamentals', title: 'C++ Fundamentals', description: 'Namespaces, references vs pointers, const-correctness, function overloading, and auto.' },
      { slug: 'cpp-oop', title: 'C++ OOP', description: 'Classes, constructors, destructors, rule of three/five/zero, operator overloading, and inheritance.' },
      { slug: 'raii-and-resource-management', title: 'RAII & Resource Management', description: 'Resource Acquisition Is Initialization, deterministic destruction, and exception safety.' },
      { slug: 'templates', title: 'Templates', description: 'Function templates, class templates, non-type template parameters, and template specialization.' },
      { slug: 'stl', title: 'STL', description: 'Standard Template Library: std::vector, std::map, iterators, and <algorithm> utilities.' },
      { slug: 'smart-pointers', title: 'Smart Pointers', description: 'std::unique_ptr, std::shared_ptr, std::weak_ptr, make_unique, and memory leak prevention.' },
      { slug: 'move-semantics', title: 'Move Semantics', description: 'Rvalue references (&&), std::move, move constructors, move assignment, and perfect forwarding.' },
      { slug: 'modern-cpp-and-concurrency', title: 'Modern C++ & Concurrency', description: 'C++11 to C++20 features: concepts, ranges, std::thread, std::async, mutexes, and atomics.' },
    ],
  },

  // ── 4. C LOW-LEVEL PROGRAMMING ──
  {
    courseId: 'course_c',
    slug: 'c',
    title: 'C Low-Level Programming',
    language: 'C',
    difficulty: 'Advanced',
    ordering: 4,
    icon: 'c',
    color: '#A8B9CC',
    description: 'Advanced systems programming: bit manipulation, memory internals, POSIX syscalls, processes, signals, pthreads, sockets, bare-metal, and exploitation defense.',
    published: true,
    modules: [
      { slug: 'bit-manipulation', title: 'Bit Manipulation', description: 'Bitwise AND, OR, XOR, shifts, bitmasks, flags, endianness detection, and packed structs.' },
      { slug: 'memory-model-internals', title: 'Memory Model Internals', description: 'Virtual memory pages, memory segmentation (.text, .data, .bss, heap, stack), and mprotect.' },
      { slug: 'advanced-pointers', title: 'Advanced Pointers', description: 'Function pointers, callbacks, void* generic dispatch, pointer aliasing, and restrict keyword.' },
      { slug: 'manual-data-structures', title: 'Manual Data Structures', description: 'Intrusive linked lists, memory pools, custom ring buffers, and cache-friendly hash tables.' },
      { slug: 'posix-system-calls', title: 'POSIX System Calls', description: 'Direct kernel boundary transitions, open, read, write, close, lseek, ioctl, and error handling.' },
      { slug: 'processes-and-signals', title: 'Processes & Signals', description: 'Process creation with fork, execve, waitpid, IPC pipes, signal handlers, and sigaction.' },
      { slug: 'pthreads-and-atomics', title: 'Pthreads & Atomics', description: 'POSIX threads, mutexes, condition variables, reader-writer locks, and lock-free C11 atomics.' },
      { slug: 'socket-programming', title: 'Socket Programming', description: 'TCP/UDP network sockets, bind, listen, accept, non-blocking I/O with poll/epoll, and HTTP parsing.' },
      { slug: 'embedded-bare-metal-c', title: 'Embedded / Bare-Metal C', description: 'Memory-mapped I/O, volatile qualifier, linker scripts, register bitfields, and startup code.' },
      { slug: 'security-and-memory-exploitation', title: 'Security & Memory Exploitation Concepts', description: 'Buffer overflows, stack smashing, return-to-libc, ASLR, DEP/NX, and defensive sanitizers.' },
      { slug: 'performance-optimization', title: 'Performance Optimization', description: 'CPU cache line alignment, branch prediction hints (__builtin_expect), SIMD vectorization, and perf profiling.' },
      { slug: 'systems-capstone-projects', title: 'Systems Capstone Projects', description: 'Engineering full-scale systems: custom malloc allocator, Unix shell, and multi-threaded HTTP server.' },
    ],
  },
];

// ── 9 UNPUBLISHED COURSES (COMING SOON) ──
const UNPUBLISHED_COURSES = [
  { slug: 'javascript', name: 'JavaScript Modern Core', difficulty: 'Beginner', ordering: 5, icon: 'javascript', color: '#F7DF1E', desc: 'Asynchronous event loops, DOM, and full-stack logic.' },
  { slug: 'typescript', name: 'TypeScript Typed Systems', difficulty: 'Intermediate', ordering: 6, icon: 'typescript', color: '#3178C6', desc: 'Advanced types, generics, and enterprise architecture.' },
  { slug: 'html', name: 'HTML5 Semantic Web', difficulty: 'Beginner', ordering: 7, icon: 'html5', color: '#E34F26', desc: 'Semantic layout, accessibility, and modern web APIs.' },
  { slug: 'css', name: 'CSS3 & Modern Layouts', difficulty: 'Beginner', ordering: 8, icon: 'css3', color: '#1572B6', desc: 'Flexbox, CSS Grid, custom properties, and animations.' },
  { slug: 'sql', name: 'SQL & Relational Databases', difficulty: 'Beginner', ordering: 9, icon: 'database', color: '#336791', desc: 'Relational querying, joins, aggregations, and query optimization.' },
  { slug: 'csharp', name: 'C# & .NET Architecture', difficulty: 'Intermediate', ordering: 10, icon: 'csharp', color: '#239120', desc: 'Enterprise .NET, LINQ, and asynchronous services.' },
  { slug: 'php', name: 'PHP Modern Backend', difficulty: 'Beginner', ordering: 11, icon: 'php', color: '#777BB4', desc: 'Modern server-side development and REST API architectures.' },
  { slug: 'swift', name: 'Swift Apple Ecosystem', difficulty: 'Intermediate', ordering: 12, icon: 'swift', color: '#F05138', desc: 'Protocol-oriented programming, SwiftUI, and iOS systems.' },
  { slug: 'ruby', name: 'Ruby Expressive Programming', difficulty: 'Beginner', ordering: 13, icon: 'ruby', color: '#CC342D', desc: 'Expressive OOP, meta-programming, and rapid development.' },
];

// ── EDUCATION RANKS (XP BASED) ──
const EDUCATION_RANKS = [
  { rankId: 'rank_novice_1', name: 'Novice I', tier: 'Bronze', minimumXP: 0, maximumXP: 99, order: 1, icon: 'sparkles', perks: ['Access to all beginner curriculum tracks'] },
  { rankId: 'rank_novice_2', name: 'Novice II', tier: 'Bronze', minimumXP: 100, maximumXP: 249, order: 2, icon: 'zap', perks: ['Unlock daily mission tracking'] },
  { rankId: 'rank_apprentice_1', name: 'Apprentice I', tier: 'Silver', minimumXP: 250, maximumXP: 499, order: 3, icon: 'book-open', perks: ['Module quiz mastery rewards'] },
  { rankId: 'rank_apprentice_2', name: 'Apprentice II', tier: 'Silver', minimumXP: 500, maximumXP: 999, order: 4, icon: 'award', perks: ['Unlock personal code sandbox'] },
  { rankId: 'rank_developer_1', name: 'Developer I', tier: 'Gold', minimumXP: 1000, maximumXP: 1999, order: 5, icon: 'code', perks: ['Community project showcase publishing'] },
  { rankId: 'rank_developer_2', name: 'Developer II', tier: 'Gold', minimumXP: 2000, maximumXP: 3499, order: 6, icon: 'cpu', perks: ['Unlock Code Detective cases'] },
  { rankId: 'rank_engineer', name: 'Engineer', tier: 'Platinum', minimumXP: 3500, maximumXP: 5999, order: 7, icon: 'shield', perks: ['Unlock Code Architect missions'] },
  { rankId: 'rank_sr_engineer', name: 'Senior Engineer', tier: 'Diamond', minimumXP: 6000, maximumXP: 9999, order: 8, icon: 'terminal', perks: ['Course completion certificates'] },
  { rankId: 'rank_architect', name: 'Systems Architect', tier: 'Diamond', minimumXP: 10000, maximumXP: 15999, order: 9, icon: 'layers', perks: ['Vector SVG verified certificate badges'] },
  { rankId: 'rank_grandmaster', name: 'Grandmaster', tier: 'Master', minimumXP: 16000, maximumXP: 999999, order: 10, icon: 'crown', perks: ['All platform privileges unlocked'] },
];

// ── ACHIEVEMENTS ──
const ACHIEVEMENTS = [
  { code: 'first_program', title: 'First Spark', description: 'Completed your first lesson.', icon: 'zap', category: 'learning', xpReward: 50, criteriaType: 'first_program', criteriaThreshold: 1 },
  { code: 'first_quiz', title: 'Knowledge Seeker', description: 'Passed your first knowledge checkpoint quiz.', icon: 'award', category: 'learning', xpReward: 75, criteriaType: 'first_quiz', criteriaThreshold: 1 },
  { code: 'first_module', title: 'Module Conqueror', description: 'Completed all lessons and passed the quiz in a module.', icon: 'check-circle', category: 'learning', xpReward: 100, criteriaType: 'first_module', criteriaThreshold: 1 },
  { code: 'streak_3', title: 'Spark Ignited', description: 'Maintained a 3-day active learning streak.', icon: 'flame', category: 'streak', xpReward: 75, criteriaType: 'streak_days', criteriaThreshold: 3 },
  { code: 'streak_7', title: '7-Day Flame', description: 'Maintained an unbroken 7-day learning streak.', icon: 'flame', category: 'streak', xpReward: 150, criteriaType: 'streak_days', criteriaThreshold: 7 },
  { code: 'streak_30', title: 'Unstoppable Fire', description: 'Maintained a 30-day learning streak.', icon: 'flame', category: 'streak', xpReward: 500, criteriaType: 'streak_days', criteriaThreshold: 30 },
  { code: 'first_course', title: 'Graduate of the Forge', description: 'Graduated from your first complete curriculum track.', icon: 'shield', category: 'mastery', xpReward: 300, criteriaType: 'first_course', criteriaThreshold: 1 },
  { code: 'systems_master', title: 'Systems Master', description: 'Completed C Low-Level or C++ Systems Foundations.', icon: 'cpu', category: 'mastery', xpReward: 500, criteriaType: 'systems_master', criteriaThreshold: 1 },
  { code: 'polyglot_4', title: 'Grand Polyglot', description: 'Completed all 4 master tracks.', icon: 'globe', category: 'mastery', xpReward: 1000, criteriaType: 'polyglot', criteriaThreshold: 4 },
];

async function seedEducation() {
  console.log('====================================================');
  console.log('🌱 BUILT IN TECH - EDUCATION DATABASE SEEDER');
  console.log('====================================================');
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  console.log(`Database: ${DB_NAME}`);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log('✅ Connected successfully to MongoDB.');

  // 1. Admin Verification
  const adminEmail = 'nam4sh@gmail.com';
  await db.collection('users').updateOne(
    { email: adminEmail },
    {
      $set: {
        email: adminEmail,
        name: 'Platform Administrator',
        role: 'admin',
        experienceLevel: 'Advanced',
        selectedLanguages: ['python', 'java', 'cpp', 'c'],
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
  console.log(`✅ Verified Platform Admin: ${adminEmail}`);

  // 2. Seed Ranks
  for (const rank of EDUCATION_RANKS) {
    await db.collection('ranks').updateOne({ rankId: rank.rankId }, { $set: rank }, { upsert: true });
  }
  console.log(`✅ Seeded ${EDUCATION_RANKS.length} Education XP Ranks.`);

  // 3. Seed Achievements
  for (const ach of ACHIEVEMENTS) {
    await db.collection('achievements').updateOne({ code: ach.code }, { $set: ach }, { upsert: true });
  }
  console.log(`✅ Seeded ${ACHIEVEMENTS.length} Achievements.`);

  // 4. Seed 4 Active Courses & Detailed Modules
  let totalModules = 0;
  let totalLessons = 0;
  let totalQuestions = 0;

  for (const c of PUBLISHED_COURSES) {
    const courseId = c.courseId;
    await db.collection('courses').updateOne(
      { courseId },
      {
        $set: {
          courseId,
          slug: c.slug,
          title: c.title,
          language: c.language,
          difficulty: c.difficulty,
          ordering: c.ordering,
          icon: c.icon,
          color: c.color,
          description: c.description,
          published: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    let modOrder = 1;
    for (const m of c.modules) {
      totalModules++;
      const moduleId = `mod_${c.slug}_${m.slug.replace(/[^a-zA-Z0-9_]/g, '_')}`;
      const quizId = `quiz_${moduleId}`;

      await db.collection('modules').updateOne(
        { moduleId },
        {
          $set: {
            moduleId,
            courseId,
            slug: m.slug,
            title: m.title,
            description: m.description,
            difficulty: c.difficulty,
            ordering: modOrder,
            published: true,
            quizId,
            xpReward: 100,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      // Lessons for this module
      const lessonsData = m.lessons || [
        {
          slug: `intro-${m.slug}`,
          title: `${m.title} - Core Concepts`,
          content: `# ${m.title}\n\nComprehensive exploration of ${m.title} in ${c.language}.`,
          concepts: [m.title, 'Syntax', 'Architecture'],
          xp: 25,
          questions: [
            {
              type: 'mcq',
              text: `Which statement accurately reflects the principles of ${m.title}?`,
              options: [
                `Follows standard ${c.language} specifications and best practices`,
                'Bypasses runtime guarantees',
                'Only executes on 32-bit hardware',
                'Requires manual assembly compilation',
              ],
              correctAnswer: `Follows standard ${c.language} specifications and best practices`,
              explanation: `Standard ${c.language} implementations adhere to official platform specifications.`,
              xp: 25,
            },
          ],
        },
      ];

      const questionIdsForQuiz = [];
      let lesOrder = 1;

      for (const les of lessonsData) {
        totalLessons++;
        const lessonId = `les_${moduleId}_${les.slug.replace(/[^a-zA-Z0-9_]/g, '_')}`;

        await db.collection('lessons').updateOne(
          { lessonId },
          {
            $set: {
              lessonId,
              moduleId,
              courseId,
              slug: les.slug,
              title: les.title,
              content: les.content,
              concepts: les.concepts,
              ordering: lesOrder,
              published: true,
              xpReward: les.xp || 25,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );

        // Questions in this lesson
        let qOrder = 1;
        for (const q of les.questions) {
          totalQuestions++;
          const questionId = `q_${lessonId}_${qOrder}`;
          questionIdsForQuiz.push(questionId);

          await db.collection('questions').updateOne(
            { questionId },
            {
              $set: {
                questionId,
                courseId,
                moduleId,
                lessonId,
                questionType: q.type,
                questionText: q.text,
                options: q.options,
                template: q.template,
                blanks: q.blanks,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                difficulty: c.difficulty,
                ordering: qOrder,
                published: true,
                xpReward: q.xp || 25,
                updatedAt: new Date(),
              },
            },
            { upsert: true }
          );
          qOrder++;
        }
        lesOrder++;
      }

      // Checkpoint Quiz for this module (Gated!)
      await db.collection('quizzes').updateOne(
        { quizId },
        {
          $set: {
            quizId,
            moduleId,
            courseId,
            title: `${m.title} Checkpoint Quiz`,
            description: `Verify your understanding of ${m.title}. Score 66%+ to unlock the next module.`,
            quizType: 'module_quiz',
            questionIds: questionIdsForQuiz,
            passPercentage: 66,
            xpReward: 100,
            published: true,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      modOrder++;
    }
  }

  // 5. Seed 9 Unpublished Courses (Marked Coming Soon)
  for (const uc of UNPUBLISHED_COURSES) {
    const courseId = `course_${uc.slug}`;
    await db.collection('courses').updateOne(
      { courseId },
      {
        $set: {
          courseId,
          slug: uc.slug,
          title: uc.name,
          language: uc.name,
          difficulty: uc.difficulty,
          ordering: uc.ordering,
          icon: uc.icon,
          color: uc.color,
          description: uc.desc,
          published: false, // EXPLICITLY UNPUBLISHED / COMING SOON
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  console.log(`✅ Seeded ${PUBLISHED_COURSES.length} Active Published Courses.`);
  console.log(`✅ Seeded ${UNPUBLISHED_COURSES.length} Inactive / Coming Soon Courses (published: false).`);
  console.log(`✅ Total Modules Seeded: ${totalModules} (8 + 12 + 12 + 12 = 44)`);
  console.log(`✅ Total Lessons Seeded: ${totalLessons}`);
  console.log(`✅ Total Questions Seeded: ${totalQuestions}`);
  console.log('----------------------------------------------------');
  console.log('🎉 Built In Tech Education Database Seeding Completed Successfully!');

  await client.close();
}

if (require.main === module) {
  seedEducation().catch(console.error);
}

module.exports = { seedEducation };
