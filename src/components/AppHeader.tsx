
"use client";

import Link from 'next/link';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { Button } from '@/components/ui/button';
import { BookHeart, Home, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

export function AppHeader() {
  const isMobile = useIsMobile();

  const navLinks = (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/" className="flex items-center gap-1 w-full justify-start">
          <Home className="h-4 w-4" />
          Home
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/saved" className="flex items-center gap-1 w-full justify-start">
          <BookHeart className="h-4 w-4" />
          Saved Recipes
        </Link>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="PhotoRecipe Home">
          <LogoIcon className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            PhotoRecipe
          </span>
        </Link>

        {isMobile === undefined ? ( // Skeleton or placeholder for SSR
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted/50 md:hidden"></div>
        ) : isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] pt-10">
              <nav className="flex flex-col gap-3">
                <SheetClose asChild>{navLinks}</SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center gap-2">
            {navLinks}
          </nav>
        )}
      </div>
    </header>
  );
}
