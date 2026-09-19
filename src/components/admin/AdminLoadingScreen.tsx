import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';
import Image from 'next/image';

export function AdminLoadingScreen() {
  const [step, setStep] = React.useState(0);
  const [progress, setProgress] = React.useState(15);

  React.useEffect(() => {
    // Fast simulated animation so it doesn't artificially block but shows progression
    const t1 = setTimeout(() => { setStep(1); setProgress(45); }, 200);
    const t2 = setTimeout(() => { setStep(2); setProgress(80); }, 450);
    const t3 = setTimeout(() => { setProgress(95); }, 700);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const renderStep = (stepIndex: number, text: string) => {
    if (step > stepIndex) {
      // Completed
      return (
        <div className="flex items-center gap-3 px-4 py-2 transition-all duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-sm font-medium text-slate-700">{text}</span>
        </div>
      );
    } else if (step === stepIndex) {
      // Active
      return (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-slate-100 ring-1 ring-slate-900/5 relative overflow-hidden transition-all duration-300 transform scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent w-[200%] animate-[shimmer_2s_infinite] opacity-50" />
          <Loader2 className="w-5 h-5 text-blue-500 shrink-0 animate-spin relative z-10" />
          <span className="text-sm font-semibold text-slate-900 relative z-10">{text}</span>
        </div>
      );
    } else {
      // Pending
      return (
        <div className="flex items-center gap-3 px-4 py-2 opacity-50 transition-all duration-300">
          <Circle className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-500">{text}</span>
        </div>
      );
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8FAFC] to-[#EEF2FF]">
      
      {/* Background Gradient Blobs */}
      <div className="absolute top-[20%] left-[30%] h-[300px] w-[300px] rounded-full bg-emerald-400/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[30%] h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[120px] animate-pulse delay-700" />
      <div className="absolute top-[40%] right-[20%] h-[250px] w-[250px] rounded-full bg-teal-300/20 blur-[80px] animate-pulse delay-500" />

      {/* Subtle Dashboard Skeleton Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="w-full max-w-6xl h-[80vh] border-2 border-slate-900 rounded-3xl flex overflow-hidden">
          {/* Sidebar skeleton */}
          <div className="w-64 border-r-2 border-slate-900 p-6 flex flex-col gap-6">
            <div className="h-8 w-32 bg-slate-900 rounded-lg" />
            <div className="space-y-4 mt-8">
              <div className="h-4 w-full bg-slate-900 rounded" />
              <div className="h-4 w-4/5 bg-slate-900 rounded" />
              <div className="h-4 w-5/6 bg-slate-900 rounded" />
            </div>
          </div>
          {/* Main content skeleton */}
          <div className="flex-1 p-10 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div className="h-10 w-64 bg-slate-900 rounded-xl" />
              <div className="h-10 w-32 bg-slate-900 rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="h-32 bg-slate-900 rounded-2xl" />
              <div className="h-32 bg-slate-900 rounded-2xl" />
              <div className="h-32 bg-slate-900 rounded-2xl" />
            </div>
            <div className="flex-1 bg-slate-900 rounded-3xl" />
          </div>
        </div>
      </div>

      {/* Center Glass Card */}
      <div className="relative z-10 w-full max-w-[480px] rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] p-10 flex flex-col items-center text-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="relative w-8 h-8 flex items-center justify-center animate-pulse">
             <Image src="/image/logo.png" alt="DeshExam Logo" fill className="object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">DeshExam</span>
        </div>

        {/* Circular Gradient Loader */}
        <div className="relative w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full border-[6px] border-slate-100" />
          <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-emerald-400 border-r-blue-500 border-b-blue-400 animate-[spin_1.5s_linear_infinite]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse" />
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-lexend">Securing Admin Workspace</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-[320px] leading-relaxed">
          Validating credentials, permissions, roles, and encrypted session...
        </p>

        {/* Progress Steps */}
        <div className="w-full space-y-3 mb-10 text-left relative min-h-[140px]">
          {renderStep(0, "Authentication verified")}
          {renderStep(1, "Checking admin permissions")}
          {renderStep(2, "Loading dashboard modules")}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full relative overflow-hidden transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[200%] animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
