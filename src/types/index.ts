
export interface AIAssistedRecipe {
  id: string;
  name: string;
  description: string;
  // These are based on the AI output, which doesn't include detailed ingredients/instructions
  // We'll add placeholders in the UI for these.
  ingredients?: string[]; // Placeholder for detailed list
  instructions?: string[]; // Placeholder for detailed steps
  nutritionalInfo?: string; // Placeholder
  imageUrl?: string; // Optional image for the recipe card
  originalIdentifiedIngredients?: string[]; // Ingredients identified by AI, used to generate this recipe
  originalAllergies?: string[]; // Allergies considered when generating this recipe
}
