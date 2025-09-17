import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const addContent = async (contentData: any) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to create a content.");
    }

    try {
        const docRef = await addDoc(collection(db, "content"), {
            ...contentData,
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
        await updateDoc(doc(db, "content", contentId), {
            ...contentData,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update content.");
    }
};

export const getAllContent = async (type?: 'Mock Test' | 'Quiz' | 'Practice Questions') => {
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
            where("userId", "==", userId),
            orderBy("submittedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                submittedAt: data.submittedAt?.toDate() || new Date(),
            }
        });
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Failed to fetch submissions.");
    }
};
