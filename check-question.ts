import { getQuestionsPaginated } from './src/lib/firebase/question-bank';

async function main() {
    try {
        console.log("Fetching a few questions to inspect their fields...");
        const { questions } = await getQuestionsPaginated({}, 5);
        if (questions.length > 0) {
            questions.forEach((q, i) => {
                console.log(`\n--- Question ${i + 1} (${q.id}) ---`);
                console.log("status:", q.status);
                console.log("difficulty:", q.difficulty);
                console.log("boardId:", q.boardId, "board:", (q as any).board);
                console.log("classId:", q.classId, "class:", (q as any).class);
                console.log("subjectId:", q.subjectId, "subject:", (q as any).subject);
                console.log("textbookId:", q.textbookId, "textbook:", (q as any).textbook);
                console.log("isVerified:", q.isVerified);
            });
        } else {
            console.log("No questions found.");
        }
    } catch (err: any) {
        console.error("Error:", err.message);
    }
    process.exit(0);
}

main();
