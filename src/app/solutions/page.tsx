import { Metadata } from 'next';
import SolutionsClient from './SolutionsClient';

export const metadata: Metadata = {
  title: 'Textbook Solutions | All Boards | DeshExam',
  description: 'Comprehensive textbook solutions for all major educational boards including CBSE, WBBSE, WBCHSE, ICSE, and NCERT. Find chapter-wise step-by-step solutions.',
};

export default function SolutionsPage() {
  return <SolutionsClient />;
}
