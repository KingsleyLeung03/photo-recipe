import { config } from 'dotenv';
config();

import '@/ai/flows/allergy-options.ts';
import '@/ai/flows/identify-ingredients.ts';
import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/generate-recipe-image-flow.ts';
