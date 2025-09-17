"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { DeshExamLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

const navLinks = [
  { href: "/mock-tests", label: "Mock Tests" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/pricing", label: "Pricing" },
];

const UserNav = () => {
  const { user, loading, logOut } = useAuth();

  if (loading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (user) {
    return (
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
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile">
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
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    </div>
  );
};

const MainNav = ({ isMobile = false }: { isMobile?: boolean }) => {
  const pathname = usePathname();
  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-primary",
        pathname === href ? "text-primary font-medium" : "text-muted-foreground",
        isMobile && "text-lg py-2"
      )}
    >
      {label}
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
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <DeshExamLogo />
        </Link>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                  <Link href="/" className="flex items-center space-x-2">
                    <DeshExamLogo />
                  </Link>
                </div>
                <MainNav isMobile />
                <div className="mt-auto border-t pt-4">
                  {!loading && !user && (
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" asChild>
                        <Link href="/sign-in">Sign In</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/sign-up">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                  {!loading && user && (
                     <Button onClick={logOut} className="w-full">Log Out</Button>
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