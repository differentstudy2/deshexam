
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ToyBrick, Puzzle, BookHeart, Gamepad2, BookOpen, Languages, Book, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getKidsZoneCategories } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type KidsZoneCategory = {
    id: string;
    title: string;
    description: string;
    link: string;
    image: string;
    imageHint: string;
    icon: string;
};

const iconMap: { [key: string]: React.ReactNode } = {
    Puzzle: <Puzzle className="w-12 h-12 text-primary" />,
    Gamepad2: <Gamepad2 className="w-12 h-12 text-purple-500" />,
    BookHeart: <BookHeart className="w-12 h-12 text-blue-500" />,
    BookOpen: <BookOpen className="w-12 h-12 text-orange-500" />,
    Languages: <Languages className="w-12 h-12 text-pink-500" />,
    Book: <Book className="w-12 h-12 text-rose-500" />,
    ToyBrick: <ToyBrick className="w-12 h-12 text-gray-500" />,
    default: <ToyBrick className="w-12 h-12 text-gray-500" />,
};

const getIcon = (iconName: string) => {
    return iconMap[iconName] || iconMap.default;
};

export default function KidsZoneClientPage() {
    const [categories, setCategories] = useState<KidsZoneCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const fetchedCategories = await getKidsZoneCategories();
                setCategories(fetchedCategories as KidsZoneCategory[]);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error fetching categories',
                    description: (error as Error).message
                });
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [toast]);

  return (
    <div className="bg-secondary/30">
        <section className="relative w-full py-20 md:py-28 lg:py-36" style={{ background: 'linear-gradient(to right, #71B280, #134E5E)' }}>
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://picsum.photos/seed/kids-zone-hero/1920/1080"
                    alt="A playful and colorful abstract background for kids"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover opacity-10"
                    data-ai-hint="kids playful abstract"
                />
            </div>
             <div className="container mx-auto px-4 relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 animate-gradient-text drop-shadow-lg">
                Welcome to the Kids Zone!
              </h1>
              <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto text-white/90 drop-shadow-md">
                A safe and exciting world of interactive games, fun quizzes, and engaging activities designed to make learning languages and math an unforgettable adventure for children.
              </p>
            </div>
        </section>

        <div className="container mx-auto px-4 py-16">
           {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="overflow-hidden flex flex-col">
                            <Skeleton className="h-48 w-full" />
                            <CardContent className="p-4 flex-grow space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </CardContent>
                             <CardFooter className="p-4 pt-0 mt-auto">
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {categories.map((feature, index) => (
                    <Card key={index} className="overflow-hidden flex flex-col group transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl bg-card-gradient text-white">
                        <CardHeader className="p-0 relative h-48">
                            <Image
                                src={feature.image}
                                alt={feature.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                data-ai-hint={feature.imageHint}
                            />
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <CardTitle className="font-headline text-xl mt-1 mb-2 leading-snug transition-colors text-white">
                                {feature.title}
                            </CardTitle>
                            <p className="text-sm text-slate-300 line-clamp-3">
                                {feature.description}
                            </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 mt-auto">
                            <Button asChild className="w-full">
                            <Link href={feature.link}>Let's Go!</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                </div>
            )}
        </div>
    </div>
  );
}
