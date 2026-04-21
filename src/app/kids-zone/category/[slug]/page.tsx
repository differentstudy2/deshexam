
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getKidsCategoryBySlug } from '@/lib/firebase/firestore';
import CategoryClientPage from './category-client-page';

type ContentItem = {
    id: string;
    title: string;
    description?: string;
    subject: string;
    testType: string | string[];
    access: "free" | "premium" | "pro";
    featureImage?: string;
    category: string;
    questions?: any[];
    link?: string;
};

// This needs to be available on the server too.
const preExistingContent: ContentItem[] = [
  // Learning Bengali
  {
    id: "bengali-alphabet",
    title: "বর্ণমালা পরিচিতি (Alphabet)",
    description: "Learn the Bengali alphabet with sounds and examples.",
    category: "Learning Bengali",
    testType: "Kids Zone",
    subject: "Bengali",
    featureImage: "https://picsum.photos/seed/bengali-alphabet/400/300",
    access: 'free',
    link: "/kids-zone/learning-bengali/alphabet",
  },
  {
    id: "bengali-matra",
    title: "মাত্রা (Matra)",
    description: "Learn how vowels combine with consonants.",
    category: "Learning Bengali",
    testType: "Kids Zone",
    subject: "Bengali",
    featureImage: "https://picsum.photos/seed/bengali-matra/400/300",
    access: 'free',
    link: "/kids-zone/learning-bengali/matra",
  },
  {
    id: "bengali-spelling",
    title: "বানান কৌশল (Spelling)",
    description: "Master Bengali spelling with interactive exercises.",
    category: "Learning Bengali",
    testType: "Kids Zone",
    subject: "Bengali",
    featureImage: "https://picsum.photos/seed/bengali-spelling/400/300",
    access: 'free',
    link: "/kids-zone/learning-bengali/spelling",
  },
  {
    id: "bengali-reading",
    title: "পড়ার অভ্যাস (Reading)",
    description: "Practice reading Bengali with short stories and passages.",
    category: "Learning Bengali",
    testType: "Kids Zone",
    subject: "Bengali",
    featureImage: "https://picsum.photos/seed/bengali-reading/400/300",
    access: 'free',
    link: "/kids-zone/learning-bengali/reading",
  },
  // Learning English
  {
    id: "english-alphabet",
    title: "Alphabet Fun",
    description: "Learn the ABCs with sounds and pictures.",
    category: "Learning English",
    testType: "Kids Zone",
    subject: "English",
    featureImage: "https://picsum.photos/seed/english-abc/400/300",
    access: 'free',
    link: "/kids-zone/learning-english/alphabet",
  },
  // Learning Urdu
  {
    id: "urdu-alphabet",
    title: "حروف تہجی (Alphabet)",
    description: "Learn the Urdu alphabet with sounds and examples.",
    category: "Learning Urdu",
    testType: "Kids Zone",
    subject: "Urdu",
    featureImage: "https://picsum.photos/seed/urdu-alphabet/400/300",
    access: 'free',
    link: "/kids-zone/learning-urdu/alphabet",
  },
  // Learning Games
  {
      id: "number-recognition",
      title: "Number Recognition",
      description: "Learn to identify numbers with this fun recognition game.",
      category: "Learning Games",
      testType: "Kids Zone",
      subject: "Math",
      featureImage: "https://picsum.photos/seed/number-recog/400/300",
      access: 'free',
      link: "/kids-zone/learning-games/number-recognition",
  },
  {
      id: "math-puzzles",
      title: "Math Puzzles",
      description: "Solve fun math problems and become a numbers wizard!",
      category: "Learning Games",
      testType: "Kids Zone",
      subject: "Math",
      featureImage: "https://picsum.photos/seed/math-puzzles/400/300",
      access: 'free',
      link: "/kids-zone/learning-games/math-puzzles",
  },
  // Demo content from before
  {
    id: 'demo-game-1',
    title: 'Addition Adventure (Demo)',
    description: 'Practice your addition skills in this exciting adventure game!',
    category: 'Learning Games',
    testType: 'Kids Zone',
    subject: 'Math',
    featureImage: 'https://picsum.photos/seed/demo-game-math/400/300',
    access: 'free',
    questions: [],
    link: '/kids-zone/learning-games/math-puzzles/addition-adventure',
  },
];


type PageProps = {
  params: { slug: string };
};

const serializeFirestoreTimestamps = (data: any): any => {
    if (!data) return data;
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestoreTimestamps(item));
    }
    if (typeof data === 'object' && data !== null) {
        if (data.hasOwnProperty('seconds') && data.hasOwnProperty('nanoseconds') && typeof (data as any).toDate === 'function') {
            return (data as any).toDate().toISOString();
        }
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            newObj[key] = serializeFirestoreTimestamps(data[key]);
        }
        return newObj;
    }
    return data;
};

// This helper function fetches category data and can be used by both generateMetadata and the page component
async function getCategoryData(slug: string) {
    let categoryName = '';
    let category: any = null;

    try {
        category = await getKidsCategoryBySlug(slug);

        if (category) {
            categoryName = category.title;
        } else {
            // Fallback for hardcoded categories
            categoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    } catch (e) {
        console.error("Error fetching category data:", e);
    }

    return { category, categoryName };
}

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = params;
  const { category, categoryName } = await getCategoryData(slug);
  
  if (!categoryName) {
    return { title: 'Category Not Found' };
  }
  
  const description = category?.description || `Explore fun activities and games in the ${categoryName} category for kids on DeshExam.`;
  const keywords = ['kids learning', categoryName, 'educational games', 'fun activities for children', 'DeshExam Kids'];
  const previousImages = (await parent).openGraph?.images || [];
  
  return {
    title: `${categoryName} | Kids Zone`,
    description,
    keywords,
    openGraph: {
        images: [`https://picsum.photos/seed/${slug}/1200/630`, ...previousImages],
    }
  };
}

export default async function KidsZoneCategoryServerPage({ params }: PageProps) {
  const { slug } = params;
  const { category, categoryName } = await getCategoryData(slug);
  
  if (!categoryName) {
    notFound();
  }

  let initialContent: ContentItem[] = [];
  try {
      const queries = [];
      const contentCollection = collection(db, "content");

      queries.push(query(contentCollection, where("category", "==", categoryName)));
      if (categoryName === "Fun Quizzes") {
          queries.push(query(contentCollection, where("testType", "==", "Quiz")));
          queries.push(query(contentCollection, where("testType", "array-contains", "Quiz")));
      }
      
      const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));
      
      const contentMap = new Map<string, ContentItem>();
      querySnapshots.forEach(snapshot => {
          snapshot.docs.forEach(doc => {
              if (!contentMap.has(doc.id)) {
                  const serializedData = serializeFirestoreTimestamps(doc.data());
                  contentMap.set(doc.id, { id: doc.id, ...serializedData } as ContentItem);
              }
          });
      });

      const fetchedContent = Array.from(contentMap.values());
      const itemsForCategory = preExistingContent.filter(item => item.category === categoryName);
      
      const combinedContent = [...fetchedContent];
      itemsForCategory.forEach(preExistingItem => {
          if (!combinedContent.some(dbItem => dbItem.title === preExistingItem.title)) {
              combinedContent.push(preExistingItem);
          }
      });
      initialContent = combinedContent;

  } catch(error) {
      console.error("Failed to fetch initial content for category page:", error);
      // We can proceed with an empty array and let the client show a message
  }

  return <CategoryClientPage initialContent={initialContent} initialCategoryName={categoryName} />;
}
