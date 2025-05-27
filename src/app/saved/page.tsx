"use client";

import { useState, useEffect } from 'react';
import type { AIAssistedRecipe } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookHeart, PlusCircle, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function SavedRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useLocalStorage<AIAssistedRecipe[]>('photoRecipe_savedRecipes', []);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const unsaveRecipe = (recipeId: string) => {
    const recipeToRemove = savedRecipes.find(r => r.id === recipeId);
    setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
    if (recipeToRemove) {
      toast({ title: "Recipe Unsaved", description: `"${recipeToRemove.name}" removed from your saved recipes.` });
    }
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
        <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
        <p className="text-lg text-muted-foreground">Loading your saved recipes...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-4 sm:mb-0">
          <BookHeart className="h-8 w-8 text-primary" />
          Your Saved Recipes
        </h1>
        <Button asChild variant="default">
          <Link href="/" className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Find New Recipes
          </Link>
        </Button>
      </div>

      {savedRecipes.length === 0 ? (
        <div className="text-center py-10 bg-card border border-dashed rounded-lg shadow-sm mt-8">
          <Info className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Saved Recipes Yet!</h2>
          <p className="text-lg text-muted-foreground">
            Looks like your recipe book is empty. Start exploring and save your favorites!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSaved={true} 
              onToggleSave={unsaveRecipe} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
