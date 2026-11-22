"use client";

import { useEffect, useState } from "react";

/** Live analog clock + digital time for the dashboard's left rail. */
export default function StudioClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const s = now.getSeconds();
  const m = now.getMinutes();
  const h = now.getHours() % 12;
  const secDeg = s * 6;
  const minDeg = m * 6 + s * 0.1;
  const hrDeg = h * 30 + m * 0.5;

  let hh = now.getHours();
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  const digital = `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;

  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="110" height="110" viewBox="0 0 120 120" aria-label="ঘড়ি">
        <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#fbbf24" strokeWidth="4" />
        {ticks.map((deg) => (
          <line
            key={deg}
            x1="60"
            y1="8"
            x2="60"
            y2={deg % 90 === 0 ? "16" : "13"}
            stroke="#0f2447"
            strokeWidth={deg % 90 === 0 ? 3 : 1.5}
            transform={`rotate(${deg} 60 60)`}
          />
        ))}
        <line x1="60" y1="60" x2="60" y2="34" stroke="#0f2447" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hrDeg} 60 60)`} />
        <line x1="60" y1="60" x2="60" y2="22" stroke="#0f2447" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minDeg} 60 60)`} />
        <line x1="60" y1="60" x2="60" y2="18" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${secDeg} 60 60)`} />
        <circle cx="60" cy="60" r="4" fill="#0f2447" />
      </svg>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-sm font-black text-slate-900">
        📅 {digital}
      </span>
    </div>
  );
}
