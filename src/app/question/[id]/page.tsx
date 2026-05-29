
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
  const id = params.id;
  const question = await getQuestionById(id);

  if (!question) {
    return {
      title: 'Question Not Found',
    };
  }

<<<<<<< HEAD
  const plainTextTitle = formatTitleForBrowser(question.text.substring(0, 60));
  const title = `${plainTextTitle}${question.text.length > 60 ? '...' : ''}`;
  const description = `View the question: "${formatTitleForBrowser(question.text.substring(0, 160))}..." and its solution. Discuss with the community on DeshExam.`;

  return {
    title: title,
=======
  const description = `View the question: "${question.text.substring(0, 150)}..." and see community discussion and explanations on DeshExam.`;

  return {
    title: `Question: ${question.text.substring(0, 50)}...`,
>>>>>>> 49fc1c0c874748b5830da174a57557d18a08f292
    description: description,
    keywords: ['question', 'answer', question.subject || 'general knowledge', 'exam practice'],
    openGraph: {
      title: `Question | DeshExam`,
      description: question.text,
      type: 'article',
    },
  };
}

export default async function QuestionPage({ params }: Props) {
    const questionData = await getQuestionById(params.id);

    if (!questionData) {
        notFound();
    }
    
    // Serialize the question object to make it a "plain object"
    const question = {
      ...questionData,
      createdAt: questionData.createdAt?.toISOString() ?? new Date().toISOString(),
    };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Question',
        'name': question.text,
        'text': question.text,
        'upvoteCount': question.likes || 0,
        'answerCount': question.comments?.length || 0, // Assuming comments are answers
        'author': {
            '@type': 'Person',
            'name': question.authorName,
        },
        'dateCreated': question.createdAt,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <QuestionClientPage initialQuestion={question} />
        </>
    );
}
