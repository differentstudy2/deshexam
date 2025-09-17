

import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, orderBy, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const addQuestion = async (questionData: any) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to create a question.");
    }

    try {
        const docRef = await addDoc(collection(db, "questions"), {
            ...questionData,
            authorId: user.uid,
            authorName: user.displayName || user.email,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding question document: ", e);
        throw new Error("Failed to create question.");
    }
}

export const getAllQuestions = async () => {
    try {
        const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const questions = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
            };
        });
        return questions;
    } catch (e) {
        console.error("Error getting questions: ", e);
        throw new Error("Failed to fetch questions.");
    }
}

export const getQuestionById = async (questionId: string) => {
    if (!questionId) {
        throw new Error("Question ID is required to fetch a question.");
    }
    try {
        const questionDoc = await getDoc(doc(db, "questions", questionId));
        if (questionDoc.exists()) {
            return { id: questionDoc.id, ...questionDoc.data() };
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
        throw new Error("Failed to fetch question.");
    }
}

export const addContent = async (contentData: any) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to create a content.");
    }

    try {
        const questionsWithIds = await Promise.all(contentData.questions.map(async (question: any) => {
            const questionId = await addQuestion(question);
            return { ...question, id: questionId };
        }));

        const docRef = await addDoc(collection(db, "content"), {
            ...contentData,
            questions: questionsWithIds,
            authorId: user.uid,
            authorName: user.displayName || user.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Failed to create content.");
    }
};

export const getContentByAuthor = async (authorId: string) => {
    if (!authorId) {
        throw new Error("Author ID is required to fetch content.");
    }
    try {
        const q = query(collection(db, "content"), where("authorId", "==", authorId));
        const querySnapshot = await getDocs(q);
        const contents = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
                createdAtTimestamp: data.createdAt?.toDate().getTime() || 0,
            }
        });
        
        contents.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);

        return contents;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Failed to fetch content.");
    }
}

export const deleteContent = async (contentId: string) => {
    if (!contentId) {
        throw new Error("Content ID is required to delete a content.");
    }
    try {
        await deleteDoc(doc(db, "content", contentId));
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete content.");
    }
}

export const getContentById = async (contentId: string) => {
    if (!contentId) {
        throw new Error("Content ID is required to fetch a content.");
    }
    try {
        const contentDoc = await getDoc(doc(db, "content", contentId));
        if (contentDoc.exists()) {
            const data = contentDoc.data();
            // Ensure timestamp is converted correctly if it exists
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                data.createdAt = data.createdAt.toDate().toLocaleDateString();
            }
            return { id: contentDoc.id, ...data };
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
        throw new Error("Failed to fetch content.");
    }
};

export const updateContent = async (contentId: string, contentData: any) => {
    if (!contentId) {
        throw new Error("Content ID is required to update a content.");
    }
    try {
        const questionsWithIds = await Promise.all(contentData.questions.map(async (question: any) => {
            if (question.id) {
                // Ideally, you would update the existing question document here
                return question;
            }
            const questionId = await addQuestion(question);
            return { ...question, id: questionId };
        }));

        await updateDoc(doc(db, "content", contentId), {
            ...contentData,
            questions: questionsWithIds,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update content.");
    }
};

export const getAllContent = async (type?: string) => {
    try {
        let q;
        if (type) {
            q = query(collection(db, "content"), where("testType", "==", type));
        } else {
            q = query(collection(db, "content"));
        }
        
        const querySnapshot = await getDocs(q);
        const contents = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                questions: data.questions || [], 
            };
        });
        return contents;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Failed to fetch content.");
    }
}

export const addTestSubmission = async (submissionData: any) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to submit a test.");
    }

     try {
        const docRef = await addDoc(collection(db, "submissions"), {
            ...submissionData,
            userId: user.uid,
            submittedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Failed to submit test results.");
    }
}

export const getSubmissionById = async (submissionId: string) => {
    if (!submissionId) {
        throw new Error("Submission ID is required to fetch a submission.");
    }
    try {
        const submissionDoc = await getDoc(doc(db, "submissions", submissionId));
        if (submissionDoc.exists()) {
            const data = submissionDoc.data();
            return { id: submissionDoc.id, ...data };
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
        throw new Error("Failed to fetch submission.");
    }
}

export const getSubmissionsByUserId = async (userId: string) => {
    if (!userId) {
        throw new Error("User ID is required to fetch submissions.");
    }
    try {
        const q = query(
            collection(db, "submissions"), 
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const submissions = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                submittedAt: data.submittedAt?.toDate() || new Date(),
            }
        });
        // Sort on the client-side
        submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
        return submissions;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Failed to fetch submissions.");
    }
};

export const getContentTypes = async () => {
    try {
        const q = query(collection(db, "contentTypes"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const contentTypes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
        return contentTypes;
    } catch (e) {
        console.error("Error getting content types: ", e);
        throw new Error("Failed to fetch content types.");
    }
};

export const getSubjects = async () => {
    try {
        const q = query(collection(db, "subjects"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const subjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
        return subjects;
    } catch (e) {
        console.error("Error getting subjects: ", e);
        throw new Error("Failed to fetch subjects.");
    }
};

export const addSubject = async (subjectName: string) => {
    if (!subjectName) {
        throw new Error("Subject name cannot be empty.");
    }
    try {
        const q = query(collection(db, "subjects"), where("name", "==", subjectName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            console.log("Subject already exists.");
            return querySnapshot.docs[0].id;
        }
        
        const docRef = await addDoc(collection(db, "subjects"), {
            name: subjectName,
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding subject: ", e);
        throw new Error("Failed to add subject.");
    }
};

export const getBoards = async () => {
    try {
        const q = query(collection(db, "boards"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const boards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
        return boards;
    } catch (e) {
        console.error("Error getting boards: ", e);
        throw new Error("Failed to fetch boards.");
    }
};

export const addBoard = async (boardName: string) => {
    if (!boardName) {
        throw new Error("Board name cannot be empty.");
    }
    try {
        const q = query(collection(db, "boards"), where("name", "==", boardName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            console.log("Board already exists.");
            return querySnapshot.docs[0].id;
        }
        
        const docRef = await addDoc(collection(db, "boards"), {
            name: boardName,
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding board: ", e);
        throw new Error("Failed to add board.");
    }
};

export const getExamTypes = async () => {
    try {
        const q = query(collection(db, "examTypes"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const examTypes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
        return examTypes;
    } catch (e) {
        console.error("Error getting exam types: ", e);
        throw new Error("Failed to fetch exam types.");
    }
};

export const addExamType = async (examTypeName: string) => {
    if (!examTypeName) {
        throw new Error("Exam type name cannot be empty.");
    }
    try {
        const q = query(collection(db, "examTypes"), where("name", "==", examTypeName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            console.log("Exam type already exists.");
            return querySnapshot.docs[0].id;
        }
        
        const docRef = await addDoc(collection(db, "examTypes"), {
            name: examTypeName,
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding exam type: ", e);
        throw new Error("Failed to add exam type.");
    }
};

export const getChaptersBySubjectId = async (subjectId: string) => {
    if (!subjectId) return [];
    try {
        const chaptersRef = collection(db, "subjects", subjectId, "chapters");
        const q = query(chaptersRef, orderBy("chapterNo"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { chapterNo: string, chapterName: string } }));
    } catch (e) {
        console.error("Error getting chapters: ", e);
        throw new Error("Failed to fetch chapters.");
    }
};

export const addChapter = async (subjectId: string, chapterData: { chapterNo: string, chapterName: string }) => {
    if (!subjectId || !chapterData.chapterNo || !chapterData.chapterName) {
        throw new Error("Subject ID, Chapter No, and Chapter Name are required.");
    }
    try {
        const chaptersRef = collection(db, "subjects", subjectId, "chapters");
        const docRef = await addDoc(chaptersRef, chapterData);
        return docRef.id;
    } catch (e) {
        console.error("Error adding chapter: ", e);
        throw new Error("Failed to add chapter.");
    }
};

export const getExamsByCategory = async (examTypeId: string) => {
    if (!examTypeId) return [];
    try {
        const examsRef = collection(db, "examTypes", examTypeId, "exams");
        const q = query(examsRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
    } catch (e) {
        console.error("Error getting exams: ", e);
        throw new Error("Failed to fetch exams.");
    }
};

export const addExam = async (examTypeId: string, examData: { name: string }) => {
    if (!examTypeId || !examData.name) {
        throw new Error("Exam Type ID and Exam Name are required.");
    }
    try {
        const examsRef = collection(db, "examTypes", examTypeId, "exams");
        const docRef = await addDoc(examsRef, examData);
        return docRef.id;
    } catch (e) {
        console.error("Error adding exam: ", e);
        throw new Error("Failed to add exam.");
    }
};


export const getUserProfile = async (userId: string) => {
    if (!userId) return null;
    try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw new Error("Failed to fetch user profile.");
    }
};

export const updateUserProfile = async (userId: string, data: any) => {
    if (!userId) throw new Error("User ID is required to update a profile.");
    try {
        const userDocRef = doc(db, "users", userId);
        await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw new Error("Failed to update user profile.");
    }
};
