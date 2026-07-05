import { getQuestionsPaginated } from './src/lib/firebase/question-bank';

async function main() {
    try {
        console.log("Testing with filter status = 'Published'");
        const { questions } = await getQuestionsPaginated({ status: 'Published' }, 10);
        console.log(`Found ${questions.length} questions`);
        
        console.log("Testing with multiple filters");
        const res2 = await getQuestionsPaginated({ status: 'Published', difficulty: 'Medium' }, 10);
        console.log(`Found ${res2.questions.length} questions for multiple filters`);
    } catch (err: any) {
        console.error("Firebase Query Error:", err.message);
    }
    process.exit(0);
}

main();
