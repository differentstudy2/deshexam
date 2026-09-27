
'use client';

import { cn } from "@/lib/utils";

type ScoreCircleProps = {
  score: number;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

export const ScoreCircle = ({ score, className, size = 24, strokeWidth = 3 }: ScoreCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Ensure score is a valid number to prevent NaN issues
  const validScore = isFinite(score) ? score : 0;
  const offset = circumference - (validScore / 100) * circumference;

  const colorClass = validScore <= 33 ? 'text-destructive' : validScore <= 66 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className={cn("relative flex items-center justify-center p-0.5", className)} style={{ width: size, height: size }}>
      <svg className="absolute top-0 left-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-500 ease-in-out -rotate-90 origin-center", colorClass)}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
       <span className={cn("font-semibold", colorClass, {
           'text-xs': size < 36,
           'text-sm': size >= 36,
           'text-[0.6rem]': size < 36 && validScore === 100,
           'text-[0.7rem]': size >= 36 && validScore === 100
       })}>
        {Math.round(validScore)}%
      </span>
    </div>
  );
};
