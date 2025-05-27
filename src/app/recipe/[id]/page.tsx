"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AIAssistedRecipe } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { RecipeDetailsDisplay } from '@/components/RecipeDetailsDisplay';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<AIAssistedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [savedRecipes, setSavedRecipes] = useLocalStorage<AIAssistedRecipe[]>('photoRecipe_savedRecipes', []);
  const [sessionRecipes] = useLocalStorage<AIAssistedRecipe[]>('photoRecipe_sessionRecipes', []); // Read-only for this page

  useEffect(() => {
    if (recipeId) {
      setIsLoading(true);
      // First, check session recipes (for currently generated ones)
      const sessionRecipe = sessionRecipes.find(r => r.id === recipeId);
      if (sessionRecipe) {
        setRecipe(sessionRecipe);
        setIsLoading(false);
        return;
      }

      // Then, check saved recipes
      const savedRecipe = savedRecipes.find(r => r.id === recipeId);
      if (savedRecipe) {
        setRecipe(savedRecipe);
      }
      setIsLoading(false);
    } else {
        setIsLoading(false); // No ID, so not loading
    }
  }, [recipeId, savedRecipes, sessionRecipes]);

  const toggleSaveRecipe = () => {
    if (!recipe) return;
    const isAlreadySaved = savedRecipes.some(r => r.id === recipe.id);
    if (isAlreadySaved) {
      setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id));
      toast({ title: "Recipe Unsaved", description: `"${recipe.name}" removed from your saved recipes.` });
    } else {
      setSavedRecipes(prev => [...prev, recipe]);
      toast({ title: "Recipe Saved!", description: `"${recipe.name}" added to your saved recipes.` });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
         <Card className="max-w-md mx-auto shadow-lg mt-10 rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center text-destructive">
              <AlertTriangle className="h-8 w-8 mr-2" /> Recipe Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              We couldn't find the recipe you're looking for. It might have been a temporary suggestion or an incorrect link.
            </p>
            <Button onClick={() => router.push('/')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSaved = savedRecipes.some(r => r.id === recipe.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" asChild size="sm">
          <Link href="/" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Recipes
          </Link>
        </Button>
        <Button variant={isSaved ? "secondary" : "default"} size="sm" onClick={toggleSaveRecipe} className="flex items-center gap-1 w-full sm:w-auto">
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-accent text-accent' : ''}`} />
          {isSaved ? 'Unsave Recipe' : 'Save Recipe'}
        </Button>
      </div>
      <RecipeDetailsDisplay recipe={recipe} />
    </div>
  );
}
