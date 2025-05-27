import Link from 'next/link';
import Image from 'next/image';
import type { AIAssistedRecipe } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart } from 'lucide-react';

interface RecipeCardProps {
  recipe: AIAssistedRecipe;
  isSaved: boolean;
  onToggleSave: (recipeId: string) => void;
}

export function RecipeCard({ recipe, isSaved, onToggleSave }: RecipeCardProps) {
  const placeholderImage = `https://placehold.co/600x400.png`;
  
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <div className="aspect-video relative w-full">
          <Image 
            src={recipe.imageUrl || placeholderImage} 
            alt={recipe.name} 
            layout="fill" 
            objectFit="cover" 
            className="rounded-t-lg"
            data-ai-hint="food meal"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-2">
        <CardTitle className="text-xl font-semibold line-clamp-2 h-[3em]">{recipe.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-3 h-[4.5em]">{recipe.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <Button variant="ghost" size="sm" onClick={() => onToggleSave(recipe.id)} aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'} className="flex items-center gap-1">
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`} />
          {isSaved ? 'Saved' : 'Save'}
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href={`/recipe/${recipe.id}`} className="flex items-center gap-1">
            View <Eye className="h-4 w-4"/>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
