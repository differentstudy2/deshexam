
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, User as UserIcon, ShieldCheck, Gem, Trophy, Sparkles, BookOpen, ShoppingCart, PlusCircle, LogIn, UserPlus } from "lucide-react";
import { DeshExamLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "./theme-toggle";
import { getUserProfile } from "@/lib/firebase/firestore";
import { ScrollArea } from "../ui/scroll-area";
import { useAuthDialog } from "@/hooks/use-auth-dialog";

const navLinks = [
    { href: "/features", label: "Features", icon: <Sparkles className="h-5 w-5" /> },
    { href: "/mock-tests", label: "Mock Tests", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/quizzes", label: "Quizzes", icon: <Gem className="h-5 w-5" /> },
    { href: "/learn", label: "Learn", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="h-5 w-5" /> },
    { href: "/pricing", label: "Pricing", icon: <ShoppingCart className="h-5 w-5" /> },
];

type UserProfile = {
  role?: 'admin' | 'user';
};

const UserNav = () => {
  const { user, loading, logOut } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
         {profile?.role === 'admin' && (
            <Button asChild size="icon" className="hidden md:flex">
              <Link href="/admin/add-content">
                <PlusCircle className="h-5 w-5" />
                <span className="sr-only">Add Content</span>
              </Link>
            </Button>
          )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} alt={user.displayName || "User Avatar"} data-ai-hint="person face" />
                <AvatarFallback>{user.email?.[0].toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || "Test User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profile?.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2">
      <Button variant="ghost" onClick={() => openAuthDialog('sign-in')}>
        <LogIn />
        Sign In
      </Button>
      <Button onClick={() => openAuthDialog('sign-up')}>
        <UserPlus />
        Sign Up
      </Button>
    </div>
  );
};

const MainNav = ({ isMobile = false, onLinkClick }: { isMobile?: boolean, onLinkClick?: () => void }) => {
  const pathname = usePathname();
  const NavLink = ({ href, label, icon }: { href: string; label: string, icon?: React.ReactNode }) => (
    <Link
      href={href}
      onClick={onLinkClick}
      className={cn(
        "transition-colors hover:text-primary flex items-center gap-4 nav-link-style",
        pathname === href ? "text-primary font-bold" : "text-muted-foreground",
        isMobile && "text-lg py-2"
      )}
    >
      {isMobile && icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <nav
      className={cn(
        "items-center space-x-4 lg:space-x-6",
        isMobile ? "flex flex-col space-x-0 space-y-4 pt-4" : "hidden md:flex"
      )}
    >
      {navLinks.map((link) => (
        <NavLink key={link.href} {...link} />
      ))}
    </nav>
  );
};

export function Header() {
  const { user, loading, logOut } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <DeshExamLogo />
        </Link>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <UserNav />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
               <SheetHeader className="border-b p-4">
                 <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                 <Link href="/" onClick={() => setIsSheetOpen(false)} className="flex items-center space-x-2">
                   <DeshExamLogo />
                 </Link>
               </SheetHeader>
              <div className="flex flex-col h-[calc(100%-4.5rem)]">
                <ScrollArea className="flex-1 p-4">
                    <MainNav isMobile onLinkClick={() => setIsSheetOpen(false)} />
                </ScrollArea>
                <div className="mt-auto border-t p-4">
                  {!loading && !user && (
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" onClick={() => { openAuthDialog('sign-in'); setIsSheetOpen(false); }}>Sign In</Button>
                      <Button onClick={() => { openAuthDialog('sign-up'); setIsSheetOpen(false); }}>Sign Up</Button>
                    </div>
                  )}
                  {!loading && user && (
                     <Button onClick={() => { logOut(); setIsSheetOpen(false); }} className="w-full">Log Out</Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
