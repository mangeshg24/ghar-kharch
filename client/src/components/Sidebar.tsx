import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Receipt, FileText, Menu, X, WalletCards } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Members", href: "/members", icon: Users },
  { label: "Reports", href: "/reports", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg border border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-64 bg-background border-r border-border/50 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 glass-panel",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <WalletCards className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-none tracking-tight text-foreground">GharKharch</h1>
              <span className="text-xs text-muted-foreground font-medium">Family Expense Tracker</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                  )}>
                    <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="mt-auto pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Developed by Mangeshh Gaykar
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
