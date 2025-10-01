
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, User as UserIcon, ShieldCheck, Gem, Trophy, Sparkles, BookOpen, ShoppingCart, PlusCircle, LogIn, UserPlus, LayoutGrid, Library, FileText, Settings, BookUser, ClipboardList, Send, Ticket, DollarSign, Users, Book, ToyBrick } from "lucide-react";
import { DeshExamLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "./theme-toggle";
import { getUserProfile } from "@/lib/firebase/firestore";
import { ScrollArea } from "../ui/scroll-area";
import { useAuthDialog } from "@/hooks/use-auth-dialog";

const mainNavLinks = [
    { href: "/features", label: "Features", icon: <Sparkles className="h-5 w-5" /> },
    { href: "/kids-zone", label: "Kids Zone", icon: <ToyBrick className="h-5 w-5" /> },
    { href: "/mock-tests", label: "Mock Tests", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/quizzes", label: "Quizzes", icon: <Gem className="h-5 w-5" /> },
    { href: "/learn", label: "Learn", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/textbook-solutions", label: "Textbook Solutions", icon: <Book className="h-5 w-5" /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="h-5 w-5" /> },
    { href: "/pricing", label: "Pricing", icon: <ShoppingCart className="h-5 w-5" /> },
];

const dashboardNavItems = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutGrid className="h-5 w-5" /> },
  { href: '/dashboard/my-content', label: 'My Content', icon: <Library className="h-5 w-5" /> },
  { href: '/dashboard/all-questions', label: 'All Questions', icon: <ClipboardList className="h-5 w-5" /> },
  { href: '/dashboard/my-results', label: 'My Results', icon: <FileText className="h-5 w-5" /> },
  { href: '/dashboard/profile', label: 'Profile', icon: <BookUser className="h-5 w-5" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutGrid className="h-5 w-5" /> },
    { href: '/admin/content', label: 'Content', icon: <FileText className="h-5 w-5" /> },
    { href: '/admin/textbooks', label: 'Textbooks', icon: <Book className="h-5 w-5" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
    { href: '/admin/reports', label: 'Reports', icon: <ClipboardList className="h-5 w-5" /> },
    { href: '/admin/push-notification', label: 'Push Notification', icon: <Send className="h-5 w-5" />},
    { href: '/admin/coupons', label: 'Coupons', icon: <Ticket className="h-5 w-5" />},
    { href: '/admin/earning', label: 'Earning', icon: <DollarSign className="h-5 w-5" />},
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
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
    <>
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
       <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => openAuthDialog('sign-in')}>
                <UserIcon />
                <span className="sr-only">Sign In</span>
            </Button>
        </div>
    </>
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
        isMobile ? "flex flex-col items-start space-x-0 space-y-4 pt-4" : "hidden md:flex"
      )}
    >
      {mainNavLinks.map((link) => (
        <NavLink key={link.href} {...link} />
      ))}
    </nav>
  );
};

export const AdminSidebar = ({ onLinkClick, logOut }: { onLinkClick?: () => void; logOut: () => void; }) => {
    const pathname = usePathname();
    return (
        <ScrollArea className="h-full">
            <div className="border-b p-4">
                <Link href="/admin" onClick={onLinkClick}>
                    <DeshExamLogo />
                </Link>
            </div>
            <div className="flex flex-col h-[calc(100%-4.5rem)]">
                <ul className="mt-6 space-y-1 p-4 flex-1">
                    {adminNavItems.map((item) => (
                        <li key={item.href}>
                            <Button
                                asChild
                                variant="ghost"
                                className={cn(
                                    "justify-start w-full h-11 px-4 py-2 text-base font-normal rounded-lg transition-colors duration-200",
                                    pathname === item.href ? "bg-primary/20 text-primary font-semibold" : "hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                <Link href={item.href} onClick={onLinkClick}>
                                    {item.icon}
                                    <span className="ml-3">{item.label}</span>
                                </Link>
                            </Button>
                        </li>
                    ))}
                    <li>
                        <Button
                            asChild
                            variant="ghost"
                            className={cn(
                                "justify-start w-full h-11 px-4 py-2 text-base font-normal rounded-lg transition-colors duration-200",
                                "hover:bg-secondary/80"
                            )}
                        >
                            <Link href="/dashboard" onClick={onLinkClick}>
                                <LayoutGrid className="h-5 w-5" />
                                <span className="ml-3">User Dashboard</span>
                            </Link>
                        </Button>
                    </li>
                </ul>
                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start" onClick={logOut}>
                        <LogOut className="mr-3 h-5 w-5"/>
                        Logout
                    </Button>
                </div>
            </div>
        </ScrollArea>
    );
};

export const DashboardSidebar = ({ onLinkClick, user, logOut }: { onLinkClick?: () => void; user: any; logOut: () => void; }) => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <ScrollArea className="h-full">
        <div className="border-b p-4">
            <Link href="/dashboard" onClick={onLinkClick}>
                <DeshExamLogo />
            </Link>
        </div>
        <div className="flex flex-col h-[calc(100%-4.5rem)]">
          <ul className="mt-6 space-y-1 p-4 flex-1">
            {dashboardNavItems.map((item) => (
              <li key={item.href}>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "justify-start w-full h-11 px-4 py-2 text-base font-normal rounded-lg transition-colors duration-200",
                    pathname === item.href
                      ? "bg-primary/20 text-primary font-semibold"
                      : "hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Link href={item.href} onClick={onLinkClick}>
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                </Button>
              </li>
            ))}
            {profile?.role === 'admin' && (
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "justify-start w-full h-11 px-4 py-2 text-base font-normal rounded-lg transition-colors duration-200",
                    "hover:bg-secondary/80"
                  )}
                >
                  <Link href="/admin" onClick={onLinkClick}>
                    <ShieldCheck className="h-5 w-5" />
                    <span className="ml-3">Admin Dashboard</span>
                  </Link>
                </Button>
              </li>
            )}
          </ul>
           <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start" onClick={logOut}>
                    <LogOut className="mr-3 h-5 w-5"/>
                    Logout
                </Button>
            </div>
        </div>
    </ScrollArea>
  );
};


export function Header() {
  const { user, loading, logOut } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const pathname = usePathname();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isDashboardLayout = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto md:mr-6 flex items-center">
            <Link href="/" className="flex items-center">
                <DeshExamLogo />
            </Link>
        </div>
        
        <MainNav />

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <div className="hidden md:flex">
             <UserNav />
          </div>
           
           <div className="md:hidden flex items-center">
            <UserNav />
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0">
                    <SheetHeader className="sr-only">
                       <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    {isDashboardLayout ? (
                        pathname.startsWith('/admin') ? <AdminSidebar logOut={logOut} onLinkClick={() => setIsSheetOpen(false)} /> : <DashboardSidebar user={user} logOut={logOut} onLinkClick={() => setIsSheetOpen(false)} />
                    ) : (
                        <>
                        <div className="flex flex-col h-[calc(100%-4.5rem)]">
                            <ScrollArea className="flex-1 p-4"><MainNav isMobile onLinkClick={() => setIsSheetOpen(false)} /></ScrollArea>
                            <div className="mt-auto border-t p-4">
                            {!loading && !user && (
                                <div className="flex flex-col gap-2">
                                <Button variant="ghost" onClick={() => { openAuthDialog('sign-in'); setIsSheetOpen(false); }}>Sign In</Button>
                                <Button onClick={() => { openAuthDialog('sign-up'); setIsSheetOpen(false); }}>Sign Up</Button>
                                </div>
                            )}
                            </div>
                        </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
           </div>
        </div>
      </div>
    </header>
  );
}
