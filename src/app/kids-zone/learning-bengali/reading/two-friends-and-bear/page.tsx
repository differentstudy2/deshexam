
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TwoFriendsAndBearStoryPage() {
    const storyParagraphs = [
        "এক গ্রামে দুই বন্ধু বাস করত। তারা একে অপরকে খুব ভালোবাসত এবং সবসময় একসাথে থাকত। একদিন তারা পাশের গ্রামের এক মেলায় যাওয়ার সিদ্ধান্ত নিল।",
        "যাওয়ার পথে তাদের একটি ঘন جنگল পার হতে হতো। তারা যখন জঙ্গলের মাঝখান দিয়ে যাচ্ছিল, হঠাৎ একটি বড় ভাল্লুক তাদের সামনে এসে দাঁড়াল।",
        "এক বন্ধু ভাল্লুক দেখে ভয় পেয়ে দৌড়ে কাছের একটি গাছে উঠে পড়ল। সে তার অন্য বন্ধুর কথা একবারও ভাবল না।",
        "অন্য বন্ধুটি গাছে চড়তে জানত না। সে বিপদে পড়ে বুদ্ধি খাটালো। সে শুনেছিল যে ভাল্লুক মরা মানুষ খায় না। তাই সে মাটিতে মরার মতো শুয়ে পড়ল এবং নিঃশ্বাস বন্ধ করে রাখল।",
        "ভাল্লুকটি তার কাছে এসে তার cuerpo শুঁকে দেখল। তাকে মরা ভেবে ভাল্লুকটি চলে গেল।",
        "ভাল্লুক চলে যাওয়ার পর প্রথম বন্ধুটি গাছ থেকে নেমে এলো। সে তার বন্ধুকে জিজ্ঞাসা করল, 'ভাল্লুক তোমার কানে কানে কী বলে গেল?' অন্য বন্ধুটি উত্তর দিল, 'ভাল্লুক বলে গেল, যে বন্ধু বিপদের সময় ছেড়ে চলে যায়, সে আসল বন্ধু নয়।'",
    ];

    return (
        <div className="bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-900/10 min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <Button asChild variant="ghost">
                        <Link href="/kids-zone/learning-bengali/reading">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Stories
                        </Link>
                    </Button>
                </div>
                <header className="text-center mb-12">
                    <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-green-600">
                        দুই বন্ধু ও ভাল্লুক
                    </h1>
                </header>

                <div className="bg-white/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-lg">
                    <Image
                        src="https://picsum.photos/seed/two-friends-story/800/400"
                        alt="A bear sniffing a person lying on the ground while another person watches from a tree"
                        width={800}
                        height={400}
                        className="rounded-lg mb-8 shadow-md"
                        data-ai-hint="bear forest friends"
                    />
                    <div className="prose prose-lg max-w-none text-slate-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {storyParagraphs.map((para, index) => (
                            <p key={index} className="mb-4 leading-relaxed text-xl">
                                {para}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
