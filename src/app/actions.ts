
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
  console.log("generateRecipesAction: Entered server action with photoDataUri (length):", (formData.get('photoDataUri') as string)?.length, "Allergies:", formData.get('allergies'));
  try {
    const validatedFields = recipeGenerationSchema.safeParse({
      photoDataUri: formData.get('photoDataUri'),
      allergies: formData.get('allergies'),
    });

    if (!validatedFields.success) {
      const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
      console.error("generateRecipesAction: Validation failed.", firstError);
      return { success: false, error: firstError || "Invalid input." };
    }

    const { photoDataUri, allergies } = validatedFields.data;

    // Step 1: Identify ingredients
    console.log("generateRecipesAction: Calling identifyIngredientsFlow...");
    const ingredientsResult = await identifyIngredientsFlow({ photoDataUri });
    console.log("generateRecipesAction: identifyIngredientsFlow result:", ingredientsResult);

    if (!ingredientsResult || !ingredientsResult.ingredients || ingredientsResult.ingredients.length === 0) {
      console.warn("generateRecipesAction: Could not identify ingredients.");
      return { success: false, error: 'Could not identify ingredients from the photo.' };
    }
    const identifiedIngredients = ingredientsResult.ingredients;

    // Step 2: Suggest recipes (textual details)
    const recipesPayload = {
      ingredients: identifiedIngredients.join(','),
      ...(allergies && allergies.trim() !== '' && { allergies }),
    };
    console.log("generateRecipesAction: Calling suggestRecipesFlow with payload:", recipesPayload);
    const suggestedRecipesResult = await suggestRecipesFlow(recipesPayload);
    console.log("generateRecipesAction: suggestRecipesFlow result:", suggestedRecipesResult);
    
    if (!suggestedRecipesResult || !suggestedRecipesResult.recipes || suggestedRecipesResult.recipes.length === 0) {
      console.warn("generateRecipesAction: Could not generate recipe suggestions.");
      return { 
        success: false, 
        error: 'Could not generate recipe suggestions based on the identified ingredients. Please try a different photo or adjust your allergies.', 
        identifiedIngredients 
      };
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
    console.log(`generateRecipesAction: Generating images for ${recipesWithDetails.length} recipes...`);
    const recipesWithImages: AIAssistedRecipe[] = [];
    for (const recipe of recipesWithDetails) {
      try {
        console.log(`generateRecipesAction: Calling generateRecipeImageFlow for recipe "${recipe.name}"...`);
        const imageResult = await generateRecipeImageFlow({
          recipeName: recipe.name,
          recipeDescription: recipe.description,
        });
        recipesWithImages.push({ ...recipe, imageUrl: imageResult.imageUrl });
        console.log(`generateRecipesAction: Successfully generated image for "${recipe.name}".`);
      } catch (imageError) {
        console.warn(`generateRecipesAction: Failed to generate image for recipe "${recipe.name}":`, imageError);
        recipesWithImages.push({ ...recipe, imageUrl: undefined }); 
      }
    }
    console.log("generateRecipesAction: Finished processing. Returning success.");
    return { success: true, recipes: recipesWithImages, identifiedIngredients };

  } catch (error) {
    console.error('Error in generateRecipesAction catch block:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during action processing.';
    return { success: false, error: `Recipe generation failed: ${errorMessage}` };
  }
}

