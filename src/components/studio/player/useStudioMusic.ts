import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Gentle ambient pad made with Web Audio — no audio file needed.
 * A soft C-major-add9 chord with a slow breathing LFO. The toggle
 * creates the AudioContext on first use (browsers require a gesture).
 */
export function useStudioMusic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    gain: GainNode;
    oscs: OscillatorNode[];
    lfos: OscillatorNode[];
  } | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    const n = nodesRef.current;
    const ctx = ctxRef.current;
    if (n && ctx) {
      try {
        n.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      } catch {
        /* ignore */
      }
      const oscs = [...n.oscs, ...n.lfos];
      setTimeout(() => oscs.forEach((o) => { try { o.stop(); } catch { /* ignore */ } }), 600);
      nodesRef.current = null;
    }
    setPlaying(false);
  }, []);

  const start = useCallback(() => {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      let ctx = ctxRef.current;
      if (!ctx) {
        ctx = new Ctor();
        ctxRef.current = ctx;
      }
      if (ctx.state === "suspended") void ctx.resume();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      const freqs = [130.81, 164.81, 196.0, 293.66];
      const oscs: OscillatorNode[] = [];
      const lfos: OscillatorNode[] = [];
      freqs.forEach((f, i) => {
        const o = ctx!.createOscillator();
        o.type = i < 2 ? "sine" : "triangle";
        o.frequency.value = f;
        const og = ctx!.createGain();
        og.gain.value = 0.25;
        const lfo = ctx!.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.02;
        const lfoGain = ctx!.createGain();
        lfoGain.gain.value = 0.08;
        lfo.connect(lfoGain);
        lfoGain.connect(og.gain);
        o.connect(og);
        og.connect(gain);
        o.start();
        lfo.start();
        oscs.push(o);
        lfos.push(lfo);
      });
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2);
      nodesRef.current = { gain, oscs, lfos };
      setPlaying(true);
    } catch {
      /* Audio unavailable on this device — toggle stays off. */
    }
  }, []);

  const toggle = useCallback(
    () => (playing ? stop() : start()),
    [playing, start, stop],
  );

  useEffect(
    () => () => {
      try {
        nodesRef.current?.oscs.forEach((o) => o.stop());
        nodesRef.current?.lfos.forEach((o) => o.stop());
      } catch {
        /* ignore */
      }
    },
    [],
  );

  return { playing, toggle };
}
