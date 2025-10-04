
import type { Metadata } from 'next';
import PricingClientPage from './pricing-client';

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Choose the perfect plan for your exam preparation. Compare DeshExam Pass and Pass Pro to unlock mock tests, previous year papers, and premium features.',
  keywords: ['pricing', 'subscription', 'deshexam pass', 'pass pro', 'exam preparation cost'],
};

export default function PricingPage() {
    return <PricingClientPage />;
}
