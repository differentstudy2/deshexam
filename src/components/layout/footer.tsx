
import Link from "next/link";
import { DeshExamLogo } from "@/components/icons";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 md:col-span-1 flex flex-col items-center text-center">
            <DeshExamLogo />
            <p className="text-sm text-muted-foreground max-w-xs">
              Your ultimate destination for mock tests, quizzes, and personalized learning paths.
            </p>
          </div>
          <div className="grid grid-cols-2 col-span-1 md:col-span-2 gap-8">
            <div className="text-left">
              <h4 className="font-headline font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/mock-tests" className="text-sm hover:text-primary transition-colors">Mock Tests</Link></li>
                <li><Link href="/quizzes" className="text-sm hover:text-primary transition-colors">Quizzes</Link></li>
                <li><Link href="/pricing" className="text-sm hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/leaderboard" className="text-sm hover:text-primary transition-colors">Leaderboard</Link></li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-headline font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-sm hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="text-sm hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link href="/terms" className="text-sm hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
             <div className="space-y-4 flex flex-col items-center col-span-2 text-center">
              <h4 className="font-headline font-semibold">Follow Us</h4>
              <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin /></Link>
              </div>
          </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DeshExam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
