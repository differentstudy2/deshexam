
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function KocchopOKhorgoshStoryPage() {
    const storyParagraphs = [
        "এক বনে এক খরগোশ ছিল। সে তার দ্রুতগতির জন্য খুব অহংকার করত। সে সবসময় অন্য প্রাণীদের নিয়ে হাসাহাসি করত কারণ তারা তার মতো দ্রুত দৌড়াতে পারত না।",
        "একদিন এক কচ্ছপ খরগোশের অহংকারে বিরক্ত হয়ে তাকে দৌড় প্রতিযোগিতার জন্য আহ্বান জানাল। খরগোশ হাসতে হাসতে রাজি হয়ে গেল। সে ভাবল, 'এই ধীরগতির কচ্ছপ আমার সাথে দৌড়াবে!'",
        "প্রতিযোগিতা শুরু হলো। খরগোশ চোখের পলকে অনেক দূর এগিয়ে গেল এবং কচ্ছপকে পেছনে ফেলে দিল। খরগোশ ভাবল, 'কচ্ছপের আসতে অনেক দেরি। আমি একটু ঘুমিয়ে নিই।' এই ভেবে সে এক গাছের নিচে ঘুমিয়ে পড়ল।",
        "অন্যদিকে, কচ্ছপ ধীরে ধীরে কিন্তু না থেমে হাঁটতে থাকল। সে খরগোশকে ঘুমন্ত অবস্থায় দেখতে পেল কিন্তু তাকে বিরক্ত না করে নিজের পথে এগিয়ে গেল।",
        "খরগোশের যখন ঘুম ভাঙল, সে দেখল সূর্য প্রায় ডুবে গেছে। সে দ্রুত দৌড়াতে শুরু করল কিন্তু শেষ রক্ষা হলো না। সে দেখল, কচ্ছপ তার আগেই শেষ সীমায় পৌঁছে গেছে।",
        "খরগোশ তার ভুলের জন্য খুব লজ্জিত হলো এবং বুঝতে পারল যে অহংকার করা ভালো নয়। ধীর এবং স্থিররাই সব সময় জয়ী হয়।",
    ];

    return (
        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/10 min-h-screen">
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
                    <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-teal-600">
                        কচ্ছপ ও খরগোশ
                    </h1>
                </header>

                <div className="bg-white/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-lg">
                    <Image
                        src="https://picsum.photos/seed/tortoise-story/800/400"
                        alt="A tortoise crossing the finish line while a hare sleeps under a tree"
                        width={800}
                        height={400}
                        className="rounded-lg mb-8 shadow-md"
                        data-ai-hint="tortoise hare race"
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
