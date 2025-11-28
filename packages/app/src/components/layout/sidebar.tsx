"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useCallback } from "react";
import { RegistryContext, Atom } from "@effect-atom/atom-react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Settings,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { jobsAtom, candidatesAtom, applicationsAtom } from "@/atoms/api";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  atoms?: ReadonlyArray<Atom.Atom<unknown>>;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    atoms: [jobsAtom, candidatesAtom, applicationsAtom],
  },
  {
    href: "/jobs",
    label: "Jobs",
    icon: Briefcase,
    atoms: [jobsAtom],
  },
  {
    href: "/candidates",
    label: "Candidates",
    icon: Users,
    atoms: [candidatesAtom],
  },
  {
    href: "/applications",
    label: "Applications",
    icon: FileText,
    atoms: [applicationsAtom, jobsAtom, candidatesAtom],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const registry = useContext(RegistryContext);
  const isActive = pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href));

  const handleMouseEnter = useCallback(() => {
    if (item.atoms) {
      item.atoms.forEach((atom) => {
        registry.mount(atom);
      });
    }
  }, [registry, item.atoms]);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

interface SidebarProps {
  onSearchClick?: () => void;
}

export function Sidebar({ onSearchClick }: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border/50 bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-sm font-semibold">
            A
          </div>
          <span className="text-sm font-semibold">ATS</span>
        </Link>
      </div>

      {/* Search */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground"
          onClick={onSearchClick}
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Search...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
