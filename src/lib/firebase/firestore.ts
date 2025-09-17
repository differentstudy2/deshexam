"use client";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const addTest = async (testData: any) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to create a test.");
    }

    try {
        const docRef = await addDoc(collection(db, "tests"), {
            ...testData,
            authorId: user.uid,
            authorName: user.displayName || user.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Failed to create test.");
    }
};

export const getTestsByAuthor = async (authorId: string) => {
    if (!authorId) {
        throw new Error("Author ID is required to fetch tests.");
    }
    try {
        const q = query(collection(db, "tests"), where("authorId", "==", authorId));
        const querySnapshot = await getDocs(q);
        const tests = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toLocaleDateString(),
            createdAtTimestamp: doc.data().createdAt?.toDate().getTime() || 0,
        }));
        
        tests.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);

        return tests;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Failed to fetch tests.");
    }
}

export const deleteTest = async (testId: string) => {
    if (!testId) {
        throw new Error("Test ID is required to delete a test.");
    }
    try {
        await deleteDoc(doc(db, "tests", testId));
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete test.");
    }
}

export const getTestById = async (testId: string) => {
    if (!testId) {
        throw new Error("Test ID is required to fetch a test.");
    }
    try {
        const testDoc = await getDoc(doc(db, "tests", testId));
        if (testDoc.exists()) {
            return { id: testDoc.id, ...testDoc.data() };
        } else {
            throw new Error("No such document!");
        }
    } catch (e) {
        console.error("Error getting document: ", e);
        throw new Error("Failed to fetch test.");
    }
};

export const updateTest = async (testId: string, testData: any) => {
    if (!testId) {
        throw new Error("Test ID is required to update a test.");
    }
    try {
        await updateDoc(doc(db, "tests", testId), {
            ...testData,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update test.");
    }
};
