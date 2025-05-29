
"use client";

import { useState, useCallback, useEffect } from 'react';
import { PhotoRecipeForm } from '@/components/PhotoRecipeForm';
import { RecipeCard } from '@/components/RecipeCard';
import type { AIAssistedRecipe } from '@/types';
import type { RecipeGenerationResult } from '@/app/actions';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AlertTriangle, Info, ChefHat, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { compressDataUri } from '@/utils/image-utils';
import { useToast } from '@/hooks/use-toast';


// Define initial empty arrays outside the component for stable references
const EMPTY_RECIPES_ARRAY: AIAssistedRecipe[] = [];
const MAX_SAVED_RECIPES = 3;

export default function HomePage() {
  const [generatedRecipes, setGeneratedRecipes] = useState<AIAssistedRecipe[]>([]);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useLocalStorage<AIAssistedRecipe[]>('photoRecipe_savedRecipes', EMPTY_RECIPES_ARRAY);
  const [sessionRecipes, setSessionRecipes] = useLocalStorage<AIAssistedRecipe[]>('photoRecipe_sessionRecipes', EMPTY_RECIPES_ARRAY);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
  const { toast } = useToast();


  const handleRecipeGenerationResult = useCallback((result: RecipeGenerationResult | null, loading: boolean) => {
    setIsLoading(loading); // Update loading state based on form's pending status

    if (!loading) { // When an action is NOT pending (i.e., it has completed or it's the initial state)
      // An "attempt" has been made if the action state (result) is no longer the initial null value.
      // This distinguishes the initial call from a completed action.
      // The `initialState` for useActionState in the PhotoRecipeForm is `null`.
      if (result !== null) {
        setHasAttemptedGeneration(true);
      }

      if (result) { // If there's an actual result object (not null)
        if (result.success && result.recipes) {
          setGeneratedRecipes(result.recipes);
          setIdentifiedIngredients(result.identifiedIngredients);
          setError(null);
        } else if (result.error) {
          setError(result.error);
          setGeneratedRecipes([]); // Clear recipes on error
          setIdentifiedIngredients(result.identifiedIngredients); // Still show identified ingredients if available
        }
      }
      // If result is null AND !loading:
      // This is the initial state call from PhotoRecipeForm when it mounts.
      // We do nothing to `generatedRecipes` or `error` here. `hasAttemptedGeneration` correctly remains false.
    }
    // If loading is true, only setIsLoading(true) runs, and the rest of the logic in this block is skipped.
  }, [setIsLoading, setHasAttemptedGeneration, setGeneratedRecipes, setIdentifiedIngredients, setError]);

  const toggleSaveRecipe = async (recipeId: string) => {
    const recipeToToggle = generatedRecipes.find(r => r.id === recipeId) ||
                           sessionRecipes.find(r => r.id === recipeId) ||
                           savedRecipes.find(r => r.id === recipeId);

    if (!recipeToToggle) {
      console.warn("Recipe not found to toggle save state:", recipeId);
      return;
    }

    const isAlreadySaved = savedRecipes.some(r => r.id === recipeId);

    if (isAlreadySaved) {
      setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
      toast({ title: "Recipe Unsaved", description: `"${recipeToToggle.name}" removed from your saved recipes.` });
    } else {
      let recipeToSave: AIAssistedRecipe = { ...recipeToToggle };
      if (recipeToToggle.imageUrl) {
        try {
          console.log(`Compressing image for: ${recipeToToggle.name}`);
          const compressedUrl = await compressDataUri(recipeToToggle.imageUrl);
          recipeToSave.imageUrl = compressedUrl;
        } catch (e) {
          console.error("Failed to compress image for saving on main page:", e);
        }
      } else {
        delete recipeToSave.imageUrl;
      }

      setSavedRecipes(prev => {
        const recipesWithNew = [...prev.filter(r => r.id !== recipeToSave.id), recipeToSave];
        if (recipesWithNew.length > MAX_SAVED_RECIPES) {
          toast({
            title: "Recipe Limit Reached",
            description: `Removed oldest recipe to save "${recipeToSave.name}". Max ${MAX_SAVED_RECIPES} recipes.`,
            variant: "default"
          });
          return recipesWithNew.slice(recipesWithNew.length - MAX_SAVED_RECIPES);
        }
        toast({
          title: "Recipe Saved!",
          description: `"${recipeToSave.name}" added. You can save up to ${MAX_SAVED_RECIPES} recipes.`
        });
        return recipesWithNew;
      });
    }
  };

  const recipesToShow = generatedRecipes.length > 0 ? generatedRecipes : (sessionRecipes.length > 0 && !isLoading && !error && hasAttemptedGeneration ? sessionRecipes : []);

  useEffect(() => {
    if (generatedRecipes.length > 0) {
      const recipesForSession = generatedRecipes.map(recipe => {
        const { imageUrl, ...rest } = recipe;
        return rest;
      });
      setSessionRecipes(recipesForSession);
    }
  }, [generatedRecipes, setSessionRecipes]);


  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <PhotoRecipeForm onRecipeGenerationResult={handleRecipeGenerationResult} />
      </section>

      {isLoading && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-center text-primary flex items-center justify-center">
            <Loader2 className="inline-block h-7 w-7 mr-2 animate-spin" />
            Crafting Your Culinary Creations...
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="flex flex-col h-full overflow-hidden rounded-lg">
                <Skeleton className="aspect-video w-full rounded-t-lg" />
                <CardContent className="flex-grow p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center border-t">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!isLoading && error && (
        <div role="alert" className="p-6 bg-destructive/10 border-2 border-destructive text-destructive rounded-xl shadow-md flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-12 w-12" />
          <h3 className="text-xl font-semibold">Oops! Something went wrong.</h3>
          <p>{error}</p>
          {identifiedIngredients && identifiedIngredients.length > 0 && (
            <p className="text-sm mt-2">We identified these ingredients: {identifiedIngredients.join(', ')}. You could try again or adjust the photo.</p>
          )}
        </div>
      )}

      {!isLoading && !error && recipesToShow.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground flex items-center justify-center">
            <ChefHat className="inline-block h-8 w-8 mr-2" />
            Here Are Your Recipe Ideas!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipesToShow.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSaved={savedRecipes.some(r => r.id === recipe.id)}
                onToggleSave={() => toggleSaveRecipe(recipe.id)}
              />
            ))}
          </div>
        </section>
      )}

      {!isLoading && hasAttemptedGeneration && !error && recipesToShow.length === 0 && (
         <section className="text-center py-10">
          <Info className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Recipes Found</h2>
          <p className="text-lg text-muted-foreground">
            We couldn't find any recipes for the ingredients {identifiedIngredients && identifiedIngredients.length > 0 ? `(${identifiedIngredients.join(', ')})` : ''}.
          </p>
          <p className="text-muted-foreground">Try a different photo or adjust your allergies.</p>
        </section>
      )}

      {!isLoading && !hasAttemptedGeneration && !error && (
         <section className="text-center py-10">
          <Info className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Ready to Cook?</h2>
          <p className="text-lg text-muted-foreground">Upload a photo of your ingredients to get started!</p>
        </section>
      )}

    </div>
  );
}
