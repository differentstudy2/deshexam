"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { DeshExamLogo } from "@/components/icons";
import { Checkbox } from "../ui/checkbox";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Schemas
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Confirm your password." }),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.303-7.524l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.914,34.062,44,28.868,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

// Custom Glassmorphic Input
const GlassInput = React.forwardRef<HTMLInputElement, any>(
  ({ className, icon: Icon, type, label, inputClassName, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    
    return (
      <div className={cn("relative flex items-center w-full border border-white/70 bg-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur-md px-4 transition-all focus-within:border-blue-400 focus-within:bg-white/70 focus-within:shadow-md", label ? "rounded-2xl py-2" : "rounded-full py-3", className)}>
        {Icon && <Icon className={cn("text-gray-500 shrink-0", label ? "h-5 w-5 mr-3" : "h-[18px] w-[18px] mr-2.5")} />}
        <div className="flex flex-col w-full justify-center">
          {label && <span className="text-[11px] font-semibold text-gray-500 mb-0.5">{label}</span>}
          <input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            className={cn("w-full bg-transparent border-0 p-0 text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0", inputClassName)}
            ref={ref}
            {...props}
          />
        </div>
        {isPassword && (
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    );
  }
);
GlassInput.displayName = "GlassInput";


// Sign In Form Component
const SignInForm = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const { closeAuthDialog, switchVariant } = useAuthDialog();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<SignInValues> = async (data) => {
    try {
      await signIn(data.email, data.password);
      toast({ title: "Signed In", description: "Welcome back!" });
      closeAuthDialog();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign In Failed", description: error.message });
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({ title: "Signed In", description: "Welcome!" });
      closeAuthDialog();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign In Failed", description: error.message });
    }
  };

  return (
    <div className="px-8 pb-8 pt-2">
      <div className="text-center mb-7">
        <h2 className="text-[28px] font-extrabold text-[#111827] tracking-tight mb-2">Welcome Back</h2>
        <p className="text-[#6B7280] text-[15px]">Sign in to continue your learning journey</p>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-4 rounded-full border border-gray-100 shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all mb-7"
      >
        <GoogleIcon className="h-5 w-5" />
        Continue with Google
      </button>

      <div className="relative flex items-center justify-center mb-7">
        <div className="border-t border-gray-300 w-full absolute"></div>
        <span className="bg-transparent px-3 text-[13px] text-gray-500 relative z-10" style={{ backdropFilter: "blur(8px)" }}>or sign in with email</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <GlassInput
                    icon={Mail}
                    label="Email Address"
                    placeholder="johndoe@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="ml-2 text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <GlassInput
                    icon={Lock}
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="ml-2 text-xs" />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-1 pb-4">
            <Link href="/forgot-password" onClick={closeAuthDialog} className="text-[#0066FF] text-[14px] font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0040A0] text-white font-bold py-3.5 px-4 rounded-full shadow-[0_8px_20px_rgba(0,102,255,0.3)] transition-all disabled:opacity-70"
          >
            {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </Form>

      <div className="mt-8 text-center text-[15px] text-gray-600">
        Don&apos;t have an account?{" "}
        <button onClick={switchVariant} className="text-[#0066FF] font-semibold hover:underline">
          Sign Up
        </button>
      </div>
    </div>
  );
}


// Sign Up Form Component
const SignUpForm = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const { closeAuthDialog, switchVariant } = useAuthDialog();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", terms: false },
  });

  const onSubmit: SubmitHandler<SignUpValues> = async (data) => {
    try {
      await signUp(data.email, data.password);
      toast({ title: "Account Created", description: "You have successfully created an account." });
      closeAuthDialog();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign Up Failed", description: error.message });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({ title: "Signed In", description: "Welcome!" });
      closeAuthDialog();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign Up Failed", description: error.message });
    }
  };

  return (
    <div className="px-8 pb-8 pt-2">
      <div className="text-center mb-6">
        <h2 className="text-[28px] font-extrabold text-[#111827] tracking-tight mb-2">Create Account</h2>
        <p className="text-[#6B7280] text-[15px]">Join DeshExam and start learning</p>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-4 rounded-full border border-gray-100 shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all mb-6"
      >
        <GoogleIcon className="h-5 w-5" />
        Continue with Google
      </button>

      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-gray-300 w-full absolute"></div>
        <span className="bg-transparent px-3 text-[12px] text-gray-500 font-medium uppercase tracking-wider relative z-10" style={{ backdropFilter: "blur(8px)" }}>or sign up with</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <GlassInput icon={User} placeholder="Full Name" inputClassName="placeholder:font-medium placeholder:text-gray-400 text-[14px]" {...field} />
                  </FormControl>
                  <FormMessage className="ml-2 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <GlassInput icon={Mail} placeholder="Email / Phone" inputClassName="placeholder:font-medium placeholder:text-gray-400 text-[14px]" {...field} />
                  </FormControl>
                  <FormMessage className="ml-2 text-xs" />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <GlassInput icon={Lock} type="password" placeholder="Password" inputClassName="placeholder:font-medium placeholder:text-gray-400 text-[14px]" {...field} />
                  </FormControl>
                  <FormMessage className="ml-2 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <GlassInput icon={Lock} type="password" placeholder="Confirm Password" inputClassName="placeholder:font-medium placeholder:text-gray-400 text-[14px]" {...field} />
                  </FormControl>
                  <FormMessage className="ml-2 text-xs" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0 py-2 ml-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="rounded-[4px] border-gray-400 data-[state=checked]:bg-[#0084FF] data-[state=checked]:border-[#0084FF]" />
                </FormControl>
                <div className="leading-none">
                  <FormLabel className="text-[13.5px] font-medium text-gray-700">
                    I agree Terms & Privacy Policy
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full mt-2 bg-gradient-to-r from-[#007CF0] to-[#0060D0] hover:from-[#0060D0] hover:to-[#004AAB] text-white font-bold py-3.5 px-4 rounded-[18px] shadow-[0_6px_20px_rgba(0,132,255,0.3)] transition-all disabled:opacity-70"
          >
            {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </Form>

      <div className="mt-6 text-center text-[15px] text-gray-600">
        Already have an account?{" "}
        <button onClick={switchVariant} className="text-[#0066FF] font-semibold hover:underline">
          Login
        </button>
      </div>
    </div>
  );
}


// Main Auth Dialog
export function AuthDialog() {
  const { isOpen, variant, closeAuthDialog } = useAuthDialog();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthDialog()}>
      <DialogContent 
        className="p-0 border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden max-w-[480px] bg-gradient-to-br from-[#f8fafc]/90 to-[#e2e8f0]/90 backdrop-blur-xl rounded-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Decorative background blurs for glassmorphism effect */}
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-300/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-300/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-[30%] right-[10%] w-[150px] h-[150px] bg-amber-200/20 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 pt-10 pb-4 px-4 text-center">
             <div className="mb-2 inline-block">
                <DeshExamLogo />
            </div>
        </div>
        
        <div className="relative z-10">
          {variant === 'sign-in' ? <SignInForm /> : <SignUpForm />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
