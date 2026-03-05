'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  sidebar: React.ReactNode;
}

export function DashboardLayout({ children, title, sidebar }: DashboardLayoutProps) {
  const { user, logout, isInitialized } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [user, router, isInitialized]);

  if (!isInitialized || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-primary/10 rounded-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0 md:w-64'
        } overflow-hidden`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 mt-12 md:mt-0">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI</span>
            </div>
            <span className="font-bold text-foreground">Resume AI</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {sidebar}
          </nav>

          {/* User Info & Logout */}
          <div className="pt-4 border-t border-border space-y-4">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Account</p>
              <p className="text-sm font-semibold text-foreground mt-1">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button
              onClick={() => {
                logout();
                router.push('/');
              }}
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b border-border px-6 py-4 h-16 flex items-center">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
