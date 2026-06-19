import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const catsSnap = await adminDb.collection("faq_categories").get();
    const faqsSnap = await adminDb.collection("faqs").get();
    
    let updatedCats = 0;
    let updatedFaqs = 0;

    for (const catDoc of catsSnap.docs) {
      const data = catDoc.data();
      const oldId = catDoc.id;
      const slug = data.slug;
      
      if (slug && oldId !== slug) {
        // Create new category with ID = slug
        await adminDb.collection("faq_categories").doc(slug).set(data);
        updatedCats++;

        // Update all FAQs that referenced the old ID
        const batch = adminDb.batch();
        faqsSnap.docs.forEach(faqDoc => {
          if (faqDoc.data().categoryId === oldId) {
            batch.update(adminDb.collection("faqs").doc(faqDoc.id), { categoryId: slug });
            updatedFaqs++;
          }
        });
        await batch.commit();

        // Delete old category
        await adminDb.collection("faq_categories").doc(oldId).delete();
      }
    }

    return NextResponse.json({ success: true, updatedCats, updatedFaqs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
