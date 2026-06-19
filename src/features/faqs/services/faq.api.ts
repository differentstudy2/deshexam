import { FAQ, FAQFilters, CreateFAQDTO, UpdateFAQDTO, FAQCategory, FAQTag } from '../types/faq.types';

// In-memory mock database
let faqsDB: FAQ[] = [
  {
    id: "faq_1",
    question: "কিভাবে মক টেস্ট শুরু করব?",
    answer: "মক টেস্ট শুরু করতে প্রথমে ড্যাশবোর্ডে যান, তারপর 'Mock Tests' মেনুতে ক্লিক করুন। আপনার কাঙ্ক্ষিত পরীক্ষাটি নির্বাচন করে 'Start Test' বাটনে ক্লিক করুন।",
    categoryId: "mock_tests",
    tags: ["mock_test", "start"],
    status: "published",
    order: 1,
    seo: {
      slug: "how-to-start-mock-test",
      metaTitle: "কিভাবে মক টেস্ট শুরু করবেন? | DeshExam",
      metaDescription: "DeshExam এ কিভাবে সহজেই মক টেস্ট শুরু করবেন তার বিস্তারিত গাইড।",
      schemaEnabled: true
    },
    featured: true,
    views: 1250,
    createdAt: new Date("2025-01-10T10:00:00Z").toISOString(),
    updatedAt: new Date("2025-01-15T10:00:00Z").toISOString()
  },
  {
    id: "faq_2",
    question: "Pass Pro সাবস্ক্রিপশন এর সুবিধা কি?",
    answer: "Pass Pro সাবস্ক্রিপশন নিলে আপনি সকল প্রিমিয়াম মক টেস্ট, বিস্তারিত ব্যাখ্যামূলক উত্তরপত্র এবং লিডারবোর্ডে আপনার পারফরম্যান্স এনালাইটিক্স আনলক করতে পারবেন।",
    categoryId: "subscription",
    tags: ["pricing", "pro"],
    status: "published",
    order: 2,
    seo: {
      slug: "benefits-of-pass-pro",
      schemaEnabled: true
    },
    featured: true,
    views: 890,
    createdAt: new Date("2025-02-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2025-02-01T10:00:00Z").toISOString()
  },
  {
    id: "faq_3",
    question: "How to reset my password?",
    answer: "Go to the login page and click on 'Forgot Password'. Enter your registered email address and we will send you a reset link.",
    categoryId: "account",
    tags: ["password", "login"],
    status: "published",
    order: 3,
    seo: {
      slug: "how-to-reset-password",
      schemaEnabled: false
    },
    featured: false,
    views: 450,
    createdAt: new Date("2025-02-15T10:00:00Z").toISOString(),
    updatedAt: new Date("2025-02-15T10:00:00Z").toISOString()
  },
  {
    id: "faq_4",
    question: "Payment failed but money was deducted?",
    answer: "If your payment failed but the amount was deducted, it will automatically be refunded to your account within 3-5 business days. Contact support if you need immediate assistance.",
    categoryId: "payments",
    tags: ["payment", "refund"],
    status: "published",
    order: 4,
    seo: {
      slug: "payment-failed-money-deducted",
      schemaEnabled: true
    },
    featured: false,
    views: 1020,
    createdAt: new Date("2025-03-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2025-03-01T10:00:00Z").toISOString()
  },
  {
    id: "faq_5",
    question: "Upcoming features in DeshExam (Draft)",
    answer: "We are building an AI video generator and smart SEO assistant for academy owners.",
    categoryId: "general",
    tags: ["features", "roadmap"],
    status: "draft",
    order: 5,
    seo: {
      slug: "upcoming-features",
      schemaEnabled: false
    },
    featured: false,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getFaqs = async (filters?: FAQFilters): Promise<FAQ[]> => {
  await delay(600); // Simulate network
  
  let result = [...faqsDB];

  if (filters) {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(f => 
        f.question.toLowerCase().includes(s) || 
        f.answer.toLowerCase().includes(s) ||
        f.tags.some(t => t.toLowerCase().includes(s))
      );
    }
    if (filters.categoryId && filters.categoryId !== "all") {
      result = result.filter(f => f.categoryId === filters.categoryId);
    }
    if (filters.status && filters.status !== "all" as any) {
      result = result.filter(f => f.status === filters.status);
    }
    if (filters.tag && filters.tag !== "all") {
      result = result.filter(f => f.tags.includes(filters.tag!));
    }

    if (filters.sortBy) {
      switch(filters.sortBy) {
        case "latest":
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "oldest":
          result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case "most_viewed":
          result.sort((a, b) => b.views - a.views);
          break;
        case "alphabetical":
          result.sort((a, b) => a.question.localeCompare(b.question));
          break;
      }
    } else {
        // default sort by order
        result.sort((a, b) => a.order - b.order);
    }
  } else {
      result.sort((a, b) => a.order - b.order);
  }

  return result;
};

export const getFaqById = async (id: string): Promise<FAQ | null> => {
  await delay(400);
  return faqsDB.find(f => f.id === id) || null;
};

export const createFaq = async (data: CreateFAQDTO): Promise<FAQ> => {
  await delay(800);
  const newFaq: FAQ = {
    ...data,
    id: `faq_${Date.now()}`,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  faqsDB.push(newFaq);
  return newFaq;
};

export const updateFaq = async (id: string, data: UpdateFAQDTO): Promise<FAQ> => {
  await delay(800);
  const index = faqsDB.findIndex(f => f.id === id);
  if (index === -1) throw new Error("FAQ not found");

  faqsDB[index] = {
    ...faqsDB[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  return faqsDB[index];
};

export const deleteFaq = async (id: string): Promise<boolean> => {
  await delay(600);
  faqsDB = faqsDB.filter(f => f.id !== id);
  return true;
};

export const bulkDeleteFaqs = async (ids: string[]): Promise<boolean> => {
    await delay(1000);
    faqsDB = faqsDB.filter(f => !ids.includes(f.id));
    return true;
};

export const reorderFaqs = async (updates: { id: string, order: number }[]): Promise<boolean> => {
    await delay(500);
    updates.forEach(update => {
        const faq = faqsDB.find(f => f.id === update.id);
        if (faq) {
            faq.order = update.order;
        }
    });
    return true;
};

let categoriesDB: FAQCategory[] = [
  { id: "general", name: "General", slug: "general" },
  { id: "account", name: "Account & Profile", slug: "account" },
  { id: "mock_tests", name: "Mock Tests & Quizzes", slug: "mock-tests" },
  { id: "subscription", name: "Subscriptions & Pass Pro", slug: "subscription" },
  { id: "payments", name: "Payments & Refunds", slug: "payments" },
  { id: "materials", name: "Study Materials & Notes", slug: "materials" },
  { id: "live_classes", name: "Live Classes", slug: "live-classes" },
  { id: "results", name: "Results & Leaderboards", slug: "results" },
  { id: "support", name: "Technical Support", slug: "support" }
];

let tagsDB: FAQTag[] = [
  { id: "tag_1", name: "login" },
  { id: "tag_2", name: "password" },
  { id: "tag_3", name: "refund" },
  { id: "tag_4", name: "mock_test" },
  { id: "tag_5", name: "pricing" },
];

export const getCategories = async (): Promise<FAQCategory[]> => {
  await delay(300);
  return [...categoriesDB];
};

export const createCategory = async (data: Omit<FAQCategory, "id">): Promise<FAQCategory> => {
  await delay(500);
  const newCat = { ...data, id: `cat_${Date.now()}` };
  categoriesDB.push(newCat);
  return newCat;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  await delay(400);
  categoriesDB = categoriesDB.filter(c => c.id !== id);
  return true;
};

export const getTags = async (): Promise<FAQTag[]> => {
  await delay(300);
  return [...tagsDB];
};

export const createTag = async (name: string): Promise<FAQTag> => {
  await delay(500);
  const newTag = { name, id: `tag_${Date.now()}` };
  tagsDB.push(newTag);
  return newTag;
};

export const deleteTag = async (id: string): Promise<boolean> => {
  await delay(400);
  tagsDB = tagsDB.filter(t => t.id !== id);
  return true;
};
