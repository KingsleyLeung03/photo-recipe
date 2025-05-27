import type { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from "@/components/ui/toaster"

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PhotoRecipe. Cook something amazing!</p>
      </footer>
      <Toaster />
    </div>
  );
}
