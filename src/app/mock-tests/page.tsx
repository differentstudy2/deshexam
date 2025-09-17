import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, HelpCircle, Search } from "lucide-react";
import { mockTests } from "@/lib/mock-data";
import { ContentBadge } from "@/components/content-badge";

export default function MockTestsPage() {
  const subjects = Array.from(new Set(mockTests.map((test) => test.subject)));

  return (
    <div className="container py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Mock Tests</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Challenge yourself with our extensive library of mock tests designed to simulate the real exam experience.
        </p>
      </header>

      <div className="mb-8 p-4 bg-secondary rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search for a test..." className="pl-10" />
          </div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject.toLowerCase()}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access Levels</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTests.map((test) => (
          <Card key={test.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
            <CardHeader className="p-0 relative">
              <Image
                src={test.image}
                alt={test.title}
                width={400}
                height={225}
                className="w-full h-auto object-cover"
                data-ai-hint={test.imageHint}
              />
              <div className="absolute top-2 right-2">
                <ContentBadge type={test.type} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <p className="text-sm font-medium text-primary">{test.subject}</p>
              <CardTitle className="font-headline text-lg mt-1 mb-2 leading-tight">{test.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>{test.questions} Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{test.duration} min</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link href={`/mock-tests/${test.id}`}>Start Test</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
