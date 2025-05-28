
'use server';

import { z } from 'zod';
import { identifyIngredients as identifyIngredientsFlow } from '@/ai/flows/identify-ingredients';
import { suggestRecipes as suggestRecipesFlow } from '@/ai/flows/suggest-recipes';
import { generateRecipeImage as generateRecipeImageFlow } from '@/ai/flows/generate-recipe-image-flow';
import type { AIAssistedRecipe } from '@/types';

const recipeGenerationSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image data URI" }),
  allergies: z.string().optional(), // Comma-separated string
});

export interface RecipeGenerationResult {
  success: boolean;
  recipes?: AIAssistedRecipe[];
  error?: string;
  identifiedIngredients?: string[];
}

// Helper to generate UUID (simplified for server action context)
function generateUUID() {
  // Basic UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function generateRecipesAction(
  prevState: RecipeGenerationResult | null,
  formData: FormData
): Promise<RecipeGenerationResult> {
  try {
    const validatedFields = recipeGenerationSchema.safeParse({
      photoDataUri: formData.get('photoDataUri'),
      allergies: formData.get('allergies'),
    });

    if (!validatedFields.success) {
      const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError || "Invalid input." };
    }

    const { photoDataUri, allergies } = validatedFields.data;

    // Step 1: Identify ingredients
    const ingredientsResult = await identifyIngredientsFlow({ photoDataUri });
    if (!ingredientsResult || !ingredientsResult.ingredients || ingredientsResult.ingredients.length === 0) {
      return { success: false, error: 'Could not identify ingredients from the photo.' };
    }
    const identifiedIngredients = ingredientsResult.ingredients;

    // Step 2: Suggest recipes (textual details)
    const recipesPayload = {
      ingredients: identifiedIngredients.join(','),
      ...(allergies && allergies.trim() !== '' && { allergies }),
    };
    const suggestedRecipesResult = await suggestRecipesFlow(recipesPayload);
    
    if (!suggestedRecipesResult || !suggestedRecipesResult.recipes) {
      return { success: false, error: 'Could not generate recipe suggestions.', identifiedIngredients };
    }

    const recipesWithDetails: Omit<AIAssistedRecipe, 'imageUrl'>[] = suggestedRecipesResult.recipes.map(recipe => ({
      id: generateUUID(),
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      nutritionalInfo: recipe.nutritionalInfo || "Nutritional information not available.",
      originalIdentifiedIngredients: identifiedIngredients,
      originalAllergies: allergies ? allergies.split(',').map(a => a.trim()).filter(a => a) : [],
    }));

    // Step 3: Generate images for each recipe
    const recipesWithImages: AIAssistedRecipe[] = [];
    for (const recipe of recipesWithDetails) {
      try {
        const imageResult = await generateRecipeImageFlow({
          recipeName: recipe.name,
          recipeDescription: recipe.description,
        });
        recipesWithImages.push({ ...recipe, imageUrl: imageResult.imageUrl });
      } catch (imageError) {
        console.warn(`Failed to generate image for recipe "${recipe.name}":`, imageError);
        // Add recipe without image if generation fails
        recipesWithImages.push({ ...recipe, imageUrl: undefined }); 
      }
    }

    return { success: true, recipes: recipesWithImages, identifiedIngredients };

  } catch (error) {
    console.error('Error in generateRecipesAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: `Recipe generation failed: ${errorMessage}` };
  }
}
