
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
import { Menu, LogOut, LayoutDashboard, User as UserIcon, ShieldCheck, Gem, Trophy, Sparkles, BookOpen, ShoppingCart, PlusCircle, LogIn, UserPlus, LayoutGrid, Library, FileText, Settings, BookUser, ClipboardList, Send, Ticket, DollarSign, Users, Book, ToyBrick, Award, Activity, Zap, FilePlus, Printer, MessageSquare, Bell, Heart, Bookmark, Gift, Share2, Briefcase, Package, HelpCircle, ChevronRight, ChevronDown, BarChart2, Compass, Upload, Search, GraduationCap } from "lucide-react";
import { DeshExamLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "./theme-toggle";
import { getUserProfile } from "@/lib/firebase/firestore";
import { ScrollArea } from "../ui/scroll-area";
import { useAuthDialog } from "@/hooks/use-auth-dialog";

const mainNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/academy", label: "Academy", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/videos", label: "Videos", icon: <Zap className="h-5 w-5" /> },
    { href: "/documents", label: "Documents", icon: <FileText className="h-5 w-5" /> },
    { href: "/skill", label: "Skill", icon: <Zap className="h-5 w-5" /> },
    { href: "/course", label: "Course", icon: <Book className="h-5 w-5" /> },
    { href: "/book", label: "Book", icon: <Library className="h-5 w-5" /> },
    { href: "/exams", label: "Exams", icon: <Award className="h-5 w-5" /> },
    { href: "/pricing", label: "Pricing", icon: <ShoppingCart className="h-5 w-5" /> },
    { href: "/others", label: "Others", icon: <PlusCircle className="h-5 w-5" /> },
];

const dashboardNavGroups = [
  {
    title: "", // Main group has no title
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: '/dashboard/practice', label: 'Practice', icon: <Award className="h-4 w-4" /> },
      { href: '/dashboard/question-bank', label: 'Question Bank', icon: <Gem className="h-4 w-4" /> },
      { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
      { href: '/dashboard/challenges', label: 'Challenges', icon: <Award className="h-4 w-4" /> },
      { href: '/dashboard/exams', label: 'Exams', icon: <FileText className="h-4 w-4" /> },
      { href: '/dashboard/books', label: 'Books', icon: <Book className="h-4 w-4" /> },
      { href: '/dashboard/profile', label: 'Profile', icon: <BookUser className="h-4 w-4" /> },
    ]
  },
  {
    title: "PROGRESS",
    items: [
      { href: '/dashboard/mistake-vault', label: 'Mistake Vault', icon: <ClipboardList className="h-4 w-4" /> },
      { href: '/dashboard/achievements', label: 'Achievements', icon: <Award className="h-4 w-4" /> },
      { href: '/dashboard/subject-progress', label: 'Subject Progress', icon: <BarChart2 className="h-4 w-4" /> },
      { href: '/dashboard/activity-log', label: 'Activity Log', icon: <Activity className="h-4 w-4" /> },
    ]
  },
  {
    title: "STUDY & RESOURCES",
    items: [
      { href: '/dashboard/courses', label: 'Courses', icon: <BookOpen className="h-4 w-4" /> },
      { href: '/dashboard/skill-development', label: 'Skill Development', icon: <Zap className="h-4 w-4" /> },
      { href: '/dashboard/hand-notes', label: 'Hand Notes', icon: <FileText className="h-4 w-4" /> },
      { href: '/dashboard/question-papers', label: 'Question Papers', icon: <FilePlus className="h-4 w-4" /> },
      { href: '/dashboard/dynamic-print', label: 'Dynamic Print', icon: <Printer className="h-4 w-4" /> },
    ]
  },
  {
    title: "COMMUNITY",
    items: [
      { href: '/dashboard/forum', label: 'Forum', icon: <MessageSquare className="h-4 w-4" /> },
      { href: '/dashboard/blog', label: 'Blog', icon: <FileText className="h-4 w-4" /> },
      { href: '/dashboard/news-notices', label: 'News & Notices', icon: <Bell className="h-4 w-4" /> },
      { href: '/dashboard/my-network', label: 'My Network', icon: <Users className="h-4 w-4" /> },
    ]
  },
  {
    title: "MY SPACE",
    items: [
      { href: '/dashboard/favorites', label: 'Favorites', icon: <Heart className="h-4 w-4" /> },
      { href: '/dashboard/bookmarks', label: 'Bookmarks', icon: <Bookmark className="h-4 w-4" /> },
      { href: '/dashboard/contributions', label: 'Contributions', icon: <Gift className="h-4 w-4" /> },
      { href: '/dashboard/resume-builder', label: 'Resume Builder', icon: <FileText className="h-4 w-4" /> },
      { href: '/dashboard/referrals', label: 'Referrals', icon: <Share2 className="h-4 w-4" /> },
    ]
  },
  {
    title: "OTHERS",
    items: [
      { href: '/dashboard/career-hub', label: 'Career Hub', icon: <Briefcase className="h-4 w-4" /> },
      { href: '/dashboard/partner-hub', label: 'Partner Hub', icon: <Users className="h-4 w-4" /> },
      { href: '/dashboard/e-question-builder', label: 'E-Question Builder', icon: <FilePlus className="h-4 w-4" /> },
      { href: '/dashboard/package-plans', label: 'Package Plans', icon: <Package className="h-4 w-4" /> },
      { href: '/dashboard/faqs', label: 'FAQs', icon: <HelpCircle className="h-4 w-4" /> },
    ]
  }
];

const adminNavGroups = [
  {
    title: "Dashboard",
    items: [
      { href: '/admin', label: 'Overview', icon: <LayoutGrid className="h-4 w-4" /> },
      { href: '/admin/reports', label: 'Reports', icon: <BarChart2 className="h-4 w-4" /> },
      { href: '/admin/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    ]
  },
  {
    title: "Academic Content",
    items: [
      { href: '/admin/guide-content/explorer', label: 'Content Explorer', icon: <Compass className="h-4 w-4" /> },
      { href: '/admin/boards', label: 'Boards', icon: <Library className="h-4 w-4" /> },
      { href: '/admin/classes', label: 'Classes', icon: <Users className="h-4 w-4" /> },
      { href: '/admin/subjects', label: 'Subjects', icon: <Book className="h-4 w-4" /> },
      { href: '/admin/chapters', label: 'Chapters', icon: <FileText className="h-4 w-4" /> },
      { href: '/admin/topics', label: 'Topics', icon: <FileText className="h-4 w-4" /> },
      { href: '/admin/textbooks', label: 'Textbooks', icon: <BookOpen className="h-4 w-4" /> },
      { href: '/admin/guide-content', label: 'Guide Manager', icon: <Compass className="h-4 w-4" /> },
      { href: '/admin/kids-zone/manage', label: 'Kids Zone', icon: <ToyBrick className="h-4 w-4" /> },
    ]
  },
  {
    title: "Assessment Center",
    items: [
      { href: '/admin/question-bank/questions', label: 'Question Bank', icon: <ClipboardList className="h-4 w-4" /> },
      { href: '/admin/question-bank/categories', label: 'Categories', icon: <BookOpen className="h-4 w-4" /> },
      { href: '/admin/exam-taxonomy', label: 'Exam Taxonomy', icon: <Library className="h-4 w-4" /> },
      { href: '/admin/assessment-center/practice-sets', label: 'Practice Sets', icon: <Activity className="h-4 w-4" /> },
      { href: '/admin/assessment-center/quizzes', label: 'Quizzes', icon: <Sparkles className="h-4 w-4" /> },
      { href: '/admin/assessment-center/mock-tests', label: 'Mock Tests', icon: <FileText className="h-4 w-4" /> },
      { href: '/admin/assessment-center/exams', label: 'Exams & Papers', icon: <Award className="h-4 w-4" /> },
      { href: '/admin/assessment-center/daily-challenges', label: 'Daily Challenges', icon: <Trophy className="h-4 w-4" /> },
      { href: '/admin/question-bank/import', label: 'Bulk Import', icon: <Upload className="h-4 w-4" /> },
    ]
  },
  {
    title: "Student Portal",
    items: [
      { href: '/dashboard/student', label: 'Students', icon: <Users className="h-4 w-4" /> },
      { href: '/dashboard/student-dashboard', label: 'Student Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: '/admin/progress-reports', label: 'Progress Reports', icon: <BarChart2 className="h-4 w-4" /> },
      { href: '/admin/analytics', label: 'Analytics', icon: <Activity className="h-4 w-4" /> },
      { href: '/admin/leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
    ]
  },
  {
    title: "User Management",
    items: [
      { href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
      { href: '/admin/roles', label: 'Roles', icon: <ShieldCheck className="h-4 w-4" /> },
      { href: '/admin/permissions', label: 'Permissions', icon: <ShieldCheck className="h-4 w-4" /> },
      { href: '/admin/admins', label: 'Admins', icon: <UserIcon className="h-4 w-4" /> },
    ]
  },
  {
    title: "Monetization",
    items: [
      { href: '/admin/earning', label: 'Earnings', icon: <DollarSign className="h-4 w-4" /> },
      { href: '/admin/coupons', label: 'Coupons', icon: <Ticket className="h-4 w-4" /> },
      { href: '/admin/plans', label: 'Plans', icon: <Package className="h-4 w-4" /> },
      { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
      { href: '/admin/transactions', label: 'Transactions', icon: <Activity className="h-4 w-4" /> },
    ]
  },
  {
    title: "Communication",
    items: [
      { href: '/admin/push-notification', label: 'Push Notifications', icon: <Send className="h-4 w-4" /> },
      { href: '/admin/broadcast-messages', label: 'Broadcast Messages', icon: <MessageSquare className="h-4 w-4" /> },
      { href: '/admin/templates', label: 'Templates', icon: <FileText className="h-4 w-4" /> },
    ]
  },
  {
    title: "AI Tools",
    items: [
      { href: '/admin/ai-question-generator', label: 'Question Generator', icon: <Sparkles className="h-4 w-4" /> },
      { href: '/admin/ai-quiz-generator', label: 'Quiz Generator', icon: <Sparkles className="h-4 w-4" /> },
      { href: '/admin/ai-seo-assistant', label: 'SEO Assistant', icon: <Search className="h-4 w-4" /> },
      { href: '/admin/ai-video-generator', label: 'Video Generator', icon: <Zap className="h-4 w-4" /> },
    ]
  },
  {
    title: "Settings",
    items: [
      { href: '/admin/settings', label: 'General', icon: <Settings className="h-4 w-4" /> },
      { href: '/admin/settings/branding', label: 'Branding', icon: <Sparkles className="h-4 w-4" /> },
      { href: '/admin/settings/theme', label: 'Theme', icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: '/admin/settings/security', label: 'Security', icon: <ShieldCheck className="h-4 w-4" /> },
      { href: '/admin/settings/backup', label: 'Backup', icon: <Upload className="h-4 w-4" /> },
    ]
  }
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

const MainNav = ({ isMobile = false, onLinkClick, isScrolled = false }: { isMobile?: boolean, onLinkClick?: () => void, isScrolled?: boolean }) => {
  const pathname = usePathname();
  const NavLink = ({ href, label, icon }: { href: string; label: string, icon?: React.ReactNode }) => (
    <Link
      href={href}
      onClick={onLinkClick}
      className={cn(
        "transition-colors flex items-center gap-4 nav-link-style hover:text-[#00a651]",
        pathname === href 
            ? "text-[#00a651] font-bold" 
            : "text-slate-600 hover:text-slate-900",
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
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        adminNavGroups.forEach(g => { if(g.title) initialState[g.title] = true });
        return initialState;
    });

    const toggleGroup = (title: string) => {
        setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/95 text-slate-800 dark:text-slate-300 border-r border-slate-200/60 dark:border-slate-800/60">
            <div className="p-4 flex items-center h-16 shrink-0 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950">
                <Link href="/admin" onClick={onLinkClick} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-slate-900 dark:text-white font-medium text-lg tracking-tight">DeshExam Admin</div>
                </Link>
            </div>
            <ScrollArea className="flex-1 bg-slate-50 dark:bg-slate-900">
                <div className="space-y-4 px-3 py-4">
                    {adminNavGroups.map((group, idx) => {
                        const isOpen = openGroups[group.title];
                        return (
                        <div key={idx} className="space-y-1">
                            <button 
                                onClick={() => toggleGroup(group.title)}
                                className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors uppercase tracking-wider"
                            >
                                <span>{group.title}</span>
                                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                            {isOpen && (
                            <ul className="space-y-0.5 mt-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                                    return (
                                        <li key={item.href}>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className={cn(
                                                    "justify-start w-full h-9 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                                                    isActive 
                                                        ? "bg-green-600 text-white dark:bg-green-700 dark:text-white font-medium shadow-sm hover:bg-green-700 hover:text-white" 
                                                        : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
                                                )}
                                            >
                                                <Link href={item.href} onClick={onLinkClick}>
                                                    <span className={cn("transition-colors", isActive ? "text-white" : "text-slate-400 dark:text-slate-500")}>{item.icon}</span>
                                                    <span className="ml-3">{item.label}</span>
                                                </Link>
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                            )}
                        </div>
                    )})}
                    
                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/60 space-y-2 px-1">
                        <Button
                            asChild
                            variant="ghost"
                            className="justify-start w-full h-9 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200"
                        >
                            <Link href="/dashboard" onClick={onLinkClick}>
                                <LayoutGrid className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                <span className="ml-3">Exit Admin</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shrink-0">
                <Button variant="ghost" className="w-full justify-start text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200 h-9 px-3" onClick={logOut}>
                    <LogOut className="mr-3 h-4 w-4"/>
                    Logout
                </Button>
            </div>
        </div>
    );
};

export const DashboardSidebar = ({ onLinkClick, user, logOut }: { onLinkClick?: () => void; user: any; logOut: () => void; }) => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    dashboardNavGroups.forEach(g => { if(g.title) initialState[g.title] = true });
    return initialState;
  });

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
    <div className="flex flex-col h-full bg-white text-slate-800 border-r border-slate-200">
        <div className="p-4 flex items-center h-16 shrink-0 border-b border-slate-100">
            <Link href="/dashboard" onClick={onLinkClick} className="flex items-center gap-2">
                <div className="font-extrabold text-2xl tracking-tighter flex items-center">
                    <span className="text-green-600">DESH </span>
                    <span className="text-slate-800 ml-1">EXAM</span>
                </div>
            </Link>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-4 py-4">
            {dashboardNavGroups.map((group, idx) => {
              const isOpen = !group.title || openGroups[group.title];
              return (
              <div key={idx} className="space-y-1">
                {group.title && (
                    <div 
                      className="flex justify-between items-center px-4 mb-2 cursor-pointer group"
                      onClick={() => setOpenGroups(prev => ({...prev, [group.title]: !prev[group.title]}))}
                    >
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{group.title}</h4>
                      {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />}
                    </div>
                )}
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <ul className="space-y-0.5 px-2">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            "justify-start w-full h-9 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200",
                            pathname === item.href
                              ? "bg-slate-100 text-slate-900 font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <Link href={item.href} onClick={onLinkClick}>
                            <span className={pathname === item.href ? "text-green-600" : "text-slate-400"}>{item.icon}</span>
                            <span className="ml-3">{item.label}</span>
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )})}
            
            {profile?.role === 'admin' && (
              <div className="px-2 pt-4">
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "justify-start w-full h-9 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200",
                    "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Link href="/admin" onClick={onLinkClick}>
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <span className="ml-3">Admin Dashboard</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-slate-100 space-y-3 shrink-0">
             <Button variant="outline" className="w-full justify-between rounded-full bg-white shadow-sm border-slate-200 text-slate-700 h-10" asChild>
                 <Link href="/pricing">
                    Upgrade Plan <ChevronRight className="h-4 w-4 text-slate-400" />
                 </Link>
             </Button>
             
             <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                        <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 leading-tight">{user?.displayName || "User"}</span>
                        <span className="text-[10px] text-slate-500 leading-tight mt-0.5">Free Plan</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={logOut}>
                    <LogOut className="h-4 w-4"/>
                </Button>
             </div>
          </div>
    </div>
  );
};


export function Header() {
  const { user, loading, logOut } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const pathname = usePathname();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboardLayout = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm text-slate-800" 
          : "bg-transparent border-transparent text-slate-800"
      )}
    >
      <div className="container flex h-16 items-center">
        <div className="mr-auto md:mr-6 flex items-center">
            <Link href="/" className="flex items-center">
                <DeshExamLogo />
            </Link>
        </div>
        
        <MainNav isScrolled={isScrolled} />

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
