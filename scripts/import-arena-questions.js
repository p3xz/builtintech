/**
 * Safe Migration Script: Import Arena Questions
 * 
 * Copies/upserts questions from `insidcode.questions` into `builtintech.questions`
 * on MongoDB Atlas without duplicate creation or data loss.
 * 
 * Usage:
 *   node scripts/import-arena-questions.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const BUILTINTECH_DB_NAME = process.env.MONGODB_DB_NAME || 'builtintech';

const INSIDCODE_URI = process.env.INSIDCODE_MONGODB_URI || MONGODB_URI;
const INSIDCODE_DB_NAME = process.env.INSIDCODE_DB_NAME || 'insidcode';

async function importQuestions() {
  console.log('====================================================');
  console.log('🚀 BUILT IN TECH - ARENA QUESTION IMPORT & SYNC');
  console.log('====================================================');
  console.log(`Source (InsidCode DB): ${INSIDCODE_DB_NAME}`);
  console.log(`Target (BuiltInTech DB): ${BUILTINTECH_DB_NAME}`);

  const sourceClient = new MongoClient(INSIDCODE_URI);
  const targetClient = new MongoClient(MONGODB_URI);

  try {
    await sourceClient.connect();
    console.log('✅ Connected to Source MongoDB Cluster.');

    await targetClient.connect();
    console.log('✅ Connected to Target MongoDB Cluster.');

    const sourceDb = sourceClient.db(INSIDCODE_DB_NAME);
    const targetDb = targetClient.db(BUILTINTECH_DB_NAME);

    const sourceCollection = sourceDb.collection('questions');
    const targetCollection = targetDb.collection('questions');

    const totalSourceQuestions = await sourceCollection.countDocuments();
    console.log(`📊 Found ${totalSourceQuestions} questions in ${INSIDCODE_DB_NAME}.questions`);

    if (totalSourceQuestions === 0) {
      console.log('⚠️ No questions found in source database. Nothing to import.');
      return;
    }

    const cursor = sourceCollection.find({});
    let upsertedCount = 0;
    let modifiedCount = 0;
    let skippedCount = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc) continue;

      const problemId = String(doc.problemId || doc.id || doc._id);
      const slug = doc.slug || `problem-${problemId}`;

      const questionData = {
        problemId,
        title: doc.title || 'Untitled Problem',
        slug,
        difficulty: doc.difficulty || 'Easy',
        description: doc.description || '',
        constraints: Array.isArray(doc.constraints) ? doc.constraints : [],
        examples: Array.isArray(doc.examples) ? doc.examples : [],
        hiddenTestCases: Array.isArray(doc.hiddenTestCases) ? doc.hiddenTestCases : [],
        starterTemplates: doc.starterTemplates || {},
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        phase: doc.phase || 'foundation',
        xp: typeof doc.xp === 'number' ? doc.xp : 100,
        referenceSolution: doc.referenceSolution,
        isPublished: doc.isPublished !== false,
        updatedAt: new Date(),
      };

      const result = await targetCollection.updateOne(
        {
          $or: [
            { problemId },
            { slug },
          ],
        },
        {
          $set: questionData,
          $setOnInsert: {
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        upsertedCount++;
      } else if (result.modifiedCount > 0) {
        modifiedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('----------------------------------------------------');
    console.log(`🎉 Import Summary:`);
    console.log(`   - Newly Upserted: ${upsertedCount}`);
    console.log(`   - Updated Existing: ${modifiedCount}`);
    console.log(`   - Unchanged: ${skippedCount}`);
    console.log(`   - Total Processed: ${totalSourceQuestions}`);
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error('❌ Import failed with error:', error);
  } finally {
    await sourceClient.close();
    await targetClient.close();
    console.log('🔒 Database connections closed.');
  }
}

if (require.main === module) {
  importQuestions();
}

module.exports = { importQuestions };
