
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
    try {
      console.log(`generateRecipeImageFlow: Generating image for "${input.recipeName}"...`);
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Use this model for image generation
        prompt: `Generate an appealing, photorealistic image of a prepared dish called "${input.recipeName}". 
        Description: "${input.recipeDescription}". 
        The image should be suitable for a recipe card or website, well-lit, and appetizing. Focus on the food itself. Ensure a clean, high-quality food photography style.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
        },
      });

      if (!media?.url) {
        console.warn(`generateRecipeImageFlow: Image generation for "${input.recipeName}" produced no media URL. Media object:`, media);
        throw new Error('Image generation failed to produce a valid image URL.');
      }
      console.log(`generateRecipeImageFlow: Successfully generated image for "${input.recipeName}", URL length: ${media.url.length}`);
      return { imageUrl: media.url };

    } catch (error) {
      console.error(`Error in generateRecipeImageFlow for recipe "${input.recipeName}":`, error);
      // This error will be caught by the try/catch in actions.ts, 
      // which will then add the recipe without an image.
      throw new Error(`Failed to generate image for ${input.recipeName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);

