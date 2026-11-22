/**
 * Screenshot — renders the current question card to a PNG and downloads
 * it. Pure canvas, no extra dependency. Bengali text renders with the
 * device's own Bengali font.
 */

interface ShotOption {
  letter: string;
  text: string;
  correct: boolean;
  picked: boolean;
}

function wrapText(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(/\s+/);
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (c.measureText(test).width > maxWidth && line) {
      c.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) c.fillText(line, x, cy);
  return cy + lineHeight;
}

export function downloadQuestionShot(opts: {
  testTitle: string;
  questionNo: number;
  total: number;
  questionText: string;
  options: ShotOption[];
  revealed: boolean;
}) {
  if (typeof document === "undefined") return;
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d");
  if (!c) return;

  const grad = c.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0a2257");
  grad.addColorStop(1, "#071535");
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);
  c.fillStyle = "#fbbf24";
  c.fillRect(0, 0, W, 12);

  c.fillStyle = "#fbbf24";
  c.font = "900 40px sans-serif";
  c.fillText("DeshExam", 64, 92);
  c.fillStyle = "#ffffff";
  c.font = "700 30px sans-serif";
  c.fillText(`প্রশ্ন ${opts.questionNo} / ${opts.total} — ${opts.testTitle}`, 64, 140);

  c.fillStyle = "#ffffff";
  c.font = "900 44px sans-serif";
  let y = wrapText(c, opts.questionText || "", 64, 230, W - 128, 62);

  y += 30;
  for (const opt of opts.options) {
    const boxY = y;
    const boxH = 96;
    if (opts.revealed && opt.correct) c.fillStyle = "#dcfce7";
    else if (opts.revealed && opt.picked) c.fillStyle = "#fee2e2";
    else c.fillStyle = "#ffffff";
    c.beginPath();
    c.roundRect(64, boxY, W - 128, boxH, 20);
    c.fill();
    c.fillStyle =
      opts.revealed && opt.correct
        ? "#16a34a"
        : opts.revealed && opt.picked
          ? "#dc2626"
          : "#0f2447";
    c.beginPath();
    c.arc(120, boxY + boxH / 2, 30, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#ffffff";
    c.font = "900 30px sans-serif";
    c.textAlign = "center";
    c.fillText(opt.letter, 120, boxY + boxH / 2 + 11);
    c.textAlign = "left";
    c.fillStyle = "#0f172a";
    c.font = "700 32px sans-serif";
    const textY = wrapText(c, opt.text, 170, boxY + 42, W - 260, 40);
    y = Math.max(boxY + boxH, textY) + 22;
  }

  c.fillStyle = "#94a3b8";
  c.font = "600 26px sans-serif";
  c.fillText("deshexam.vercel.app", 64, H - 56);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DeshExam_Q${opts.questionNo}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }, "image/png");
}
