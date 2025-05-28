
export interface AIAssistedRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutritionalInfo: string;
  imageUrl?: string; // Optional image for the recipe card
  originalIdentifiedIngredients?: string[]; // Ingredients identified by AI, used to generate this recipe
  originalAllergies?: string[]; // Allergies considered when generating this recipe
}
