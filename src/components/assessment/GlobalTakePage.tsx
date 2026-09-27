import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { ExamClient, ExamConfig } from '@/components/assessment/ExamClient';
import { getAssessmentBySlug, getAssessment, AssessmentCollectionType } from '@/lib/firebase/assessment';
import { getTaxonomyNodeById } from '@/lib/firebase/taxonomy';
import { getQuestionsByIds } from '@/lib/firebase/question-bank';
import { getHardcodedMockTest, getHardcodedQuiz, getHardcodedPracticeSet } from '@/lib/hardcoded-loader';

interface GlobalTakePageProps {
  collectionName: AssessmentCollectionType;
  slug: string;
}

const getCachedQuestions = unstable_cache(
  async (ids: string[]) => getQuestionsByIds(ids),
  ['questions-by-ids'],
  { revalidate: 2592000, tags: ['questions'] } // 30 days cache
);

export async function GlobalTakePage({ collectionName, slug }: GlobalTakePageProps) {
  // Try finding by slug first
  let assessment: any = await getAssessmentBySlug(collectionName, slug);

  // If not found by slug, try ID
  if (!assessment) {
    assessment = await getAssessment(collectionName, slug);
  }

  // If not found in Firebase, fallback to Hardcoded
  if (!assessment) {
    if (collectionName === 'mockTests') assessment = getHardcodedMockTest(slug);
    else if (collectionName === 'quizzes') assessment = getHardcodedQuiz(slug);
    else if (collectionName === 'practiceSets') assessment = getHardcodedPracticeSet(slug);
  }

  if (!assessment) {
    notFound();
  }

  let rawQuestions: any[] = [];
  if (assessment.questions && Array.isArray(assessment.questions) && assessment.questions.length > 0) {
    rawQuestions = assessment.questions;
  } else {
    const questionIds = assessment.questionIds || [];
    rawQuestions = await getCachedQuestions(questionIds);
  }

  let taxonomyParts: string[] = [];
  if (assessment.boardId) { const node = await getTaxonomyNodeById(assessment.boardId); if (node) taxonomyParts.push(node.acronym || node.title); }
  if (assessment.classId) { const node = await getTaxonomyNodeById(assessment.classId); if (node) taxonomyParts.push(node.title); }
  if (assessment.subjectId) { const node = await getTaxonomyNodeById(assessment.subjectId); if (node) taxonomyParts.push(node.title); }
  if (assessment.chapterId) { const node = await getTaxonomyNodeById(assessment.chapterId); if (node) taxonomyParts.push(node.title); }
  
  const taxonomyLine = taxonomyParts.length > 0 ? taxonomyParts.join(' • ') : undefined;

  const durationMin = assessment.durationMin || assessment.timeLimitMin || assessment.estimatedTimeMin || 60;
  const attemptsAllowed = assessment.attemptsAllowed || 0;

  const examConfig: ExamConfig = {
    id: assessment.id,
    slug: assessment.slug,
    title: assessment.title,
    durationMin,
    totalMarks: rawQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
    negativeMarking: 0,
    attemptsAllowed,
    isStrictMode: false,
    shuffleQuestions: false,
    shuffleOptions: false,
    accessType: assessment.accessType,
    allowedSubscriptionPlans: assessment.allowedSubscriptionPlans,
    taxonomyLine
  };

  const serializedQuestions = JSON.parse(JSON.stringify(rawQuestions));

  return <ExamClient mockTest={examConfig} initialQuestions={serializedQuestions} />;
}
