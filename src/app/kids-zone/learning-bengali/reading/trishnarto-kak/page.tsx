
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TrishnartoKakStoryPage() {
    const storyParagraphs = [
        "এক গ্রীষ্মের দুপুরে এক কাক খুব তৃষ্ণার্ত হয়ে পড়েছিল। সে জলের খোঁজে এদিক-ওদিক উড়ে বেড়াচ্ছিল কিন্তু কোথাও জল খুঁজে পাচ্ছিল না।",
        "অনেকক্ষণ ওড়ার পর সে একটি কলসি দেখতে পেল। সে খুব খুশি হয়ে কলসির কাছে উড়ে গেল। কিন্তু কলসির ভেতরে জল ছিল খুব সামান্য, যা তার ঠোঁট পর্যন্ত পৌঁছাচ্ছিল না।",
        "কাকটি খুব হতাশ হলো কিন্তু হাল ছাড়ল না। সে ভাবতে লাগল কীভাবে জল পান করা যায়। হঠাৎ তার মাথায় এক বুদ্ধি এলো।",
        "সে দেখতে পেল কলসির পাশে অনেক ছোট ছোট নুড়ি পাথর পড়ে আছে। সে এক এক করে পাথরগুলো ঠোঁটে করে এনে কলসির ভেতর ফেলতে লাগল।",
        "কিছুক্ষণ পর দেখা গেল, পাথর ফেলার ফলে কলসির জল ধীরে ধীরে উপরে উঠে আসছে। কাকটি খুশি হয়ে আরও পাথর ফেলতে থাকল।",
        "অবশেষে, জল اتنا উপরে উঠে এলো যে কাক সহজেই তার ঠোঁট ডুবিয়ে জল পান করতে পারল। সে তৃষ্ণা মিটিয়ে খুশিমনে উড়ে গেল। এই গল্প আমাদের শেখায় যে, বুদ্ধি থাকলে যেকোনো সমস্যার সমাধান করা সম্ভব।",
    ];

    return (
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/10 min-h-screen">
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
                    <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-sky-600">
                        তৃষ্ণার্ত কাক
                    </h1>
                </header>

                <div className="bg-white/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-lg">
                    <Image
                        src="https://picsum.photos/seed/crow-story/800/400"
                        alt="A thirsty crow dropping pebbles into a pitcher of water"
                        width={800}
                        height={400}
                        className="rounded-lg mb-8 shadow-md"
                        data-ai-hint="crow pitcher water"
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
