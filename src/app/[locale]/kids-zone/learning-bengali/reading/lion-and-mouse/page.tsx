
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LionAndMouseStoryPage() {
    const storyParagraphs = [
        "এক বনে এক শক্তিশালী সিংহ বাস করত। একদিন সিংহটি ঘুমাচ্ছিল, তখন একটি ছোট ইঁদুর তার উপর দিয়ে দৌড়াদৌড়ি শুরু করল। এতে সিংহের ঘুম ভেঙে গেল।",
        "সিংহ রেগে গিয়ে ইঁদুরটিকে ধরে ফেলল এবং তাকে মেরে ফেলতে চাইল। ইঁদুরটি ভয়ে কাঁপতে কাঁপতে বলল, 'মহারাজ, আমাকে ক্ষমা করুন। আমি আর কখনো এমন ভুল করব না। একদিন হয়তো আমি আপনার উপকারে আসতে পারি।'",
        "ইঁদুরের কথা শুনে সিংহ হেসে ফেলল। সে ভাবল, 'এই ছোট প্রাণী আমার কী উপকার করবে!' কিন্তু তার দয়া হলো এবং সে ইঁদুরটিকে ছেড়ে দিল।",
        " কিছুদিন পর, সিংহটি শিকারিদের জালে আটকা পড়ল। সে जोर-जोर से গর্জন করতে লাগল, কিন্তু কেউ তাকে সাহায্য করতে এগিয়ে আসল না।",
        "ইঁদুরটি সিংহের গর্জন শুনতে পেয়ে ছুটে এলো। সে সিংহকে জালে বাঁধা দেখে তার ধারালো দাঁত দিয়ে জাল কাটতে শুরু করল। কিছুক্ষণ চেষ্টার পর সে জাল কেটে সিংহকে মুক্ত করল।",
        "সিংহ ইঁদুরের কাছে কৃতজ্ঞতা প্রকাশ করল এবং বুঝতে পারল যে ছোট হলেও কাউকে অবহেলা করতে নেই।",
    ];

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 min-h-screen">
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
                    <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-yellow-600">
                        সিংহ এবং ইঁদুর
                    </h1>
                </header>

                <div className="bg-white/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-lg">
                    <Image
                        src="https://picsum.photos/seed/lion-and-mouse-story/800/400"
                        alt="A mouse gnawing at a rope net to free a trapped lion"
                        width={800}
                        height={400}
                        className="rounded-lg mb-8 shadow-md"
                        data-ai-hint="lion mouse net"
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
