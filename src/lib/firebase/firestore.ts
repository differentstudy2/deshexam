

















import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, orderBy, setDoc, runTransaction, arrayUnion, arrayRemove, increment, limit, startAfter, DocumentSnapshot,getCountFromServer } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


export type Order = {
    orderId: string;
    planName: string;
    amount: number;
    createdAt: string;
    status: 'Success' | 'Failed';
};

export type EarningStats = {
    totalRevenue: number;
    totalUsers: number;
    revenueToday: number;
    salesTodayCount: number;
    revenueThisMonth: number;
};

const generateUsername = async (displayName: string): Promise<string> => {
    const baseUsername = displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30);
    let username = baseUsername;
    let attempts = 0;
    
    while (true) {
        if (!username) { // handle case where displayName results in empty string
            username = Math.random().toString(36).substring(2, 8);
        }
        const usernameRef = doc(db, "usernames", username);
        const usernameDoc = await getDoc(usernameRef);
        if (!usernameDoc.exists()) {
            return username;
        }
        attempts++;
        username = `${baseUsername}-${Math.random().toString(36).substring(2, 6)}`;
        if (attempts > 5) {
             throw new Error("Failed to generate a unique username.");
        }
    }
};

const cleanDataForFirebase = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(item => cleanDataForFirebase(item));
    }
    if (data !== null && typeof data === 'object') {
        const cleanedData: { [key: string]: any } = {};
        for (const key in data) {
            const value = data[key];
            if (value !== undefined && value !== null) {
                cleanedData[key] = cleanDataForFirebase(value);
            }
        }
        return cleanedData;
    }
    return data;
};

export const addQuestion = async (questionData: any) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to create a question.");
    }
    
    const dataToSave = cleanDataForFirebase({
        ...questionData,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
    });

    try {
        const docRef = await addDoc(collection(db, "questions"), dataToSave);
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
            const createdAt = data.createdAt;
            let formattedDate = 'N/A';
            if (createdAt && typeof createdAt.toDate === 'function') {
                formattedDate = createdAt.toDate().toLocaleDateString();
            } else if (createdAt) {
                const d = new Date(createdAt);
                if (!isNaN(d.getTime())) {
                    formattedDate = d.toLocaleDateString();
                }
            }
            return {
                id: doc.id,
                ...data,
                createdAt: formattedDate,
            };
        });
        return questions;
    } catch (e) {
        console.error("Error getting questions: ", e);
        throw new Error("Failed to fetch questions.");
    }
}

export const getPaginatedQuestions = async (itemsPerPage: number, startAfterDoc: DocumentSnapshot | null = null) => {
    try {
        let q;
        if (startAfterDoc) {
            q = query(collection(db, "questions"), orderBy("createdAt", "desc"), startAfter(startAfterDoc), limit(itemsPerPage));
        } else {
            q = query(collection(db, "questions"), orderBy("createdAt", "desc"), limit(itemsPerPage));
        }

        const querySnapshot = await getDocs(q);
        const questions = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt;
            let formattedDate = 'N/A';
            // Firestore timestamps have a toDate method, JS Dates do not.
            if (createdAt && typeof createdAt.toDate === 'function') {
                formattedDate = createdAt.toDate().toLocaleDateString();
            } else if (createdAt instanceof Date) {
                formattedDate = createdAt.toLocaleDateString();
            }
            return {
                id: doc.id,
                ...data,
                createdAt: formattedDate,
            };
        });

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
        
        // A simple way to check if there are more pages
        const nextQuery = query(collection(db, "questions"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(1));
        const nextSnapshot = await getDocs(nextQuery);
        const hasMore = !nextSnapshot.empty;

        return { questions, lastVisible, hasMore };
    } catch (e) {
        console.error("Error getting paginated questions: ", e);
        throw new Error("Failed to fetch questions.");
    }
};

export const getQuestionById = async (questionId: string) => {
    if (!questionId) {
        throw new Error("Question ID is required to fetch a question.");
    }
    try {
        const questionDoc = await getDoc(doc(db, "questions", questionId));
        if (questionDoc.exists()) {
             const data = questionDoc.data();
             const createdAt = data.createdAt;
             let formattedDate = new Date();
             if (createdAt && typeof createdAt.toDate === 'function') {
                 formattedDate = createdAt.toDate();
             } else if (createdAt) {
                 const d = new Date(createdAt);
                 if (!isNaN(d.getTime())) {
                     formattedDate = d;
                 }
             }
            return {
                id: questionDoc.id,
                ...data,
                createdAt: formattedDate,
            };
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
        throw new Error("Failed to fetch question.");
    }
}

export const deleteQuestion = async (questionId: string) => {
    if (!questionId) {
        throw new Error("Question ID is required for deletion.");
    }
    try {
        await deleteDoc(doc(db, "questions", questionId));
    } catch (e) {
        console.error("Error deleting question:", e);
        throw new Error("Failed to delete question.");
    }
};

export const updateQuestion = async (questionId: string, data: any) => {
    if (!questionId) {
        throw new Error("Question ID is required to update a question.");
    }
    try {
        await updateDoc(doc(db, "questions", questionId), data);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update question.");
    }
};

export const handleQuestionVote = async (questionId: string, voteType: 'like' | 'dislike') => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to vote.");
    }

    const questionRef = doc(db, "questions", questionId);

    try {
        await runTransaction(db, async (transaction) => {
            const questionDoc = await transaction.get(questionRef);
            if (!questionDoc.exists()) {
                throw "Question does not exist!";
            }

            const data = questionDoc.data();
            const likedBy = data.likedBy || [];
            const dislikedBy = data.dislikedBy || [];

            const hasLiked = likedBy.includes(user.uid);
            const hasDisliked = dislikedBy.includes(user.uid);

            let newLikedBy = [...likedBy];
            let newDislikedBy = [...dislikedBy];

            if (voteType === 'like') {
                if (hasLiked) { // User is un-liking
                    newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
                } else { // User is liking
                    newLikedBy.push(user.uid);
                    if (hasDisliked) { // If they previously disliked, remove dislike
                        newDislikedBy = newDislikedBy.filter(uid => uid !== user.uid);
                    }
                }
            } else if (voteType === 'dislike') {
                if (hasDisliked) { // User is un-disliking
                    newDislikedBy = newDislikedBy.filter(uid => uid !== user.uid);
                } else { // User is disliking
                    newDislikedBy.push(user.uid);
                    if (hasLiked) { // If they previously liked, remove like
                        newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
                    }
                }
            }
            
            transaction.update(questionRef, {
                likedBy: newLikedBy,
                dislikedBy: newDislikedBy,
                likes: newLikedBy.length,
                dislikes: newDislikedBy.length,
            });
        });
    } catch (e) {
        console.error("Vote transaction failed: ", e);
        throw new Error("Failed to process your vote.");
    }
};


export const addComment = async (collectionName: 'questions' | 'content', documentId: string, commentData: { text: string; rating?: number; parentId?: string | null; }) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to comment.");
    }

    try {
        const userProfile = await getUserProfile(user.uid);
        const dataToSave: any = {
            ...commentData,
            authorId: user.uid,
            authorName: userProfile?.displayName || user.email,
            authorUsername: userProfile?.username,
            authorPhotoURL: userProfile?.photoURL,
            createdAt: serverTimestamp(),
            likes: 0,
            dislikes: 0,
            likedBy: [],
            dislikedBy: [],
        };

        if (commentData.rating === undefined) {
            delete dataToSave.rating;
        }
        if (!commentData.parentId) {
            dataToSave.parentId = null;
        }

        const docRef = await addDoc(collection(db, collectionName, documentId, "comments"), dataToSave);
        return docRef.id;
    } catch (e) {
        console.error("Error adding comment: ", e);
        throw new Error("Failed to add comment.");
    }
};

export const getComments = async (collectionName: 'questions' | 'content', documentId: string) => {
    try {
        const q = query(collection(db, collectionName, documentId, "comments"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() ?? new Date(),
            };
        });
    } catch (e) {
        console.error("Error getting comments: ", e);
        throw new Error("Failed to fetch comments.");
    }
};

export const handleCommentVote = async (collectionName: 'questions' | 'content', documentId: string, commentId: string, voteType: 'like' | 'dislike') => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to vote.");
    }

    const commentRef = doc(db, collectionName, documentId, "comments", commentId);

    try {
        await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if (!commentDoc.exists()) {
                throw "Comment does not exist!";
            }

            const data = commentDoc.data();
            const hasLiked = data.likedBy?.includes(user.uid);
            const hasDisliked = data.dislikedBy?.includes(user.uid);

            let updateData: any = {};

            if (voteType === 'like') {
                if (hasLiked) {
                    updateData = { likedBy: arrayRemove(user.uid), likes: increment(-1) };
                } else {
                    updateData = { likedBy: arrayUnion(user.uid), likes: increment(1) };
                    if (hasDisliked) {
                        updateData.dislikedBy = arrayRemove(user.uid);
                        updateData.dislikes = increment(-1);
                    }
                }
            } else if (voteType === 'dislike') {
                if (hasDisliked) {
                    updateData = { dislikedBy: arrayRemove(user.uid), dislikes: increment(-1) };
                } else {
                    updateData = { dislikedBy: arrayUnion(user.uid), dislikes: increment(1) };
                    if (hasLiked) {
                        updateData.likedBy = arrayRemove(user.uid);
                        updateData.likes = increment(-1);
                    }
                }
            }
            
            transaction.update(commentRef, updateData);
        });
    } catch (e) {
        console.error("Comment vote transaction failed: ", e);
        throw new Error("Failed to process your vote on the comment.");
    }
};

export const addContent = async (contentData: any) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to create content.");
    }
    const cleanedContent = cleanDataForFirebase(contentData);

    try {
        const collectionName = cleanedContent.testType === 'Textbook' ? 'textbooks' : 'content';
        
        let finalContentData: any = {
            ...cleanedContent,
            authorId: user.uid,
            authorName: user.displayName || user.email,
            createdAt: cleanedContent.publishedAt ? new Date(cleanedContent.publishedAt) : serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (cleanedContent.testType !== 'Learn' && cleanedContent.testType !== 'Textbook' && cleanedContent.questions) {
            const questionsWithIds = await Promise.all(cleanedContent.questions.map(async (question: any) => {
                const questionId = await addQuestion(question);
                return { ...question, id: questionId };
            }));
            finalContentData.questions = questionsWithIds;
        }

        delete finalContentData.publishedAt;
        
        // For textbooks, remove questions array if it exists as it's not a direct property
        if (collectionName === 'textbooks') {
            delete finalContentData.questions;
            delete finalContentData.duration;
            delete finalContentData.difficulty;
        }

        const docRef = await addDoc(collection(db, collectionName), finalContentData);
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
            const createdAt = data.createdAt;
            if (createdAt && typeof createdAt.toDate === 'function') {
                data.createdAt = createdAt.toDate().toLocaleDateString();
            } else if (createdAt) {
                data.createdAt = new Date(createdAt).toLocaleDateString();
            }
            return { id: contentDoc.id, ...data };
        } else {
            // Check textbooks collection if not in content
            const textbookDoc = await getDoc(doc(db, "textbooks", contentId));
            if (textbookDoc.exists()) {
                const data = textbookDoc.data();
                 const createdAt = data.createdAt;
                if (createdAt && typeof createdAt.toDate === 'function') {
                    data.createdAt = createdAt.toDate().toLocaleDateString();
                } else if (createdAt) {
                    data.createdAt = new Date(createdAt).toLocaleDateString();
                }
                return { id: textbookDoc.id, ...data };
            }
            return null;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
        throw new Error("Failed to fetch content.");
    }
};

export const updateContent = async (contentId: string, contentData: any) => {
    if (!contentId) {
        throw new Error("Content ID is required to update content.");
    }
    
    const collectionName = contentData.testType === 'Textbook' ? 'textbooks' : 'content';
    const contentRef = doc(db, collectionName, contentId);
    
    const cleanedData = cleanDataForFirebase(contentData);
    
    const finalContentData = {
        ...cleanedData,
        updatedAt: serverTimestamp(),
    };

    try {
        await updateDoc(contentRef, finalContentData);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update content.");
    }
};

export const addQuestionsToContent = async (contentId: string, questionsToAdd: any[]) => {
    if (!contentId || !questionsToAdd || questionsToAdd.length === 0) {
        throw new Error("Content ID and questions are required.");
    }
    const contentRef = doc(db, "content", contentId);
    try {
        await updateDoc(contentRef, {
            questions: arrayUnion(...questionsToAdd)
        });
    } catch (e) {
        console.error("Error adding questions to content: ", e);
        throw new Error("Failed to add questions to content.");
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
            const createdAt = data.createdAt;
            let formattedDate = 'N/A';
            if (createdAt && typeof createdAt.toDate === 'function') {
                formattedDate = createdAt.toDate().toLocaleDateString();
            } else if (createdAt) {
                // Fallback for when it might be a string or number from previous incorrect saves
                const d = new Date(createdAt);
                if (!isNaN(d.getTime())) {
                    formattedDate = d.toLocaleDateString();
                }
            }
            return {
                id: doc.id,
                ...data,
                questions: data.questions || [],
                createdAt: formattedDate,
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
            const submittedAt = data.submittedAt;
            let formattedDate = new Date();
            if (submittedAt && typeof submittedAt.toDate === 'function') {
                formattedDate = submittedAt.toDate();
            } else if (submittedAt) {
                const d = new Date(submittedAt);
                if (!isNaN(d.getTime())) {
                    formattedDate = d;
                }
            }
             return { 
                id: submissionDoc.id, 
                ...data,
                submittedAt: formattedDate,
            };
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
            const submittedAt = data.submittedAt;
            let formattedDate = new Date();
            if (submittedAt && typeof submittedAt.toDate === 'function') {
                formattedDate = submittedAt.toDate();
            } else if (submittedAt) {
                const d = new Date(submittedAt);
                if (!isNaN(d.getTime())) {
                    formattedDate = d;
                }
            }
            return {
                id: doc.id,
                ...data,
                submittedAt: formattedDate,
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

export const getTodaysSubmissions = async () => {
    try {
        const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (e) {
        console.error("Error getting all submissions: ", e);
        throw new Error("Failed to fetch submissions.");
    }
};

export const deleteSubmissions = async (submissionIds: string[]) => {
    if (!submissionIds || submissionIds.length === 0) {
        throw new Error("Submission ID(s) are required for deletion.");
    }
    try {
        const deletePromises = submissionIds.map(id => deleteDoc(doc(db, "submissions", id)));
        await Promise.all(deletePromises);
    } catch (e) {
        console.error("Error deleting submission(s):", e);
        throw new Error("Failed to delete submission(s).");
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

export const updateSubject = async (id: string, name: string) => {
    if (!id || !name) throw new Error("ID and name are required.");
    try {
        await updateDoc(doc(db, "subjects", id), { name });
    } catch (e) {
        console.error("Error updating subject: ", e);
        throw new Error("Failed to update subject.");
    }
};

export const deleteSubject = async (id: string) => {
    if (!id) throw new Error("ID is required.");
    try {
        await deleteDoc(doc(db, "subjects", id));
    } catch (e) {
        console.error("Error deleting subject: ", e);
        throw new Error("Failed to delete subject.");
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

export const updateBoard = async (id: string, name: string) => {
    if (!id || !name) throw new Error("ID and name are required.");
    try {
        await updateDoc(doc(db, "boards", id), { name });
    } catch (e) {
        console.error("Error updating board: ", e);
        throw new Error("Failed to update board.");
    }
};

export const deleteBoard = async (id: string) => {
    if (!id) throw new Error("ID is required.");
    try {
        await deleteDoc(doc(db, "boards", id));
    } catch (e) {
        console.error("Error deleting board: ", e);
        throw new Error("Failed to delete board.");
    }
};

export const getClasses = async () => {
    try {
        const q = query(collection(db, "classes"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const classes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
        return classes;
    } catch (e) {
        console.error("Error getting classes: ", e);
        throw new Error("Failed to fetch classes.");
    }
};

export const getGradesByClass = async (classId: string) => {
    try {
        const gradesRef = collection(db, `classes/${classId}/grades`);
        const q = query(gradesRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        const grades = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
        return grades;
    } catch (e) {
        console.error("Error getting grades: ", e);
        throw new Error("Failed to fetch grades for the class.");
    }
};


export const addClass = async (className: string) => {
    if (!className) {
        throw new Error("Class name cannot be empty.");
    }
    try {
        const q = query(collection(db, "classes"), where("name", "==", className));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            console.log("Class already exists.");
            return querySnapshot.docs[0].id;
        }
        
        const docRef = await addDoc(collection(db, "classes"), {
            name: className,
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding class: ", e);
        throw new Error("Failed to add class.");
    }
};

export const updateClass = async (id: string, name: string) => {
    if (!id || !name) throw new Error("ID and name are required.");
    try {
        await updateDoc(doc(db, "classes", id), { name });
    } catch (e) {
        console.error("Error updating class: ", e);
        throw new Error("Failed to update class.");
    }
};

export const deleteClass = async (id: string) => {
    if (!id) throw new Error("ID is required.");
    try {
        await deleteDoc(doc(db, "classes", id));
    } catch (e) {
        console.error("Error deleting class: ", e);
        throw new Error("Failed to delete class.");
    }
};

export const addGradeToClass = async (classId: string, gradeData: { name: string }) => {
    if (!classId || !gradeData.name) {
        throw new Error("Class ID and Grade Name are required.");
    }
    try {
        const gradesRef = collection(db, `classes/${classId}/grades`);
        const docRef = await addDoc(gradesRef, gradeData);
        return docRef.id;
    } catch (e) {
        console.error("Error adding grade: ", e);
        throw new Error("Failed to add grade.");
    }
};

export const updateGradeInClass = async (classId: string, gradeId: string, data: { name: string }) => {
    if (!classId || !gradeId || !data) throw new Error("IDs and data are required.");
    try {
        await updateDoc(doc(db, `classes/${classId}/grades`, gradeId), data);
    } catch (e) {
        console.error("Error updating grade: ", e);
        throw new Error("Failed to update grade.");
    }
};

export const deleteGradeFromClass = async (classId: string, gradeId: string) => {
    if (!classId || !gradeId) throw new Error("IDs are required.");
    try {
        await deleteDoc(doc(db, `classes/${classId}/grades`, gradeId));
    } catch (e) {
        console.error("Error deleting grade: ", e);
        throw new Error("Failed to delete grade.");
    }
};

export const getStates = async () => {
    try {
        const q = query(collection(db, "states"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const states = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
        return states;
    } catch (e) {
        console.error("Error getting states: ", e);
        throw new Error("Failed to fetch states.");
    }
};

export const addState = async (stateName: string) => {
    if (!stateName) {
        throw new Error("State name cannot be empty.");
    }
    try {
        const q = query(collection(db, "states"), where("name", "==", stateName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            console.log("State already exists.");
            return querySnapshot.docs[0].id;
        }
        
        const docRef = await addDoc(collection(db, "states"), {
            name: stateName,
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding state: ", e);
        throw new Error("Failed to add state.");
    }
};

export const updateState = async (id: string, name: string) => {
    if (!id || !name) throw new Error("ID and name are required.");
    try {
        await updateDoc(doc(db, "states", id), { name });
    } catch (e) {
        console.error("Error updating state: ", e);
        throw new Error("Failed to update state.");
    }
};

export const deleteState = async (id: string) => {
    if (!id) throw new Error("ID is required.");
    try {
        await deleteDoc(doc(db, "states", id));
    } catch (e) {
        console.error("Error deleting state: ", e);
        throw new Error("Failed to delete state.");
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

export const updateExamType = async (id: string, name: string) => {
    if (!id || !name) throw new Error("ID and name are required.");
    try {
        await updateDoc(doc(db, "examTypes", id), { name });
    } catch (e) {
        console.error("Error updating exam type: ", e);
        throw new Error("Failed to update exam type.");
    }
};

export const deleteExamType = async (id: string) => {
    if (!id) throw new Error("ID is required.");
    try {
        await deleteDoc(doc(db, "examTypes", id));
    } catch (e) {
        console.error("Error deleting exam type: ", e);
        throw new Error("Failed to delete exam type.");
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

export const updateChapter = async (subjectId: string, chapterId: string, data: { chapterNo: string, chapterName: string }) => {
    if (!subjectId || !chapterId || !data) throw new Error("IDs and data are required.");
    try {
        await updateDoc(doc(db, "subjects", subjectId, "chapters", chapterId), data);
    } catch (e) {
        console.error("Error updating chapter: ", e);
        throw new Error("Failed to update chapter.");
    }
};

export const deleteChapter = async (subjectId: string, chapterId: string) => {
    if (!subjectId || !chapterId) throw new Error("IDs are required.");
    try {
        await deleteDoc(doc(db, "subjects", subjectId, "chapters", chapterId));
    } catch (e) {
        console.error("Error deleting chapter: ", e);
        throw new Error("Failed to delete chapter.");
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

export const updateExam = async (examTypeId: string, examId: string, data: { name: string }) => {
    if (!examTypeId || !examId || !data) throw new Error("IDs and data are required.");
    try {
        await updateDoc(doc(db, "examTypes", examTypeId, "exams", examId), data);
    } catch (e) {
        console.error("Error updating exam: ", e);
        throw new Error("Failed to update exam.");
    }
};

export const deleteExam = async (examTypeId: string, examId: string) => {
    if (!examTypeId || !examId) throw new Error("IDs are required.");
    try {
        await deleteDoc(doc(db, "examTypes", examTypeId, "exams", examId));
    } catch (e) {
        console.error("Error deleting exam: ", e);
        throw new Error("Failed to delete exam.");
    }
};


export const getUserProfile = async (userId: string): Promise<any> => {
    if (!userId) return null;
    try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) return null;
        
        const userData = userDoc.data();
        
        return {
            uid: userId,
            ...userData,
            createdAt: userData.createdAt?.toDate() ?? new Date(),
        };

    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw new Error("Failed to fetch user profile.");
    }
};

export const getUserByUsername = async (username: string) => {
    if (!username) return null;
    try {
        // Check if the passed value might be a UID instead of a username
        if (username.length > 20 && !username.includes('-')) { // Simple heuristic for UID
             return await getUserProfile(username);
        }

        const usernameRef = doc(db, "usernames", username);
        const usernameDoc = await getDoc(usernameRef);

        if (usernameDoc.exists()) {
            const { uid } = usernameDoc.data();
            return await getUserProfile(uid);
        }
        return null;
    } catch (error) {
        console.error("Error fetching user by username:", error);
        throw new Error("Failed to fetch user by username.");
    }
}

export const updateUserProfile = async (userId: string, data: any) => {
    if (!userId) throw new Error("User ID is required to update a profile.");

    const userDocRef = doc(db, "users", userId);

    try {
        await runTransaction(db, async (transaction) => {
            // First, perform all reads
            const userDoc = await transaction.get(userDocRef);
            const currentData = userDoc.data() || {};
            const isUsernameChanging = data.displayName && data.displayName !== currentData.displayName;
            
            let oldUsernameRef: any;
            if (isUsernameChanging && currentData.username) {
                oldUsernameRef = doc(db, "usernames", currentData.username);
                // This read is necessary to check for existence before deleting
                await transaction.get(oldUsernameRef); 
            }

            // Now, perform all writes
            const newData = { ...currentData, ...data };
            if (!userDoc.exists()) {
                newData.role = 'user'; // Default role
            }

            if (isUsernameChanging || (!currentData.username && data.displayName)) {
                const newUsername = await generateUsername(data.displayName);
                newData.username = newUsername;
                
                // Set new username mapping
                const newUsernameRef = doc(db, "usernames", newUsername);
                transaction.set(newUsernameRef, { uid: userId });

                // Delete old username mapping if it existed
                if (oldUsernameRef) {
                    transaction.delete(oldUsernameRef);
                }
            }
            
            if (userDoc.exists()) {
                transaction.update(userDocRef, newData);
            } else {
                transaction.set(userDocRef, newData);
            }
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw new Error("Failed to update user profile.");
    }
};

export const toggleFollowUser = async (targetUserId: string) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("You must be logged in to follow users.");
    }
    if (currentUser.uid === targetUserId) {
        throw new Error("You cannot follow yourself.");
    }

    const currentUserRef = doc(db, "users", currentUser.uid);
    const targetUserRef = doc(db, "users", targetUserId);

    try {
        await runTransaction(db, async (transaction) => {
            const currentUserDoc = await transaction.get(currentUserRef);
            const targetUserDoc = await transaction.get(targetUserRef);

            if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
                throw "User document not found.";
            }

            const currentUserData = currentUserDoc.data();
            const isFollowing = currentUserData.following?.includes(targetUserId);

            if (isFollowing) {
                // Unfollow
                transaction.update(currentUserRef, {
                    following: arrayRemove(targetUserId),
                    followingCount: increment(-1)
                });
                transaction.update(targetUserRef, {
                    followers: arrayRemove(currentUser.uid),
                    followersCount: increment(-1)
                });
            } else {
                // Follow
                transaction.update(currentUserRef, {
                    following: arrayUnion(targetUserId),
                    followingCount: increment(1)
                });
                transaction.update(targetUserRef, {
                    followers: arrayUnion(currentUser.uid),
                    followersCount: increment(1)
                });
            }
        });
    } catch (error) {
        console.error("Follow transaction failed: ", error);
        throw new Error("Failed to update follow status.");
    }
};

export const sendMessage = async (recipientId: string, messageText: string) => {
    const auth = getAuth();
    const sender = auth.currentUser;

    if (!sender) {
        throw new Error("You must be logged in to send a message.");
    }
    if (!messageText.trim()) {
        throw new Error("Message cannot be empty.");
    }
    if(sender.uid === recipientId) {
        throw new Error("You cannot send a message to yourself.");
    }

    try {
        const messagesCollection = collection(db, "messages");
        await addDoc(messagesCollection, {
            senderId: sender.uid,
            recipientId: recipientId,
            text: messageText,
            createdAt: serverTimestamp(),
            isRead: false,
        });
    } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message.");
    }
};

export const getCouponByCode = async (code: string) => {
    if (!code) return null;
    try {
        const q = query(collection(db, "coupons"), where("code", "==", code.toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const couponDoc = querySnapshot.docs[0];
        const couponData = couponDoc.data();

        if (!couponData.isActive) return null;

        if (couponData.expiresAt && couponData.expiresAt.toDate() < new Date()) {
            return null;
        }

        return { id: couponDoc.id, ...couponData };

    } catch (error) {
        console.error("Error fetching coupon:", error);
        throw new Error("Failed to validate coupon code.");
    }
}

export const getCoupons = async () => {
    try {
        const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const coupons = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
                expiresAt: data.expiresAt?.toDate().toLocaleDateString() || 'N/A',
            };
        });
        return coupons;
    } catch (e) {
        console.error("Error getting coupons: ", e);
        throw new Error("Failed to fetch coupons.");
    }
}

export const addCoupon = async (couponData: any) => {
    try {
        // Convert expiresAt to Firestore Timestamp if it exists
        if (couponData.expiresAt) {
            couponData.expiresAt = new Date(couponData.expiresAt);
        } else {
            delete couponData.expiresAt;
        }

        const docRef = await addDoc(collection(db, "coupons"), {
            ...couponData,
            code: couponData.code.toUpperCase(),
            isActive: true,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch(e) {
        console.error("Error adding coupon", e);
        throw new Error("Failed to add coupon");
    }
}

export const uploadFile = async (file: File): Promise<string> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to upload files.");
    }

    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${file.name}`);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("File upload error:", error);
        throw new Error("Failed to upload file.");
    }
};

export const getAllUsers = async () => {
    try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const users = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toLocaleDateString() || 'N/A',
                subscriptionExpiresAt: data.subscriptionExpiresAt?.toDate().toLocaleDateString() || 'N/A',
            };
        });
        return users;
    } catch (error) {
        console.error("Error getting all users: ", error);
        throw new Error("Failed to fetch users.");
    }
};

export const setUserRole = async (userId: string, role: 'admin' | 'user') => {
    if (!userId || !role) {
        throw new Error("User ID and role are required.");
    }
    try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, { role });
    } catch (error) {
        console.error("Error updating user role: ", error);
        throw new Error("Failed to update user role.");
    }
};

export const deleteUser = async (userId: string) => {
    if (!userId) {
        throw new Error("User ID is required to delete a user.");
    }
    // This is a placeholder. Deleting a user from Auth requires a backend (e.g., Cloud Function).
    // This function will only delete the user's Firestore document.
    try {
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
        // Also delete the username mapping
        const usernameQuery = query(collection(db, "usernames"), where("uid", "==", userId));
        const usernameSnapshot = await getDocs(usernameQuery);
        if(!usernameSnapshot.empty){
            const usernameDocRef = usernameSnapshot.docs[0].ref;
            await deleteDoc(usernameDocRef);
        }
    } catch (error) {
        console.error("Error deleting user document: ", error);
        throw new Error("Failed to delete user data.");
    }
};

export const updateUserSubscription = async (userIds: string[], plan: 'pro' | 'pass' | null) => {
    if (!userIds || userIds.length === 0) {
        throw new Error("User ID(s) are required.");
    }
    try {
        const promises = userIds.map(userId => {
            const userDocRef = doc(db, "users", userId);
            let updateData: any = { subscriptionPlan: plan };
            
            if (plan) {
                const expiresAt = new Date();
                expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Example: 1 year subscription
                updateData.subscriptionExpiresAt = expiresAt;
            } else {
                updateData.subscriptionExpiresAt = null;
            }
            return updateDoc(userDocRef, updateData);
        });
        await Promise.all(promises);

    } catch (error) {
        console.error("Error updating subscription: ", error);
        throw new Error("Failed to update user subscription.");
    }
}

export const getSettings = async () => {
    try {
        const settingsDoc = await getDoc(doc(db, "settings", "global"));
        if (settingsDoc.exists()) {
            return settingsDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching settings:", error);
        throw new Error("Failed to fetch site settings.");
    }
}

export const updateSettings = async (data: any) => {
    try {
        const settingsRef = doc(db, "settings", "global");
        const cleanedData = cleanDataForFirebase(data);
        await setDoc(settingsRef, cleanedData, { merge: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        throw new Error("Failed to save site settings.");
    }
}

export const addContactMessage = async (data: { name: string; email: string; subject: string; message: string; }) => {
    try {
        await addDoc(collection(db, "contactMessages"), {
            ...data,
            createdAt: serverTimestamp(),
            isRead: false,
        });
    } catch (error) {
        console.error("Error adding contact message:", error);
        throw new Error("Failed to send message.");
    }
};


export const getContactMessages = async () => {
    try {
        const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toLocaleString() || new Date().toLocaleString(),
            };
        });
        return messages;
    } catch (e) {
        console.error("Error getting contact messages: ", e);
        throw new Error("Failed to fetch messages.");
    }
};

export const getContactMessageById = async (messageId: string) => {
    if (!messageId) {
        throw new Error("Message ID is required.");
    }
    try {
        const messageDoc = await getDoc(doc(db, "contactMessages", messageId));
        if (messageDoc.exists()) {
            const data = messageDoc.data();
            await updateDoc(doc(db, "contactMessages", messageId), { isRead: true });
            return {
                id: messageDoc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toLocaleString() || new Date().toLocaleString(),
            };
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error getting message:", e);
        throw new Error("Failed to fetch message.");
    }
};
    
export const addFCMToken = async (token: string) => {
    if (!token) {
        return;
    }
    try {
        const tokenRef = doc(db, "fcmTokens", token);
        await setDoc(tokenRef, {
            token: token,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding FCM token: ", error);
    }
}

export const getRecentOrders = async (count: number): Promise<Order[]> => {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(count));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                orderId: data.orderId || doc.id,
                planName: data.planName || 'N/A',
                amount: data.amount || 0,
                status: data.status || 'Success',
                createdAt: data.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
            } as Order;
        });
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        throw new Error("Failed to fetch recent orders.");
    }
};

export const getEarningStats = async (): Promise<EarningStats> => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const ordersCollection = collection(db, "orders");
        const usersCollection = collection(db, "users");

        const allOrdersQuery = query(ordersCollection, where("status", "==", "Success"));
        const todayOrdersQuery = query(ordersCollection, where("status", "==", "Success"), where("createdAt", ">=", startOfToday));
        const monthOrdersQuery = query(ordersCollection, where("status", "==", "Success"), where("createdAt", ">=", startOfMonth));

        const [allOrdersSnapshot, todayOrdersSnapshot, monthOrdersSnapshot, usersCountSnapshot] = await Promise.all([
            getDocs(allOrdersQuery),
            getDocs(todayOrdersSnapshot),
            getDocs(monthOrdersSnapshot),
            getCountFromServer(usersCollection),
        ]);

        const totalRevenue = allOrdersSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        const revenueToday = todayOrdersSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        const revenueThisMonth = monthOrdersSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

        return {
            totalRevenue,
            revenueToday,
            revenueThisMonth,
            salesTodayCount: todayOrdersSnapshot.size,
            totalUsers: usersCountSnapshot.data().count,
        };

    } catch (error: any) {
        // Firestore will suggest creating an index in the error message.
        if (error.code === 'failed-precondition') {
            console.error("Firestore error: ", error.message);
            throw new Error(`Query failed. Firestore likely requires a new index. Please check the console logs for a link to create it.`);
        }
        console.error("Error fetching earning stats:", error);
        throw new Error("Failed to fetch earning statistics.");
    }
};

export const getAllTextbooks = async () => {
    try {
        const q = query(collection(db, "textbooks"), orderBy("title"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting textbooks: ", e);
        throw new Error("Failed to fetch textbooks.");
    }
};

export const getChaptersByTextbookId = async (textbookId: string) => {
    try {
        const q = query(collection(db, "textbooks", textbookId, "chapters"), orderBy("title"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting chapters: ", e);
        throw new Error("Failed to fetch chapters.");
    }
};

export const getTopicsByChapterId = async (textbookId: string, chapterId: string) => {
    if (!textbookId || !chapterId) return [];
    try {
        const q = query(collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`), orderBy("title"));
        const querySnapshot = await getDocs(q);
        const topicsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Topic }));
        
        // Fetch practice sets for each topic
        for (let topic of topicsData) {
            const practiceSetsQuery = query(collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topic.id}/practiceSets`), orderBy("createdAt", "desc"));
            const practiceSetsSnap = await getDocs(practiceSetsQuery);
            topic.practiceSets = practiceSetsSnap.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
        }
        
        return topicsData;
    } catch (e) {
        console.error("Error getting topics: ", e);
        throw new Error("Failed to fetch topics.");
    }
};
    
export const addTopicToChapter = async (textbookId: string, chapterId: string, topicData: any) => {
    try {
        const docRef = await addDoc(collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`), {
            ...topicData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding topic: ", e);
        throw new Error("Failed to add topic.");
    }
};
    
export const updateTopic = async (textbookId: string, chapterId: string, topicId: string, topicData: any) => {
    try {
        const topicRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics`, topicId);
        await updateDoc(topicRef, {
            ...topicData,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error updating topic: ", e);
        throw new Error("Failed to update topic.");
    }
};

export const addPracticeSetToTopic = async (textbookId: string, chapterId: string, topicId: string, practiceSetData: any) => {
    if (!textbookId || !chapterId || !topicId || !practiceSetData.title) {
        throw new Error("Missing required data to add a practice set.");
    }
    try {
        const practiceSetsRef = collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets`);
        const docRef = await addDoc(practiceSetsRef, {
            title: practiceSetData.title,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding practice set: ", e);
        throw new Error("Failed to add practice set.");
    }
};

export const getPracticeSetsByTopicId = async (textbookId: string, chapterId: string, topicId: string) => {
    if (!textbookId || !chapterId || !topicId) return [];
    try {
        const practiceSetsRef = collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets`);
        const q = query(practiceSetsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting practice sets: ", e);
        throw new Error("Failed to fetch practice sets.");
    }
};

export const getPracticeSetById = async (textbookId: string, chapterId: string, topicId: string, practiceSetId: string) => {
    if (!textbookId || !chapterId || !topicId || !practiceSetId) return null;
    try {
        const practiceSetRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets`, practiceSetId);
        const docSnap = await getDoc(practiceSetRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (e) {
        console.error("Error getting practice set by ID: ", e);
        throw new Error("Failed to fetch practice set.");
    }
};

export const addQuestionToPracticeSet = async (textbookId: string, chapterId: string, topicId: string, practiceSetId: string, questionData: any) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required.");

    const dataToSave = cleanDataForFirebase({
        ...questionData,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: serverTimestamp(),
    });

    try {
        const questionsRef = collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets/${practiceSetId}/questions`);
        const docRef = await addDoc(questionsRef, dataToSave);
        return docRef.id;
    } catch (e) {
        console.error("Error adding question to practice set: ", e);
        throw new Error("Failed to add question.");
    }
};

export const getQuestionsByPracticeSet = async (textbookId: string, chapterId: string, topicId: string, practiceSetId: string) => {
    if (!textbookId || !chapterId || !topicId || !practiceSetId) return [];
    try {
        const questionsRef = collection(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets/${practiceSetId}/questions`);
        const q = query(questionsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting questions by practice set: ", e);
        throw new Error("Failed to fetch questions.");
    }
};

export const updateQuestionInPracticeSet = async (textbookId: string, chapterId: string, topicId: string, practiceSetId: string, questionId: string, questionData: any) => {
    const questionRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets/${practiceSetId}/questions`, questionId);
    try {
        await updateDoc(questionRef, cleanDataForFirebase(questionData));
    } catch (e) {
        console.error("Error updating question in practice set: ", e);
        throw new Error("Failed to update question.");
    }
};

export const deleteQuestionFromPracticeSet = async (textbookId: string, chapterId: string, topicId: string, practiceSetId: string, questionId: string) => {
    const questionRef = doc(db, `textbooks/${textbookId}/chapters/${chapterId}/topics/${topicId}/practiceSets/${practiceSetId}/questions`, questionId);
    try {
        await deleteDoc(questionRef);
    } catch (e) {
        console.error("Error deleting question from practice set: ", e);
        throw new Error("Failed to delete question.");
    }
};

export const deleteTextbook = async (textbookId: string) => {
    if (!textbookId) {
        throw new Error("Textbook ID is required to delete.");
    }

    const textbookRef = doc(db, "textbooks", textbookId);

    // This is a simplified delete. For production, you'd want a more robust, recursive delete,
    // possibly triggered by a Cloud Function to handle nested subcollections reliably.
    try {
        // Get all chapters
        const chaptersRef = collection(db, `textbooks/${textbookId}/chapters`);
        const chaptersSnapshot = await getDocs(chaptersRef);

        for (const chapterDoc of chaptersSnapshot.docs) {
            // Get all topics for each chapter
            const topicsRef = collection(chapterDoc.ref, "topics");
            const topicsSnapshot = await getDocs(topicsRef);

            for (const topicDoc of topicsSnapshot.docs) {
                // Get all practice sets for each topic
                const practiceSetsRef = collection(topicDoc.ref, "practiceSets");
                const practiceSetsSnapshot = await getDocs(practiceSetsRef);
                
                for(const practiceSetDoc of practiceSetsSnapshot.docs) {
                    // Delete questions within practice set
                    const questionsRef = collection(practiceSetDoc.ref, "questions");
                    const questionsSnapshot = await getDocs(questionsRef);
                    for (const qDoc of questionsSnapshot.docs) {
                         await deleteDoc(qDoc.ref);
                    }
                    await deleteDoc(practiceSetDoc.ref);
                }
                
                await deleteDoc(topicDoc.ref);
            }
            
            await deleteDoc(chapterDoc.ref);
        }

        // Finally, delete the textbook document
        await deleteDoc(textbookRef);
        
    } catch (error) {
        console.error("Error deleting textbook and its subcollections: ", error);
        throw new Error("Failed to delete textbook completely.");
    }
};

export const getTextbookProgress = async (userId: string, textbookId: string) => {
    if (!userId || !textbookId) return null;
    try {
        const progressRef = doc(db, `users/${userId}/textbookProgress`, textbookId);
        const docSnap = await getDoc(progressRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching textbook progress: ", error);
        return null; // Return null on error to avoid breaking the UI
    }
}

export const updateTextbookProgress = async (userId: string, textbookId: string, chapterId: string, data: any) => {
    if (!userId || !textbookId || !chapterId) return;
    try {
        const progressRef = doc(db, `users/${userId}/textbookProgress`, textbookId);
        await setDoc(progressRef, { [chapterId]: data }, { merge: true });
    } catch (error) {
        console.error("Error updating textbook progress: ", error);
        throw new Error("Failed to update progress.");
    }
}
