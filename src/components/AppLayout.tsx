
import type { ReactNode } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from "@/components/ui/toaster"
import { Info, Github, Linkedin } from 'lucide-react';

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
        <p>&copy; {new Date().getFullYear()} PhotoRecipe by Kingsley Leung. Cook something amazing!</p>
        <div className="mt-2 flex justify-center items-center gap-4">
          <Link href="https://github.com/KingsleyLeung03/photo-recipe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Github className="h-4 w-4" />
            GitHub
          </Link>
          <Link href="https://www.linkedin.com/in/zihong-l-258824257/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Link>
        </div>
        <p className="mt-3 text-xs flex items-center justify-center gap-1">
          <Info className="h-3 w-3" />
          AI-generated recipes. Always double-check ingredients and instructions.
        </p>
      </footer>
      <Toaster />
    </div>
  );
}
