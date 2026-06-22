import { config } from "dotenv";
config({ path: ".env.local" });

import { getAdminDb } from "./src/lib/firebase/admin";

async function run() {
  const db = getAdminDb();
  if (!db) {
    console.error("No DB");
    return;
  }
  
  const classesSnap = await db.collection("taxonomy_nodes").where("type", "==", "class").limit(20).get();
  console.log("CLASSES:");
  classesSnap.forEach(doc => console.log(doc.id, doc.data().title));

  const subjectSnap = await db.collection("taxonomy_nodes").where("type", "==", "subject").limit(5).get();
  console.log("\nSUBJECTS:");
  subjectSnap.forEach(doc => console.log(doc.id, doc.data().title, "parentId:", doc.data().parentId));

  const textbookSnap = await db.collection("taxonomy_nodes").where("type", "==", "textbook").limit(5).get();
  console.log("\nTEXTBOOKS:");
  textbookSnap.forEach(doc => console.log(doc.id, doc.data().title, "parentId:", doc.data().parentId));
}

run().catch(console.error);
