import PricingClientPage from '@/app/pricing/pricing-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Package Plans | Dashboard',
  description: 'Choose the perfect plan for your exam preparation.',
};

export default function PackagePlansPage() {
  return (
    <div className="w-full">
      <PricingClientPage />
    </div>
  );
}
