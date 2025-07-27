import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Newspaper,
  Calendar,
  Store,
  Users,
  UsersRound,
  Settings,
  ArrowRight,
  Tv,
  Trophy,
  ShoppingCart,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const dashboardLinks = [
  { href: "/admin/news", label: "Manage News", icon: Newspaper, description: "Create, edit, and delete news articles." },
  { href: "/admin/events", label: "Manage Events", icon: Calendar, description: "Update club events and fan meetups." },
  { href: "/admin/schedule", label: "Manage Schedule", icon: Tv, description: "Update match details and live stream links." },
  { href: "/admin/store", label: "Manage Store", icon: Store, description: "Add or update kits and merchandise." },
  { href: "/admin/orders", label: "Manage Orders", icon: ShoppingCart, description: "View and process customer orders." },
  { href: "/admin/players", label: "Manage Players", icon: Users, description: "Edit player profiles and stats." },
  { href: "/admin/standings", label: "Manage Standings", icon: Trophy, description: "Update the league table." },
  { href: "/admin/polls", label: "Manage Polls", icon: BarChart, description: "Create and manage fan polls." },
  { href: "/admin/users", label: "Manage Users", icon: UsersRound, description: "View and manage user accounts." },
  { href: "/admin/settings", label: "Site Settings", icon: Settings, description: "Configure global platform settings." },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link href={link.href} key={link.href} className="flex">
              <Card className="hover:border-primary hover:shadow-lg transition-all h-full flex flex-col w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <span>{link.label}</span>
                  </CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                    <Button variant="outline" className="w-full justify-between">
                        Go to Section <ArrowRight className="h-4 w-4" />
                    </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
