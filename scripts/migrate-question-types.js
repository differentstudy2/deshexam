const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Assumes existence, otherwise user will need to run it differently

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const mappings = {
    'Multiple Choice': 'MCQ',
    'True/False': 'T/F',
    'Fill in the Blank': 'FIB',
    'Matching': 'Match',
    'Creative Question': 'CQ',
    'Short Question': 'Desc',
    'Long Question': 'Desc',
    'Descriptive': 'Desc'
};

async function migrateQuestionTypes() {
    console.log("Starting migration of question types...");
    const questionsRef = db.collection('questions'); // Adjust collection name if different
    let count = 0;
    let errors = 0;

    try {
        const snapshot = await questionsRef.get();
        const batch = db.batch();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.questionType && mappings[data.questionType]) {
                batch.update(doc.ref, {
                    questionType: mappings[data.questionType]
                });
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`Successfully migrated ${count} questions.`);
        } else {
            console.log("No questions needed migration.");
        }
    } catch (error) {
        console.error("Migration failed:", error);
        errors++;
    }

    console.log("Migration complete.");
    process.exit(errors > 0 ? 1 : 0);
}

migrateQuestionTypes();
