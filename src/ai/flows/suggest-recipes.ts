// src/ai/flows/suggest-recipes.ts
'use server';

/**
 * @fileOverview Suggests a list of recipes based on identified ingredients.
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
    })
  ).describe('A list of suggested recipes based on the ingredients.'),
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

  Based on the ingredients provided, suggest a list of recipes that can be made.  Take into account any allergies that the user specifies and exclude those ingredients from the recipes.

  Ingredients: {{{ingredients}}}
  Allergies: {{#if allergies}}{{{allergies}}}{{else}}None{{/if}}

  Recipes:`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
