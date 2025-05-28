
import Link from 'next/link';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { Button } from '@/components/ui/button';
import { BookHeart, Home } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="PhotoRecipe Home">
          <LogoIcon className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            PhotoRecipe
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/saved" className="flex items-center gap-1">
              <BookHeart className="h-4 w-4" />
              Saved Recipes
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
