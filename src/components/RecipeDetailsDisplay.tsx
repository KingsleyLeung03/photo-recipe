import type { AIAssistedRecipe } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Utensils, ListChecks,ClipboardList, Info } from 'lucide-react';
import Image from 'next/image';

interface RecipeDetailsDisplayProps {
  recipe: AIAssistedRecipe;
}

export function RecipeDetailsDisplay({ recipe }: RecipeDetailsDisplayProps) {
  const placeholderImage = `https://placehold.co/800x400.png`;

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 shadow-xl rounded-lg">
      <CardHeader className="p-0">
         <div className="aspect-[2/1] relative w-full rounded-t-lg overflow-hidden">
          <Image 
            src={recipe.imageUrl || placeholderImage} 
            alt={recipe.name} 
            layout="fill" 
            objectFit="cover" 
            className="rounded-t-lg"
            data-ai-hint="prepared food"
            priority
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <CardTitle className="text-3xl md:text-4xl font-bold mb-2 text-primary">{recipe.name}</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mb-6">{recipe.description}</CardDescription>
        
        { (recipe.originalIdentifiedIngredients && recipe.originalIdentifiedIngredients.length > 0) || (recipe.originalAllergies && recipe.originalAllergies.length > 0) ? (
          <div className="mb-6 p-4 bg-secondary/50 rounded-md">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center"><Info className="h-4 w-4 mr-2 text-primary" />Generation Context:</h3>
            {recipe.originalIdentifiedIngredients && recipe.originalIdentifiedIngredients.length > 0 && (
              <p className="text-xs text-muted-foreground mb-1">
                <span className="font-medium">Identified Ingredients:</span> {recipe.originalIdentifiedIngredients.join(', ')}
              </p>
            )}
            {recipe.originalAllergies && recipe.originalAllergies.length > 0 && (
               <p className="text-xs text-muted-foreground">
                <span className="font-medium">Allergies Considered:</span> {recipe.originalAllergies.join(', ')}
              </p>
            )}
          </div>
        ) : null}


        <Separator className="my-6" />

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4 flex items-center"><ListChecks className="h-6 w-6 mr-2 text-primary" />Ingredients</h3>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ScrollArea className="h-48 pr-3">
                <ul className="list-disc list-inside space-y-1 text-foreground">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground italic">Detailed ingredient list coming soon! Our AI is still learning to perfect this part.</p>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-4 flex items-center"><Utensils className="h-6 w-6 mr-2 text-primary" />Instructions</h3>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <ScrollArea className="h-48 pr-3">
                <ol className="list-decimal list-inside space-y-2 text-foreground">
                  {recipe.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground italic">Step-by-step instructions are being cooked up! Check back later.</p>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        <div>
          <h3 className="text-2xl font-semibold mb-4 flex items-center"><ClipboardList className="h-6 w-6 mr-2 text-primary" />Nutritional Information (Approximate)</h3>
          {recipe.nutritionalInfo ? (
            <p className="text-foreground whitespace-pre-wrap">{recipe.nutritionalInfo}</p>
          ) : (
            <p className="text-muted-foreground italic">Nutritional information is not yet available for this recipe. Our AI is working on it!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
