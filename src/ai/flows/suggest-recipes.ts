// src/ai/flows/suggest-recipes.ts
'use server';

/**
 * @fileOverview Suggests a list of recipes based on identified ingredients, including details.
 *
 * - suggestRecipes - A function that suggests recipes based on ingredients.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients identified from the photo.'),
  allergies: z
    .string()
    .optional()
    .describe('A comma-separated list of allergies to exclude from the recipes.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string().describe('The name of the recipe.'),
      description: z.string().describe('A short description of the recipe.'),
      ingredients: z.array(z.string()).describe('A detailed list of ingredients with quantities (e.g., "1 cup flour", "2 eggs").'),
      instructions: z.array(z.string()).describe('Step-by-step cooking instructions.'),
      nutritionalInfo: z.string().describe('Approximate nutritional information per serving (e.g., "Calories: 350, Protein: 15g, Carbs: 40g, Fat: 10g"). Format as a single string.'),
    })
  ).describe('A list of suggested recipes based on the ingredients, including details.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: SuggestRecipesOutputSchema},
  prompt: `You are a recipe suggestion expert.

  Based on the ingredients provided, suggest a list of recipes that can be made. For each recipe, you MUST provide:
  1. A "name".
  2. A "description".
  3. A detailed list of "ingredients", including quantities (e.g., ["1 cup flour", "2 eggs"]).
  4. Step-by-step cooking "instructions" (e.g., ["Preheat oven to 350F.", "Mix flour and eggs."]).
  5. Approximate "nutritionalInfo" per serving (e.g., "Calories: 350, Protein: 15g, Carbs: 40g, Fat: 10g"). This should be a single string.

  Take into account any allergies that the user specifies and exclude those ingredients from the recipes.

  Ingredients: {{{ingredients}}}
  Allergies: {{#if allergies}}{{{allergies}}}{{else}}None{{/if}}

  Respond with the recipes in the specified JSON format.
  Recipes:`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output || !output.recipes) {
        // If the model returns nothing or an invalid structure for recipes,
        // return an empty list, which is valid per the schema.
        // The calling action already checks for an empty recipes list.
        console.warn('SuggestRecipesFlow: LLM output was null or missing recipes. Returning empty list.');
        return { recipes: [] };
      }
      return output; // Output is valid and contains a recipes array (possibly empty)
    } catch (e) {
      console.error("Error in suggestRecipesFlow's prompt execution:", e);
      // Return a schema-compliant response indicating no recipes were found.
      return { recipes: [] };
    }
  }
);
