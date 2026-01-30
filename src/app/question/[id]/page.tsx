
import { getQuestionById } from '@/lib/firebase/firestore';
import type { Metadata, ResolvingMetadata } from 'next';
import QuestionClientPage from './question-client-page';
import { notFound } from 'next/navigation';
import { formatTitleForBrowser } from '@/lib/utils';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = params;
  const question = await getQuestionById(id);

  if (!question) {
    return {
      title: 'Question Not Found',
    };
  }

  const plainTextTitle = formatTitleForBrowser(question.text.substring(0, 60));
  const title = `${plainTextTitle}${question.text.length > 60 ? '...' : ''}`;
  const description = `View the question: "${formatTitleForBrowser(question.text.substring(0, 160))}..." and its solution. Discuss with the community on DeshExam.`;

  return {
    title: title,
    description: description,
    keywords: [question.type, 'question', 'answer', 'discussion', 'exam preparation'],
    openGraph: {
      title: question.text,
      description: description,
      type: 'article',
    },
  };
}


export default function QuestionPage({ params }: { params: { id: string } }) {
  const { id } = params;
    return (
        <QuestionClientPage questionId={id} />
    );
}
