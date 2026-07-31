
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { leaderboardData } from "@/lib/mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See how you stack up against other aspirants on the DeshExam leaderboard. Compete, climb the ranks, and stay motivated on your path to success.',
  keywords: ['leaderboard', 'exam ranks', 'mock test leaderboard', 'top students', 'competitive ranking'],
};

export default function LeaderboardPage() {
  const topThree = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  const rankColors = [
    "text-amber-500", // Gold for 1st
    "text-slate-400", // Silver for 2nd
    "text-amber-700", // Bronze for 3rd
  ];

  return (
    <div className="container py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Leaderboard</h1>
        <p className="text-lg text-muted-foreground mt-2">See who's at the top of their game.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {topThree.map((user, index) => (
          <Card key={user.rank} className={`relative overflow-hidden shadow-lg ${index === 0 ? 'border-primary border-2' : ''}`}>
            {index === 0 && (
              <div className="absolute -top-6 -right-6 bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
                <Crown className="w-8 h-8" />
              </div>
            )}
            <CardHeader className="text-center items-center">
              <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                <AvatarImage src={user.avatar} data-ai-hint="person face" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
              <CardDescription>
                <span className={`font-bold text-3xl ${rankColors[index]}`}>#{user.rank}</span>
              </CardDescription>
              <div className="flex justify-around mt-4 text-sm text-muted-foreground">
                <div className="text-center">
                  <p className="font-bold text-lg text-foreground">{user.score}</p>
                  <p>Score</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-foreground">{user.time}</p>
                  <p>Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-1/2 mx-auto">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="overall">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Completion Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rest.map((user) => (
                    <TableRow key={user.rank}>
                      <TableCell className="font-medium">#{user.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} data-ai-hint="person face" />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{user.score}</TableCell>
                      <TableCell className="text-right">{user.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly">
            <div className="text-center py-16 text-muted-foreground">Weekly leaderboard data will be available soon.</div>
        </TabsContent>
        <TabsContent value="monthly">
            <div className="text-center py-16 text-muted-foreground">Monthly leaderboard data will be available soon.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
