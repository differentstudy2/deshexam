"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DeshExamLogo } from "@/components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ variant: "destructive", title: "Error", description: "Please enter your email address." });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSent(true);
      toast({ title: "Email Sent", description: "Check your inbox for the password reset link." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message || "Failed to send reset email." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative transition-colors duration-300">
      {/* Decorative background blurs */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[150px] h-[150px] bg-amber-200/20 dark:bg-amber-600/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="w-full max-w-[400px] relative mt-12">
        {/* Floating Logo Circle */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full w-20 h-20 p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/60 dark:border-slate-700 flex items-center justify-center pointer-events-auto transition-colors duration-300">
                 <img src="/icons/icon-192x192.png" alt="DeshExam Icon" className="w-full h-full object-contain" />
            </div>
        </div>
      
        <div className="relative z-10 bg-gradient-to-br from-[#f8fafc]/90 to-[#e2e8f0]/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-xl border border-white/60 dark:border-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-2xl p-8 pt-12 transition-colors duration-300">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors duration-300">Reset Password</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 transition-colors duration-300">
            {isSent 
              ? "We've sent a password reset link to your email." 
              : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative flex items-center w-full border border-white/70 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur-md px-4 rounded-full py-3 transition-all focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:bg-white/70 dark:focus-within:bg-slate-800/80 focus-within:shadow-md">
              <Mail className="h-[18px] w-[18px] mr-2.5 text-gray-500 dark:text-slate-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-transparent border-0 p-0 text-[15px] text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0040A0] text-white font-bold py-3.5 rounded-full shadow-[0_4px_14px_rgba(0,102,255,0.25)] transition-all disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 mt-6">
            <button
              onClick={() => setIsSent(false)}
              className="w-full bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all"
            >
              Try another email
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-[#0066FF] dark:text-blue-400 hover:underline transition-colors duration-300">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
