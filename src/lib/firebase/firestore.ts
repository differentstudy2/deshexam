"use client";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore";
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
