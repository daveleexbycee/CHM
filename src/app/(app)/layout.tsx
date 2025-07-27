
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Home,
  Newspaper,
  Calendar,
  Users,
  ShoppingCart,
  Trophy,
  Ticket,
  UserCog,
  Goal,
  User,
  LogOut,
  BarChart,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { Adsense } from "@/components/adsense";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";


const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/roster", label: "Roster", icon: Users },
  { href: "/store", label: "Kit Showcase", icon: ShoppingCart },
  { href: "/events", label: "Events", icon: Ticket },
  { href: "/polls", label: "Polls", icon: BarChart },
];

function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, isAdmin } = useAuth();
  const [isLive, setIsLive] = React.useState(false);

  React.useEffect(() => {
    const q = query(collection(db, "matches"), where("status", "==", "Live"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsLive(!snapshot.empty);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Goal className="h-8 w-8 text-primary" />
                            <span className="sr-only">CHM</span>
                        </Link>
                        {menuItems.map((item) => (
                           <SheetClose asChild key={item.href}>
                             <Link
                                href={item.href}
                                className={`flex items-center gap-4 px-2.5 ${
                                  pathname === item.href
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                                {item.label === "Schedule" && isLive && (
                                  <span className="live-dot ml-auto" />
                                )}
                              </Link>
                           </SheetClose>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Goal className="h-8 w-8 text-primary" />
              <span className="text-lg font-bold">CHM</span>
            </Link>
        </div>
        
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 mx-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative transition-colors font-medium ${
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-transparent bg-clip-text nav-link-hover"
              }`}
            >
              {item.label}
              {item.label === "Schedule" && isLive && (
                <span className="live-dot" />
              )}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={userData?.avatarUrl} alt={userData?.name} data-ai-hint="person portrait" />
                  <AvatarFallback>{userData?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userData?.name || user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                   <Link href="/admin/dashboard">
                    <UserCog className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Adsense />
        {children}
      </main>
    </div>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="text-center">
                <Goal className="h-12 w-12 text-primary animate-spin mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
  }

  return <AppLayoutContent>{children}</AppLayoutContent>;
}
