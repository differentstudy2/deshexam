
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { DeshExamLogo } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "../ui/card";

// Schemas
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signUpSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;


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
    <CardContent>
      <DialogHeader className="text-center mb-4">
        <DialogTitle className="text-2xl font-headline">Welcome Back</DialogTitle>
        <DialogDescription>
          Enter your email below to login to your account
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input placeholder="m@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Logging In..." : "Login"}
          </Button>
          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
            Login with Google
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <button onClick={switchVariant} className="underline">
          Sign up
        </button>
      </div>
    </CardContent>
  );
}


// Sign Up Form Component
const SignUpForm = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const { closeAuthDialog, switchVariant } = useAuthDialog();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
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
    <CardContent>
      <DialogHeader className="text-center mb-4">
        <DialogTitle className="text-2xl font-headline">Create an Account</DialogTitle>
        <DialogDescription>
          Enter your information to create an account
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem> <FormLabel>First name</FormLabel> <FormControl><Input placeholder="Max" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem> <FormLabel>Last name</FormLabel> <FormControl><Input placeholder="Robinson" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
          </div>
          <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input placeholder="m@example.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
          <FormField control={form.control} name="password" render={({ field }) => ( <FormItem> <FormLabel>Password</FormLabel> <FormControl><Input type="password" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating Account..." : "Create an account"}
          </Button>
          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
            Sign up with Google
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <button onClick={switchVariant} className="underline">
          Sign in
        </button>
      </div>
    </CardContent>
  );
}


// Main Auth Dialog
export function AuthDialog() {
  const { isOpen, variant, closeAuthDialog, switchVariant } = useAuthDialog();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthDialog()}>
      <DialogContent className="p-0 border-0 max-w-md">
        <div className="pt-8 pb-4 px-4 text-center">
             <div className="mb-4 inline-block">
                <DeshExamLogo />
            </div>
        </div>
        {variant === 'sign-in' ? <SignInForm /> : <SignUpForm />}
      </DialogContent>
    </Dialog>
  );
}
