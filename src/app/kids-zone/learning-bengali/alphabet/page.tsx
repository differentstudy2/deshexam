
import type { Metadata } from 'next';
import BengaliAlphabetClientPage from './alphabet-client-page';

export const metadata: Metadata = {
  title: 'Learn Bengali Alphabet (বাংলা বর্ণমালা) | Interactive Kids Learning',
  description: "A fun and interactive way for kids to learn the Bengali alphabet! Click on vowels (স্বরবর্ণ) and consonants (ব্যঞ্জনবর্ণ) to hear their pronunciation. Perfect for beginners.",
  keywords: ['bengali alphabet', 'bangla bornomala', 'learn bengali', 'bengali for kids', 'বাংলা বর্ণমালা', 'স্বরবর্ণ', 'ব্যঞ্জনবর্ণ', 'bengali letters'],
};

export default function BengaliAlphabetPage() {
  return <BengaliAlphabetClientPage />;
}
