

import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, orderBy, setDoc, runTransaction, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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


export const addQuestion = async (questionData: any) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to create a question.");
    }
    
    const dataToSave = {
        ...questionData,
        explanation: questionData.explanation || '', // Ensure explanation is not undefined
    };

    try {
        const docRef = await addDoc(collection(db, "questions"), {
            ...dataToSave,
            authorId: user.uid,
            authorName: user.displayName || user.email,
            createdAt: serverTimestamp(),
            likes: 0,
            dislikes: 0,
            likedBy: [],
            dislikedBy: [],
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
             const data = questionDoc.data();
            return {
                id: questionDoc.id,
                ...data,
                createdAt: data.createdAt?.toDate() ?? new Date(),
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
        throw new Error("You must be logged in to create a content.");
    }
     const { featureImage, ...restOfContentData } = contentData;

    try {
        let finalContentData: any = {
            ...restOfContentData,
            authorId: user.uid,
            authorName: user.displayName || user.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        
        if (contentData.testType !== 'Learn' && restOfContentData.questions) {
            const questionsWithIds = await Promise.all(restOfContentData.questions.map(async (question: any) => {
                const questionId = await addQuestion(question);
                return { ...question, id: questionId };
            }));
            finalContentData.questions = questionsWithIds;
        }

        if(featureImage){
            finalContentData.featureImage = featureImage;
        }

        if (finalContentData.price === undefined || finalContentData.price === null) {
            delete finalContentData.price;
        }

        const docRef = await addDoc(collection(db, "content"), finalContentData);
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

    const contentRef = doc(db, "content", contentId);
    
    // If questions are part of the update, handle them separately
    if (contentData.questions) {
        const { questions, ...restOfContentData } = contentData;

        const questionsWithIds = await Promise.all(questions.map(async (question: any) => {
            if (question.id) {
                // Ideally, you would update the existing question document here
                return question;
            }
            const questionId = await addQuestion(question);
            return { ...question, id: questionId };
        }));

        const finalContentData: any = {
            ...restOfContentData,
            questions: questionsWithIds,
            updatedAt: serverTimestamp(),
        };

        if (finalContentData.price === undefined || finalContentData.price === null) {
            delete finalContentData.price;
        }
        
        try {
            await updateDoc(contentRef, finalContentData);
        } catch(e) {
            console.error("Error updating document with questions: ", e);
            throw new Error("Failed to update content with questions.");
        }
    } else {
        const updateData = { ...contentData };
        if (updateData.price === undefined || updateData.price === null) {
            delete updateData.price;
        }

        // If it's a simple field update (like access level)
        try {
            await updateDoc(contentRef, {
                ...updateData,
                updatedAt: serverTimestamp(),
            });
        } catch (e) {
            console.error("Error updating document: ", e);
            throw new Error("Failed to update content.");
        }
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
            return {
                id: doc.id,
                ...data,
                questions: data.questions || [],
                createdAt: data.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
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

export const uploadFile = async (file: File) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to upload files.");
    }

    console.log("Uploading file:", file);

    const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const storage = getStorage();
    const storageRef = ref(storage, `feature_images/${user.uid}/${Date.now()}_${file.name}`);

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
        await setDoc(settingsRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        throw new Error("Failed to save site settings.");
    }
}
    
    

    
