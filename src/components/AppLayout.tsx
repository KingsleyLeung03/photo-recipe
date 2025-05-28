
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from "@/components/ui/toaster"
import { Info } from 'lucide-react';

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
        <p className="mt-1 text-xs flex items-center justify-center gap-1">
          <Info className="h-3 w-3" />
          AI-generated recipes. Always double-check ingredients and instructions.
        </p>
      </footer>
      <Toaster />
    </div>
  );
}
