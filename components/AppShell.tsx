"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/state/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  BarChart3,
  Settings,
  Zap,
  Search,
  Bell,
  Menu,
  User,
  LogOut,
  Moon,
  Sun,
  ShoppingCart,
  CheckSquare,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Suppliers", href: "/suppliers", icon: Building2 },
  { name: "PO Management", href: "/po", icon: ShoppingCart },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
  { name: "Supplier Portal", href: "/supplier-portal", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Connector Playground", href: "/connector-playground", icon: Zap },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    toast.success(`Switched to ${isDarkMode ? "light" : "dark"} mode`);
  };

  const Sidebar = ({ mobile = false }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center">
          <svg width="140" height="48" viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="synqGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:"#007BFF", stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:"#00C6AE", stopOpacity:1}} />
              </linearGradient>
            </defs>
            
            {/* Chain links representing connection */}
            <g fill="url(#synqGradient)">
              <circle cx="20" cy="30" r="8" fill="#007BFF"/>
              <rect x="28" y="26" width="16" height="8" rx="4" fill="#007BFF"/>
              <circle cx="52" cy="30" r="8" fill="#00C6AE"/>
            </g>
            
            {/* Text */}
            <text x="70" y="25" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="bold" fill="#0A1A2F">SynqChain</text>
            <text x="70" y="42" fontFamily="Inter, sans-serif" fontSize="10" fill="#6B7280">Procurement. Perfected. Synq'd.</text>
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start font-medium",
                isActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              )}
              onClick={() => router.push(item.href)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Button>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">All Systems Operational</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            {/* Mobile menu trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar mobile />
              </SheetContent>
            </Sheet>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects, suppliers..."
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme}>
                    {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {isDarkMode ? "Light" : "Dark"} Mode
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}