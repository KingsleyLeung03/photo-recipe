// allergy-options.ts
'use server';

/**
 * @fileOverview Generates recipe ideas based on identified ingredients, excluding specified allergens.
 *
 * - generateRecipeIdeas - A function that generates recipe ideas based on ingredients, excluding allergens.
 * - GenerateRecipeIdeasInput - The input type for the generateRecipeIdeas function.
 * - GenerateRecipeIdeasOutput - The return type for the generateRecipeIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeIdeasInputSchema = z.object({
  ingredientsPhotoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  allergenList: z
    .array(z.string())
    .describe('A list of allergens to exclude from the recipe suggestions.'),
});
export type GenerateRecipeIdeasInput = z.infer<typeof GenerateRecipeIdeasInputSchema>;

const GenerateRecipeIdeasOutputSchema = z.object({
  recipes: z
    .array(z.string())
    .describe('A list of recipe ideas based on the ingredients, excluding allergens.'),
});
export type GenerateRecipeIdeasOutput = z.infer<typeof GenerateRecipeIdeasOutputSchema>;

export async function generateRecipeIdeas(
  input: GenerateRecipeIdeasInput
): Promise<GenerateRecipeIdeasOutput> {
  return generateRecipeIdeasFlow(input);
}

const analyzeIngredientsTool = ai.defineTool({
  name: 'analyzeIngredients',
  description: 'Analyzes a photo of ingredients to identify food items and their quantities.',
  inputSchema: z.object({
    ingredientsPhotoDataUri: z
      .string()
      .describe(
        "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
  }),
  outputSchema: z.array(z.string()).describe('A list of identified ingredients.'),
  async handler(input) {
    // Placeholder implementation - replace with actual image analysis logic
    // This example simply returns a hardcoded list of ingredients
    console.log("Calling analyzeIngredients tool.")
    return ['tomatoes', 'basil', 'mozzarella', 'olive oil'];
  },
});

const prompt = ai.definePrompt({
  name: 'generateRecipeIdeasPrompt',
  input: {schema: GenerateRecipeIdeasInputSchema},
  output: {schema: GenerateRecipeIdeasOutputSchema},
  tools: [analyzeIngredientsTool],
  prompt: `You are a recipe idea generator.  

  First, use the analyzeIngredients tool to identify the ingredients in the provided photo.  
  Then, generate a list of recipe ideas based on those ingredients, excluding any ingredients in the allergenList.

  Ingredients: {{ingredients}}
  Allergens to exclude: {{allergenList}}

  Recipes:`,
});

const generateRecipeIdeasFlow = ai.defineFlow(
  {
    name: 'generateRecipeIdeasFlow',
    inputSchema: GenerateRecipeIdeasInputSchema,
    outputSchema: GenerateRecipeIdeasOutputSchema,
  },
  async input => {
    // Call the analyzeIngredients tool to get the identified ingredients
    const ingredients = await analyzeIngredientsTool({
      ingredientsPhotoDataUri: input.ingredientsPhotoDataUri,
    });

    const {output} = await prompt({
      ...input,
      ingredients,
    });
    return output!;
  }
);
