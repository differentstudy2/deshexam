"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  
  const { confirmPasswordReset } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode) {
      toast({ variant: "destructive", title: "Invalid Link", description: "The password reset link is invalid or has expired." });
      return;
    }

    if (password.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 6 characters." });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(oobCode, password);
      setIsSuccess(true);
      toast({ title: "Success", description: "Your password has been successfully reset." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message || "Failed to reset password. The link might be expired." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative background blurs */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-300/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-300/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[150px] h-[150px] bg-amber-200/20 rounded-full blur-[60px] pointer-events-none" />

      <div className="w-full max-w-[400px] relative mt-12">
        {/* Floating Logo Circle */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-full w-20 h-20 p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/60 flex items-center justify-center pointer-events-auto">
                 <img src="/icons/icon-192x192.png" alt="DeshExam Icon" className="w-full h-full object-contain" />
            </div>
        </div>
      
        <div className="relative z-10 bg-gradient-to-br from-[#f8fafc]/90 to-[#e2e8f0]/90 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-2xl p-8 pt-12">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">New Password</h1>
            <p className="text-[13px] text-slate-500">
              {isSuccess 
                ? "Your password has been successfully changed." 
                : "Create a new strong password for your account."}
            </p>
          </div>

          {!oobCode && !isSuccess ? (
            <div className="text-center space-y-4">
               <p className="text-red-500 text-sm font-medium p-4 bg-red-50/80 rounded-2xl border border-red-100">
                  This reset link is invalid or has expired. Please request a new password reset link.
               </p>
               <Link href="/forgot-password" className="block w-full bg-white/70 hover:bg-white border border-white/60 text-slate-700 font-bold py-3.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all">
                 Request New Link
               </Link>
            </div>
          ) : !isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative flex items-center w-full border border-white/70 bg-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur-md px-4 rounded-full py-3 transition-all focus-within:border-blue-400 focus-within:bg-white/70 focus-within:shadow-md">
                <Lock className="h-[18px] w-[18px] mr-2.5 text-gray-500 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full bg-transparent border-0 p-0 text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none shrink-0">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative flex items-center w-full border border-white/70 bg-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur-md px-4 rounded-full py-3 transition-all focus-within:border-blue-400 focus-within:bg-white/70 focus-within:shadow-md">
                <Lock className="h-[18px] w-[18px] mr-2.5 text-gray-500 shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full bg-transparent border-0 p-0 text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none shrink-0">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0040A0] text-white font-bold py-3.5 rounded-full shadow-[0_4px_14px_rgba(0,102,255,0.25)] transition-all disabled:opacity-70"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ) : (
            <div className="space-y-4 mt-6">
              <Link
                href="/sign-in"
                className="flex items-center justify-center w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0040A0] text-white font-bold py-3.5 rounded-full shadow-[0_4px_14px_rgba(0,102,255,0.25)] transition-all"
              >
                Go to Login <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
