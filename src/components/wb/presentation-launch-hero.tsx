import Image from "next/image";
import Link from "next/link";
import { toBn } from "@/lib/wb-board";

/**
 * Launch hero for the /presentation page.
 * Design is the same-to-same as the supplied DeshExam launch screen
 * (dark navy radial stage, gold accents, header / side panels /
 * centre logo + title + CTA / exam-info panel / footer strip),
 * but every number and label comes from the LIVE presentation data
 * passed in as props — nothing is hardcoded from the launch file.
 */
export interface LaunchHeroData {
    title: string;
    slug: string;
    /** Live test type, e.g. "Mock Test" | "Quiz" | "Practice Set". */
    typeLabel: string;
    classTitle?: string | null;
    questionCount: number;
    durationMin?: number | null;
    totalMarks?: number | null;
    /** 0 means no negative marking. undefined/null hides the row. */
    negativeMarking?: number | null;
}

const GOLD = "#FFC62A";

export default function PresentationLaunchHero({ data }: { data: LaunchHeroData }) {
    const infoRows: { icon: string; label: string; value: string }[] = [];
    if (data.questionCount > 0) {
        infoRows.push({ icon: "❓", label: "মোট প্রশ্ন", value: `${toBn(data.questionCount)}টি` });
    }
    if (data.durationMin) {
        infoRows.push({ icon: "⏱️", label: "সময়", value: `${toBn(data.durationMin)} মিনিট` });
    }
    if (data.negativeMarking !== undefined && data.negativeMarking !== null) {
        infoRows.push({
            icon: "⛔",
            label: "নেগেটিভ মার্কিং",
            value: data.negativeMarking === 0 ? "নেই" : `−${toBn(data.negativeMarking)}`,
        });
    }
    if (data.totalMarks) {
        infoRows.push({ icon: "📶", label: "মোট নম্বর", value: toBn(data.totalMarks) });
    }

    return (
        <section
            aria-label={data.title}
            className="lx-stage relative overflow-hidden rounded-3xl text-white shadow-xl mb-10"
        >
            <style>{`
                .lx-stage { background: radial-gradient(circle at 50% 40%, #16449c 0%, #0a2257 50%, #071535 100%); }
                .lx-pill { background: linear-gradient(#ffe27a, #f2a900); color: #1a1200; }
                .lx-panel { background: rgba(13,35,85,.75); border: 2px solid rgba(80,130,255,.4); }
                .lx-mask-l { -webkit-mask-image: linear-gradient(to right, #000 80%, transparent), linear-gradient(to bottom, #000 85%, transparent); -webkit-mask-composite: source-in; mask-image: linear-gradient(to right, #000 80%, transparent), linear-gradient(to bottom, #000 85%, transparent); mask-composite: intersect; }
                .lx-mask-r { -webkit-mask-image: linear-gradient(to left, #000 75%, transparent), linear-gradient(to bottom, #000 85%, transparent); -webkit-mask-composite: source-in; mask-image: linear-gradient(to left, #000 75%, transparent), linear-gradient(to bottom, #000 85%, transparent); mask-composite: intersect; }
                @keyframes lx-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes lx-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes lx-left { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes lx-right { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes lx-pop { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
                .lx-a-up { animation: lx-up .6s ease both; }
                .lx-a-in { animation: lx-in .6s ease both; }
                .lx-a-left { animation: lx-left .7s ease both; }
                .lx-a-right { animation: lx-right .7s ease both; }
                .lx-a-pop { animation: lx-pop .5s cubic-bezier(.34,1.56,.64,1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .lx-a-up, .lx-a-in, .lx-a-left, .lx-a-right, .lx-a-pop { animation: none; }
                }
            `}</style>

            {/* Header bar — same as launch */}
            <div
                className="lx-a-in flex flex-wrap items-center gap-x-4 gap-y-2 px-5 sm:px-8 py-4"
                style={{ background: "rgba(5,15,42,.92)", borderBottom: `3px solid ${GOLD}` }}
            >
                <div
                    className="grid place-items-center rounded-full font-bold shrink-0"
                    style={{ width: 56, height: 56, border: `3px solid ${GOLD}`, color: GOLD, fontSize: 22 }}
                >
                    DE
                </div>
                <div className="leading-tight">
                    <div className="text-2xl sm:text-3xl font-bold">
                        Desh<span style={{ color: GOLD }}>Exam</span>
                    </div>
                    <div className="text-[11px] tracking-[3px] text-white/80">LEARN • PRACTICE • SUCCEED</div>
                </div>
                <div className="hidden md:block w-[3px] h-12 shrink-0" style={{ background: GOLD }} />
                <div className="text-lg sm:text-2xl font-semibold flex-1 min-w-[180px]">
                    সঠিক প্রস্তুতি, সফলতার পথে
                </div>
                <span className="inline-flex items-center gap-2 text-sm sm:text-base font-bold leading-tight">
                    <span className="rounded-lg px-2.5 py-1.5 text-lg" style={{ background: "#e41818" }}>▶</span>
                    Subscribe
                    <br className="hidden sm:block" /> DeshExam
                </span>
            </div>

            {/* Body — 3 columns on desktop, stacked on mobile (centre first) */}
            <div className="flex flex-col gap-6 px-5 sm:px-8 py-6 lg:grid lg:grid-cols-[1fr_1.35fr_1fr] lg:gap-4 lg:py-8">
                {/* Centre — logo, title, CTA */}
                <div className="order-1 lg:order-2 flex flex-col items-center text-center">
                    <Image
                        src="/launch/emb.png"
                        alt=""
                        width={295}
                        height={133}
                        className="lx-a-pop w-[180px] sm:w-[240px] h-auto"
                        style={{ animationDelay: ".35s" }}
                    />
                    <Image
                        src="/launch/logo.png"
                        alt="DeshExam"
                        width={640}
                        height={106}
                        className="lx-a-pop w-[280px] sm:w-[420px] lg:w-[480px] h-auto mt-2"
                        style={{ animationDelay: ".55s" }}
                        priority
                    />
                    <span
                        className="lx-pill lx-a-pop inline-block rounded-full px-6 py-1.5 text-xl sm:text-2xl font-bold italic mt-4"
                        style={{ animationDelay: ".8s" }}
                    >
                        {data.typeLabel}
                    </span>
                    <h1
                        className="lx-a-up text-3xl sm:text-4xl lg:text-[2.5rem] font-bold leading-snug mt-4"
                        style={{ animationDelay: ".95s" }}
                    >
                        {data.title}
                    </h1>
                    {data.classTitle ? (
                        <span
                            className="lx-pill lx-a-pop inline-block rounded-xl px-6 py-1.5 text-xl sm:text-2xl font-bold mt-4"
                            style={{ animationDelay: "1.1s" }}
                        >
                            {data.classTitle}
                        </span>
                    ) : null}
                    <p className="lx-a-in text-base sm:text-lg text-white/85 mt-4" style={{ animationDelay: "1.25s" }}>
                        <span style={{ color: GOLD }}>—</span>&nbsp; নিজেকে যাচাই করুন, এগিয়ে যান আরও দূরে... &nbsp;
                        <span style={{ color: GOLD }}>—</span>
                    </p>
                    <Link
                        href={`/presentation/${data.slug}`}
                        className="lx-pill lx-a-up inline-block rounded-full px-8 sm:px-10 py-3 sm:py-4 text-2xl sm:text-3xl font-bold mt-5"
                        style={{ animationDelay: "1.4s", boxShadow: "0 0 40px rgba(255,198,42,.6)" }}
                    >
                        ▶ টেস্ট শুরু করো »
                    </Link>
                </div>

                {/* Left — student photo + feature panel + books */}
                <div className="order-3 lg:order-1 flex flex-col items-center lg:items-start gap-4">
                    <Image
                        src="/launch/student.jpg"
                        alt=""
                        width={480}
                        height={420}
                        className="lx-mask-l lx-a-left w-[280px] sm:w-[340px] lg:w-full max-w-[420px] h-auto rounded-2xl"
                        style={{ animationDelay: ".2s" }}
                    />
                    <div className="lx-panel lx-a-left rounded-3xl px-5 py-2 w-full max-w-[420px]" style={{ animationDelay: ".45s" }}>
                        {[
                            { icon: "🎯", text: "সঠিক প্রস্তুতি" },
                            { icon: "📊", text: "শক্তি মূল্যায়ন" },
                            { icon: "💡", text: "উন্নতির পরিকল্পনা" },
                        ].map((row, i) => (
                            <div
                                key={row.text}
                                className="flex items-center gap-3 py-3 text-lg sm:text-xl font-medium"
                                style={{ borderBottom: i < 2 ? "1px solid rgba(255,255,255,.14)" : "none" }}
                            >
                                <span className="w-10 text-center text-2xl">{row.icon}</span>
                                {row.text}
                            </div>
                        ))}
                    </div>
                    <Image
                        src="/launch/books.jpg"
                        alt=""
                        width={290}
                        height={181}
                        className="lx-a-left w-[200px] sm:w-[240px] h-auto rounded-2xl"
                        style={{ animationDelay: ".6s" }}
                    />
                </div>

                {/* Right — building photo + exam-info panel (LIVE data) */}
                <div className="order-2 lg:order-3 flex flex-col items-center lg:items-end gap-4">
                    <Image
                        src="/launch/bldg.jpg"
                        alt=""
                        width={512}
                        height={325}
                        className="lx-mask-r lx-a-right w-[280px] sm:w-[340px] lg:w-full max-w-[420px] h-auto rounded-2xl"
                        style={{ animationDelay: ".2s" }}
                    />
                    <span
                        className="lx-pill lx-a-pop inline-block rounded-full px-6 py-1.5 text-lg sm:text-xl font-bold"
                        style={{ animationDelay: ".7s" }}
                    >
                        📋 পরীক্ষার তথ্য
                    </span>
                    <div className="lx-panel lx-a-right rounded-3xl px-5 py-2 w-full max-w-[420px]" style={{ animationDelay: ".85s" }}>
                        {infoRows.map((row, i) => (
                            <div
                                key={row.label}
                                className="flex items-center gap-3 py-3 text-lg sm:text-xl"
                                style={{ borderBottom: i < infoRows.length - 1 ? "1px solid rgba(255,255,255,.14)" : "none" }}
                            >
                                <span className="w-10 text-center text-2xl">{row.icon}</span>
                                <span>{row.label}</span>
                                <span className="ml-auto font-bold" style={{ color: GOLD }}>
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer strip — same as launch */}
            <div
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 sm:px-8 py-4 text-base sm:text-lg"
                style={{ background: "#050f2a", borderTop: `3px solid ${GOLD}` }}
            >
                <span>🏆 সফলতার জন্য আজই শুরু হোক আপনার প্রস্তুতি...</span>
                <Link href="https://deshexam.vercel.app/" className="font-semibold hover:underline">
                    🌐 deshexam.vercel.app
                </Link>
            </div>
        </section>
    );
}
