import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// 1. Reset Daily XP at Midnight (Server Time)
export const resetDailyXP = onSchedule({
  schedule: "every day 00:00",
  timeZone: "Asia/Dhaka"
}, async () => {
  const usersSnap = await db.collection("users").where("xp_today", ">", 0).get();
  
  const batch = db.batch();
  usersSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { xp_today: 0 });
  });

  await batch.commit();
  console.log(`Reset xp_today for ${usersSnap.size} users.`);
});

// 2. Reset Weekly XP every Monday at Midnight
export const resetWeeklyXP = onSchedule({
  schedule: "every monday 00:00",
  timeZone: "Asia/Dhaka"
}, async () => {
  const usersSnap = await db.collection("users").where("xp_week", ">", 0).get();
  
  const batch = db.batch();
  usersSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { xp_week: 0 });
  });

  await batch.commit();
  console.log(`Reset xp_week for ${usersSnap.size} users.`);
});

// 3. Reset Monthly XP on the 1st of every Month at Midnight
export const resetMonthlyXP = onSchedule({
  schedule: "1 of month 00:00",
  timeZone: "Asia/Dhaka"
}, async () => {
  const usersSnap = await db.collection("users").where("xp_month", ">", 0).get();
  
  const batch = db.batch();
  usersSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { xp_month: 0 });
  });

  await batch.commit();
  console.log(`Reset xp_month for ${usersSnap.size} users.`);
});
