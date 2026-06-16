require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

let serviceAccount;
try {
    if (process.env.GCP_SA_KEY) {
        serviceAccount = JSON.parse(process.env.GCP_SA_KEY);
        if (serviceAccount.private_key) {
            // Fix literal \n escaping from .env
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
    } else {
        serviceAccount = require('../serviceAccountKey.json');
    }
} catch (e) {
    console.error("Error loading service account credentials. Make sure GCP_SA_KEY is in .env.local or serviceAccountKey.json exists.");
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}

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
    const questionsRef = db.collection('questions');
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
