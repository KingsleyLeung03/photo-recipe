
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
import { compressDataUri } from '@/utils/image-utils'; // Import compression utility

const EMPTY_RECIPES_ARRAY: AIAssistedRecipe[] = [];
const MAX_SAVED_RECIPES = 3;

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<AIAssistedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [savedRecipes, setSavedRecipes] = useLocalStorage<AIAssistedRecipe[]>('photoRecipe_savedRecipes', EMPTY_RECIPES_ARRAY);
  const [sessionRecipes] = useLocalStorage<AIAssistedRecipe[]>('photoRecipe_sessionRecipes', EMPTY_RECIPES_ARRAY); 

  useEffect(() => {
    if (recipeId) {
      setIsLoading(true);
      // Try to find in currently generated/session recipes first (these may or may not have imageUrl)
      let foundRecipe = sessionRecipes.find(r => r.id === recipeId);
      
      // If not in session, check saved recipes (these will have compressed or no imageUrl)
      if (!foundRecipe) {
        foundRecipe = savedRecipes.find(r => r.id === recipeId);
      }
      
      // If still not found but generatedRecipes (from HomePage, not directly accessible here) might have it,
      // this scenario implies a direct navigation to a new recipe.
      // For simplicity, we primarily rely on session and saved.
      // A more robust solution might involve a global state or fetching if ID not in local sources.

      if (foundRecipe) {
        // If the recipe details page is loaded directly, and it was from a fresh generation,
        // it might have a full-size image. The `recipe` state here could hold this.
        // When saved, it will be compressed.
        setRecipe(foundRecipe);
      }
      setIsLoading(false);
    } else {
        setIsLoading(false); 
    }
  }, [recipeId, savedRecipes, sessionRecipes]);

  const toggleSaveRecipe = async () => { // Make async
    if (!recipe) return;

    const isAlreadySaved = savedRecipes.some(r => r.id === recipe.id);
    if (isAlreadySaved) {
      setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id));
      toast({ title: "Recipe Unsaved", description: `"${recipe.name}" removed from your saved recipes.` });
    } else {
      let recipeToSave: AIAssistedRecipe = { ...recipe };
      if (recipe.imageUrl) {
        try {
          console.log(`Compressing image for (details page): ${recipe.name}`);
          const compressedUrl = await compressDataUri(recipe.imageUrl);
          recipeToSave.imageUrl = compressedUrl;
        } catch (e) {
          console.error("Failed to compress image for saving on details page:", e);
          // recipeToSave.imageUrl will retain the original or fallback
        }
      } else {
        delete recipeToSave.imageUrl;
      }

      setSavedRecipes(prev => {
        const recipesWithNew = [...prev.filter(r => r.id !== recipeToSave.id), recipeToSave]; // Avoid duplicates
        if (recipesWithNew.length > MAX_SAVED_RECIPES) {
          return recipesWithNew.slice(recipesWithNew.length - MAX_SAVED_RECIPES);
        }
        return recipesWithNew;
      });
      toast({ 
        title: "Recipe Saved!", 
        description: `"${recipeToSave.name}" added. You can save up to ${MAX_SAVED_RECIPES} recipes.` 
      });
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
      {/* The RecipeDetailsDisplay will use recipe.imageUrl, which could be the original or compressed version if re-saved */}
      <RecipeDetailsDisplay recipe={recipe} />
    </div>
  );
}
