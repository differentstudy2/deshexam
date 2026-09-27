import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Audios | DeshExam',
  description: 'Listen & Learn Anytime with DeshExam Audio Library',
};

export default function AudiosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
