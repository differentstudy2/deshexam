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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <DeshExamLogo />
      </div>
      
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl"></div>
        <div className="text-center mb-6 mt-2">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Reset Password</h1>
          <p className="text-sm text-slate-500">
            {isSent 
              ? "We've sent a password reset link to your email." 
              : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0040A0] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(0,102,255,0.25)] transition-all disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 mt-6">
            <button
              onClick={() => setIsSent(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all"
            >
              Try another email
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-[#0066FF] hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
