
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
import { Menu, LogOut, LayoutDashboard, User as UserIcon, ShieldCheck, Gem, Trophy, Sparkles, BookOpen, ShoppingCart, PlusCircle, LogIn, UserPlus, LayoutGrid, Library, FileText, Settings, BookUser, ClipboardList, Send, Ticket, DollarSign, Users, Book, ToyBrick, Award, Activity, Zap, FilePlus, Printer, MessageSquare, Bell, Heart, Bookmark, Gift, Share2, Briefcase, Package, HelpCircle, ChevronRight, ChevronDown, BarChart2, Compass, Upload, Search, GraduationCap, School, Play, Headphones, Trash2 } from "lucide-react";
import { DeshExamLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "./theme-toggle";
import { getUserProfile } from "@/lib/firebase/firestore";
import { ScrollArea } from "../ui/scroll-area";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { useFcm } from "@/hooks/use-fcm";

import { useToast } from "@/hooks/use-toast";
import { clearAllCache } from "@/lib/actions/cache";

const mainNavLinks = [
    { href: "/academy", label: "Academy", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/videos", label: "Videos", icon: <Zap className="h-5 w-5" /> },
    { href: "/audios", label: "Audios", icon: <Headphones className="h-5 w-5" /> },
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
      { href: '/dashboard/my-papers', label: 'My Saved Papers', icon: <FilePlus className="h-4 w-4" /> },
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
      { href: '/admin/todo', label: 'Todo List', icon: <ClipboardList className="h-4 w-4" /> },
      { href: '/admin/reports', label: 'Reports', icon: <BarChart2 className="h-4 w-4" /> },
      { href: '/admin/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    ]
  },
  {
    title: "Academic Content",
    items: [
      { href: '/admin/video', label: 'Videos', icon: <Play className="h-4 w-4" /> },
      { href: '/admin/audio', label: 'Audio', icon: <Headphones className="h-4 w-4" /> },
      { href: '/admin/documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
      { href: '/admin/guide-content/explorer', label: 'Content Explorer', icon: <Compass className="h-4 w-4" /> },
      { href: '/admin/institution', label: 'Institutions', icon: <School className="h-4 w-4" /> },
      { href: '/admin/boards', label: 'Boards', icon: <Library className="h-4 w-4" /> },
      { href: '/admin/classes', label: 'Classes', icon: <Users className="h-4 w-4" /> },
      { href: '/admin/textbook', label: 'Textbook Data', icon: <BookOpen className="h-4 w-4" /> },
      { href: '/admin/subjects', label: 'Subjects', icon: <Book className="h-4 w-4" /> },
      { href: '/admin/chapters', label: 'Chapters', icon: <FileText className="h-4 w-4" /> },
      { href: '/admin/topics', label: 'Topics', icon: <FileText className="h-4 w-4" /> },
      { href: '/admin/textbooks', label: 'Textbooks (Manager)', icon: <BookOpen className="h-4 w-4" /> },
      { href: '/admin/guide-content', label: 'Guide Manager', icon: <Compass className="h-4 w-4" /> },
      { href: '/admin/kids-zone/manage', label: 'Kids Zone', icon: <ToyBrick className="h-4 w-4" /> },
      { href: '/admin/guide', label: 'Guides', icon: <Compass className="h-4 w-4" /> },
      { href: '/admin/content', label: 'Content Manager', icon: <FileText className="h-4 w-4" /> },
    ]
  },
  {
    title: "Blog & Updates",
    items: [
      { href: '/admin/blog', label: 'Blog Posts', icon: <FileText className="h-4 w-4" /> },
      { href: '/admin/job', label: 'Job Circulars', icon: <Briefcase className="h-4 w-4" /> },
      { href: '/admin/news', label: 'News & Notices', icon: <Bell className="h-4 w-4" /> },
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
      { href: '/admin/questions', label: 'Questions Manager', icon: <ClipboardList className="h-4 w-4" /> },
      { href: '/admin/quizzes', label: 'Quizzes Manager', icon: <Sparkles className="h-4 w-4" /> },
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
      { href: '/admin/products', label: 'Products Store', icon: <Library className="h-4 w-4" /> },
    ]
  },
  {
    title: "Communication",
    items: [
      { href: '/admin/faqs', label: 'Manage FAQs', icon: <HelpCircle className="h-4 w-4" /> },
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
      { href: '/admin/migrate-seo', label: 'Migrate SEO', icon: <Upload className="h-4 w-4" /> },
      { href: '/admin/migrate-taxonomy', label: 'Migrate Taxonomy', icon: <Upload className="h-4 w-4" /> },
    ]
  }
];


type UserProfile = {
  role?: 'admin' | 'user';
  notifications?: any[];
};

export const NotificationBell = () => {
  const { user } = useAuth();
  const { notificationPermissionStatus, requestPermission, error, fcmToken } = useFcm();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile?.notifications) {
          const sorted = [...userProfile.notifications].sort((a, b) => b.createdAt - a.createdAt);
          setNotifications(sorted);
          setUnreadCount(sorted.filter(n => !n.read).length);
        }
      }
    };
    
    // Poll for notifications every 10 seconds just to keep it somewhat updated, 
    // or rely on a simple load. For now just fetch once on mount/user change.
    fetchProfile();
    const interval = setInterval(fetchProfile, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="font-bold flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notificationPermissionStatus === 'default' && (
          <div className="p-3 m-2 bg-blue-50 border border-blue-100 rounded-lg text-center flex flex-col gap-2">
            <p className="text-xs text-blue-700 font-medium">Turn on push notifications to never miss an update!</p>
            <Button size="sm" variant="outline" className="bg-white hover:bg-blue-100 text-blue-600 h-7" onClick={(e) => { e.preventDefault(); requestPermission(); }}>
              Enable Push
            </Button>
          </div>
        )}
        {notificationPermissionStatus === 'denied' && (
          <div className="p-2 mx-2 mb-2 bg-red-50 text-red-600 text-[10px] rounded text-center">
            Push notifications blocked by browser.
          </div>
        )}

        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No notifications yet.</div>
          ) : (
            <div className="flex flex-col gap-1 p-1">
              {notifications.map((notif, i) => (
                <div key={notif.id || i} className={`p-3 text-sm rounded-md flex flex-col gap-1 ${!notif.read ? 'bg-amber-50 dark:bg-amber-900/10 border-l-2 border-amber-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                   <div className="font-semibold text-slate-800 dark:text-slate-200">{notif.title}</div>
                   <div className="text-slate-600 dark:text-slate-400 text-xs">{notif.desc}</div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
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
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
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
        "transition-colors flex items-center hover:text-[#00a651] text-sm font-medium",
        pathname === href 
            ? "text-[#00a651] font-bold" 
            : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
        isMobile && "text-lg py-2 gap-4"
      )}
    >
      {isMobile && icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <nav
      className={cn(
        "items-center space-x-2 lg:space-x-4",
        isMobile ? "flex flex-col items-start space-x-0 space-y-4 pt-4 w-full" : "hidden md:flex"
      )}
    >
      {mainNavLinks.map((link) => {
        if (link.label === "Others") {
          const othersMenuItems = dashboardNavGroups.find(g => g.title === "OTHERS")?.items || [];
          const isActive = othersMenuItems.some(i => pathname === i.href) || pathname === link.href;
          return (
            <DropdownMenu key={link.href}>
              <DropdownMenuTrigger className={cn(
                "transition-colors flex items-center gap-1 hover:text-[#00a651] outline-none cursor-pointer text-sm font-medium",
                isActive
                    ? "text-[#00a651] font-bold"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                isMobile && cn("text-lg py-2 gap-4 w-full justify-start", !isActive && "font-normal")
              )}>
                {isMobile && link.icon}
                <span>{link.label}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {othersMenuItems.map(item => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} onClick={onLinkClick} className="cursor-pointer flex items-center w-full">
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        return <NavLink key={link.href} {...link} />;
      })}
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
        <div className="flex flex-col h-full bg-slate-50 text-slate-700 border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden relative selection:bg-indigo-500/30 dark:bg-slate-900/95 dark:border-slate-800/60 dark:text-slate-300">
            {/* Subtle premium background glow */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-50 via-white to-transparent dark:from-indigo-900/20 dark:via-transparent dark:to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-[300px] bg-gradient-to-tl from-teal-50 to-transparent dark:from-teal-900/10 dark:to-transparent pointer-events-none" />
            
            <div className="p-4 group-data-[collapsible=icon]:p-2 flex items-center h-16 shrink-0 border-b border-slate-200/50 dark:border-white/5 bg-transparent relative z-10">
                <Link href="/admin" onClick={onLinkClick} className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 w-full group-data-[collapsible=icon]:justify-center">
                    <img src="/icons/icon-192x192.png" alt="DeshExam Logo" className="h-8 w-8 object-contain shrink-0 drop-shadow-md" />
                    <div className="font-extrabold text-xl tracking-tighter flex items-baseline group-data-[collapsible=icon]:hidden whitespace-nowrap">
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent drop-shadow-sm">DESH</span>
                        <span className="text-slate-800 dark:text-white drop-shadow-sm">EXAM</span>
                        <span className="ml-2 text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest bg-indigo-100/50 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-500/30 shadow-sm">Admin</span>
                    </div>
                </Link>
            </div>
            <ScrollArea className="flex-1 bg-transparent relative z-10">
                <div className="space-y-6 px-3 py-6 group-data-[collapsible=icon]:px-2">
                    {adminNavGroups.map((group, idx) => {
                        const isOpen = openGroups[group.title];
                        return (
                        <div key={idx} className="space-y-2">
                            <button 
                                onClick={() => toggleGroup(group.title)}
                                className="w-full flex items-center justify-between px-3 py-1 text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-slate-200 transition-colors uppercase tracking-[0.2em] group-data-[collapsible=icon]:hidden focus:outline-none"
                            >
                                <span>{group.title}</span>
                                {isOpen ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} group-data-[collapsible=icon]:max-h-none group-data-[collapsible=icon]:opacity-100`}>
                            <ul className="space-y-1 mt-1 group-data-[collapsible=icon]:px-0">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                                    return (
                                        <li key={item.href}>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className={cn(
                                                    "justify-start w-full h-11 px-3 py-2 text-[15px] rounded-xl transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 border",
                                                    isActive 
                                                        ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm border-indigo-100 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/50" 
                                                        : "bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
                                                )}
                                            >
                                                <Link href={item.href} onClick={onLinkClick}>
                                                    <span className={cn("transition-colors flex-shrink-0 drop-shadow-sm", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300", "group-data-[collapsible=icon]:mx-auto")}>
                                                        {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5" })}
                                                    </span>
                                                    <span className="ml-3 group-data-[collapsible=icon]:hidden whitespace-nowrap tracking-wide">{item.label}</span>
                                                </Link>
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                            </div>
                        </div>
                    )})}
                    
                    <div className="pt-6 mt-6 border-t border-slate-200/50 dark:border-white/10 space-y-2 px-1 group-data-[collapsible=icon]:px-0">
                        <Button
                            asChild
                            variant="ghost"
                            className="justify-start w-full h-10 px-3 py-2 text-sm font-medium rounded-xl border border-transparent bg-transparent hover:bg-white/60 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                        >
                            <Link href="/dashboard" onClick={onLinkClick}>
                                <LayoutGrid className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0 group-data-[collapsible=icon]:mx-auto" />
                                <span className="ml-3 group-data-[collapsible=icon]:hidden whitespace-nowrap tracking-wide">Exit Admin</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md shrink-0 group-data-[collapsible=icon]:p-2 flex flex-col items-center relative z-10">
                <Button variant="ghost" className="w-full justify-start text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-100 dark:hover:border-rose-500/20 border border-transparent rounded-xl transition-all duration-300 h-10 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 font-medium tracking-wide" onClick={logOut}>
                    <LogOut className="mr-3 h-4 w-4 flex-shrink-0 group-data-[collapsible=icon]:mr-0"/>
                    <span className="group-data-[collapsible=icon]:hidden whitespace-nowrap">Logout</span>
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300 overflow-hidden">
        <div className="p-4 flex items-center h-16 shrink-0 border-b border-slate-100 dark:border-slate-800">
            <Link href="/dashboard" onClick={onLinkClick} className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center">
                <div className="font-extrabold text-2xl tracking-tighter flex items-center group-data-[collapsible=icon]:hidden">
                    <img src="/icons/icon-192x192.png" alt="DeshExam" className="w-8 h-8 object-contain mr-2" />
                    <span className="text-green-600">DESH </span>
                    <span className="text-slate-800 dark:text-slate-100 ml-1">EXAM</span>
                </div>
                <div className="hidden items-center justify-center group-data-[collapsible=icon]:flex">
                    <img src="/icons/icon-192x192.png" alt="DeshExam" className="w-8 h-8 object-contain" />
                </div>
            </Link>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-4 py-4 group-data-[collapsible=icon]:px-2">
            {dashboardNavGroups.map((group, idx) => {
              const isOpen = !group.title || openGroups[group.title];
              return (
              <div key={idx} className="space-y-1">
                {group.title && (
                    <div 
                      className="flex justify-between items-center px-4 mb-2 cursor-pointer group group-data-[collapsible=icon]:hidden"
                      onClick={() => setOpenGroups(prev => ({...prev, [group.title]: !prev[group.title]}))}
                    >
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors whitespace-nowrap truncate">{group.title}</h4>
                      {isOpen ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors" /> : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors" />}
                    </div>
                )}
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} group-data-[collapsible=icon]:max-h-none group-data-[collapsible=icon]:opacity-100`}>
                  <ul className="space-y-0.5 px-2 group-data-[collapsible=icon]:px-0">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            "justify-start w-full h-9 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                            pathname === item.href
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                          )}
                        >
                          <Link href={item.href} onClick={onLinkClick}>
                            <span className={cn("flex-shrink-0", pathname === item.href ? "text-green-600" : "text-slate-400 dark:text-slate-500", "group-data-[collapsible=icon]:mx-auto")}>{item.icon}</span>
                            <span className="ml-3 group-data-[collapsible=icon]:hidden whitespace-nowrap">{item.label}</span>
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )})}
            
            {profile?.role === 'admin' && (
              <div className="px-2 pt-4 group-data-[collapsible=icon]:px-0">
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "justify-start w-full h-9 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                    "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <Link href="/admin" onClick={onLinkClick}>
                    <ShieldCheck className="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-slate-500 group-data-[collapsible=icon]:mx-auto" />
                    <span className="ml-3 group-data-[collapsible=icon]:hidden whitespace-nowrap">Admin Dashboard</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 group-data-[collapsible=icon]:p-2 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0 flex flex-col items-center">
             <Button variant="outline" className="w-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0 justify-between group-data-[collapsible=icon]:justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 h-10" asChild>
                 <Link href="/pricing">
                    <span className="group-data-[collapsible=icon]:hidden whitespace-nowrap">Upgrade Plan</span> 
                    <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 group-data-[collapsible=icon]:hidden" />
                    <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 hidden group-data-[collapsible=icon]:block" />
                 </Link>
             </Button>
             
             <div className="flex items-center justify-between p-2 group-data-[collapsible=icon]:p-0 w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 group-data-[collapsible=icon]:bg-transparent border border-slate-100 dark:border-slate-800 group-data-[collapsible=icon]:border-transparent cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group-data-[collapsible=icon]:justify-center">
                <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                    <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 shrink-0">
                        <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} />
                        <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">{user?.displayName || "User"}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">Free Plan</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 group-data-[collapsible=icon]:hidden" onClick={logOut}>
                    <LogOut className="h-4 w-4"/>
                </Button>
             </div>
          </div>
    </div>
  );
};

export const ClearCacheButton = () => {
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const res = await clearAllCache();
      if (res.success) {
         toast({ title: 'Success', description: res.message });
      } else {
         toast({ title: 'Error', description: res.message, variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to clear cache.', variant: 'destructive' });
    }
    setIsClearing(false);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClearCache} disabled={isClearing} title="Clear Global Cache">
      <Trash2 className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
    </Button>
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
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        isScrolled 
          ? "bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm text-slate-800 dark:bg-slate-950/95 dark:border-slate-800 dark:text-slate-200" 
          : "bg-transparent border-slate-200 text-slate-800 dark:border-slate-800 dark:text-slate-200"
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
          <Button asChild size="icon" variant="outline" className="hidden md:flex h-9 w-9 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-400 border-amber-300/50 dark:border-amber-700/50 hover:bg-amber-50 shadow-sm" title="Premium Upgrade">
            <Link href="/pricing">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </Link>
          </Button>
          <ThemeToggle />
          {pathname?.startsWith('/admin') && <ClearCacheButton />}
          <NotificationBell />
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
                                <Button variant="ghost" className="bg-[#00a651] hover:bg-[#008f45] text-white" onClick={() => { openAuthDialog('sign-in'); setIsSheetOpen(false); }}>Sign In</Button>
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
