import { toBn } from "@/lib/wb-board";

/**
 * Question palette — the 1..N jump grid from the studio quiz screen.
 * Gold = current question, green = answered correct, red = answered
 * wrong, muted = not answered yet. All states come from live answers.
 */
export default function QuestionPalette({
  total,
  index,
  answers,
  onJump,
}: {
  total: number;
  index: number;
  answers: Record<number, { key: string; correct: boolean }>;
  onJump: (i: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-black text-amber-400">
        ▦ প্রশ্ন প্যালেট
      </p>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-6">
        {Array.from({ length: total }, (_, i) => {
          const a = answers[i];
          const isCurrent = i === index;
          let cls = "bg-white/10 text-white hover:bg-white/20";
          if (a?.correct) cls = "bg-green-600 text-white";
          else if (a && !a.correct) cls = "bg-red-600 text-white";
          if (isCurrent) cls = "bg-amber-400 text-slate-900 ring-2 ring-amber-200";
          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              aria-label={`প্রশ্ন ${i + 1}`}
              aria-current={isCurrent}
              className={`flex h-9 items-center justify-center rounded-lg text-sm font-black transition-transform hover:scale-110 active:scale-95 ${cls}`}
            >
              {toBn(i + 1)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-slate-400">
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-green-600 align-middle" />
          উত্তর হয়েছে
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-400 align-middle" />
          বর্তমান
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-white/20 align-middle" />
          বাকি
        </span>
      </div>
    </div>
  );
}
