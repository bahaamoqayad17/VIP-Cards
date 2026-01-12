"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  CreditCard,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Map,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "لوحة التحكم",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "العملاء والبطاقات",
    href: "/customers",
    icon: Users,
  },
  {
    title: "أنواع المحلات",
    href: "/categories",
    icon: Tag,
  },
  {
    title: "المحلات",
    href: "/stores",
    icon: Store,
  },
  {
    title: "المحافظات",
    href: "/places",
    icon: Map,
  },
  {
    title: "الاشتراكات",
    href: "/subscriptions",
    icon: CreditCard,
  },
];

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

interface SidebarContentProps {
  isMobile?: boolean;
  isCollapsed?: boolean;
  pathname?: string | null;
  onNavClick?: () => void;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  isMobile = false,
  isCollapsed = false,
  pathname,
  onNavClick,
  onToggleCollapse,
}: SidebarContentProps) {
  return (
    <div className={cn("flex h-full flex-col", isMobile && "w-full")}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed && !isMobile && "justify-center"
          )}
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CreditCard className="size-5" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">بطاقات VIP</span>
              <span className="text-xs text-muted-foreground">لوحة التحكم</span>
            </div>
          )}
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronLeft className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && !isMobile && "justify-center px-2"
                )}
              >
                {(!isCollapsed || isMobile) && (
                  <>
                    {item.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {item.badge}
                      </span>
                    )}
                    <span className="flex-1 text-right">{item.title}</span>
                  </>
                )}
                <Icon
                  className={cn(
                    "size-5 shrink-0",
                    isCollapsed && !isMobile && "mx-auto"
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
            isCollapsed && !isMobile && "justify-center px-2"
          )}
        >
          <LogOut
            className={cn(
              "size-5 shrink-0",
              isCollapsed && !isMobile && "mx-auto"
            )}
          />
          {(!isCollapsed || isMobile) && <span>تسجيل الخروج</span>}
        </Button>
      </div>
    </div>
  );
}

export default function Sidebar({ className, children }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
          >
            <Menu className="size-5" />
            <span className="sr-only">فتح القائمة</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] p-0">
          <SidebarContent
            isMobile
            isCollapsed={false}
            pathname={pathname}
            onNavClick={() => setIsMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-30 hidden h-screen border-l bg-background transition-all duration-300 lg:block",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          pathname={pathname}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </aside>

      {/* Spacer for desktop sidebar */}
      <div
        className={cn(
          "hidden transition-all duration-300 lg:block",
          isCollapsed ? "w-16" : "w-64"
        )}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
