'use server';
/**
 * @fileOverview Generates an image for a given recipe.
 *
 * - generateRecipeImage - A function that generates an image for a recipe.
 * - GenerateRecipeImageInput - The input type for the generateRecipeImage function.
 * - GenerateRecipeImageOutput - The return type for the generateRecipeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeImageInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  recipeDescription: z.string().describe('A short description of the recipe to guide image generation.'),
});
export type GenerateRecipeImageInput = z.infer<typeof GenerateRecipeImageInputSchema>;

const GenerateRecipeImageOutputSchema = z.object({
  imageUrl: z.string().describe("The generated image for the recipe as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateRecipeImageOutput = z.infer<typeof GenerateRecipeImageOutputSchema>;

export async function generateRecipeImage(input: GenerateRecipeImageInput): Promise<GenerateRecipeImageOutput> {
  return generateRecipeImageFlow(input);
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Use this model for image generation
      prompt: `Generate an appealing, photorealistic image of a prepared dish called "${input.recipeName}". 
      Description: "${input.recipeDescription}". 
      The image should be suitable for a recipe card or website, well-lit, and appetizing. Focus on the food itself.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or did not return a valid image URL.');
    }
    
    return { imageUrl: media.url };
  }
);
