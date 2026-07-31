
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SheyalerChalakiStoryPage() {
    const storyParagraphs = [
        "এক বনে এক চালাক শেয়াল বাস করত। সে ছিল খুব বুদ্ধিমান এবং সবসময় নতুন নতুন ফন্দি খুঁজত। একদিন সে খুব ক্ষুধার্ত ছিল কিন্তু কোথাও কোনো খাবার খুঁজে পাচ্ছিল না।",
        "হঠাৎ সে দেখতে পেল এক কাক তার ঠোঁটে এক টুকরো মাংস নিয়ে গাছের ডালে বসে আছে। শেয়ালের জিভে জল এসে গেল। সে ভাবল, 'এই মাংসটা আমার চাই।'",
        "শেয়াল গাছের নিচে গিয়ে কাককে মিষ্টি গলায় বলল, 'কাক ভাই, তোমার গলাটা নাকি খুব সুন্দর! তুমি নাকি খুব ভালো গান গাইতে পারো। আমাকে একটা গান শোনাবে?'",
        " বোকা কাক শেয়ালের প্রশংসায় ভুলে গেল এবং গান গাওয়ার জন্য যেই না মুখ খুলল, তার ঠোঁট থেকে মাংসের টুকরোটা নিচে পড়ে গেল।",
        "চালাক শেয়াল সঙ্গে সঙ্গে মাংসের টুকরোটা তুলে নিয়ে দৌড় দিল। আর বোকা কাক তার বোকামির জন্য আফসোস করতে লাগল।",
        "শেয়াল মনের আনন্দে মাংস খেতে খেতে ভাবল, 'বুদ্ধি থাকলেই উপায় হয়।'",
    ];

    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 min-h-screen">
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
                    <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-orange-600">
                        শেয়ালের চালাকি
                    </h1>
                </header>

                <div className="bg-white/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-lg">
                    <Image
                        src="https://picsum.photos/seed/fox-story/800/400"
                        alt="A clever fox looking up at a crow in a tree"
                        width={800}
                        height={400}
                        className="rounded-lg mb-8 shadow-md"
                        data-ai-hint="fox crow tree"
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
