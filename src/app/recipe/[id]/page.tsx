
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AIAssistedRecipe } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { RecipeDetailsDisplay } from '@/components/RecipeDetailsDisplay';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { compressDataUri } from '@/utils/image-utils';

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
      let foundRecipe = sessionRecipes.find(r => r.id === recipeId);
      
      if (!foundRecipe) {
        foundRecipe = savedRecipes.find(r => r.id === recipeId);
      }
      
      if (foundRecipe) {
        setRecipe(foundRecipe);
      }
      setIsLoading(false);
    } else {
        setIsLoading(false); 
    }
  }, [recipeId, savedRecipes, sessionRecipes]);

  const toggleSaveRecipe = async () => {
    if (!recipe) return;

    const isAlreadySaved = savedRecipes.some(r => r.id === recipe.id);
    if (isAlreadySaved) {
      setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id));
      toast({ title: "Recipe Unsaved", description: `"${recipe.name}" removed from your saved recipes.` });
    } else {
      if (savedRecipes.length >= MAX_SAVED_RECIPES) {
        toast({
          title: "Save Limit Reached",
          description: `You can save up to ${MAX_SAVED_RECIPES} recipes. Please unsave one to add a new recipe.`,
          variant: "default"
        });
        return; // Prevent saving
      }

      let recipeToSave: AIAssistedRecipe = { ...recipe };
      if (recipe.imageUrl) {
        try {
          console.log(`Compressing image for (details page): ${recipe.name}`);
          const compressedUrl = await compressDataUri(recipe.imageUrl);
          recipeToSave.imageUrl = compressedUrl;
        } catch (e) {
          console.error("Failed to compress image for saving on details page:", e);
        }
      } else {
        delete recipeToSave.imageUrl;
      }

      const updatedSavedRecipes = [...savedRecipes.filter(r => r.id !== recipeToSave.id), recipeToSave];
      setSavedRecipes(updatedSavedRecipes);
      toast({ 
        title: "Recipe Saved!", 
        description: `"${recipeToSave.name}" added. (${updatedSavedRecipes.length}/${MAX_SAVED_RECIPES} recipes saved)` 
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
  const saveDisabled = !isSaved && savedRecipes.length >= MAX_SAVED_RECIPES;
  let saveButtonText = 'Save Recipe';
  if (isSaved) {
    saveButtonText = 'Unsave Recipe';
  } else if (saveDisabled) {
    saveButtonText = 'Limit Reached';
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button 
          variant={isSaved ? "secondary" : "default"} 
          size="sm" 
          onClick={toggleSaveRecipe} 
          className="flex items-center gap-1 w-full sm:w-auto"
          disabled={saveDisabled}
        >
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-accent text-accent' : (saveDisabled ? 'text-muted-foreground' : '')}`} />
          {saveButtonText}
        </Button>
      </div>
      <RecipeDetailsDisplay recipe={recipe} />
    </div>
  );
}
