"use client";

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useRef, useEffect, useActionState } from 'react'; // Changed import
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ImageUp, Sparkles, Tag, X, Loader2 } from 'lucide-react';
import { generateRecipesAction, type RecipeGenerationResult } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

interface PhotoRecipeFormProps {
  onRecipeGenerationResult: (result: RecipeGenerationResult | null, isLoading: boolean) => void;
}

const initialState: RecipeGenerationResult | null = null;

export function PhotoRecipeForm({ onRecipeGenerationResult }: PhotoRecipeFormProps) {
  const [state, formAction] = useActionState(generateRecipesAction, initialState); // Changed to useActionState
  const { toast } = useToast();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [allergiesInput, setAllergiesInput] = useState<string>(''); 
  const [allergiesTags, setAllergiesTags] = useState<string[]>([]); 
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const hiddenPhotoDataUriRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onRecipeGenerationResult(state, isLoadingForm); // Use isLoadingForm here
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
    if (state?.success && state.recipes) {
       toast({
        title: "Recipes Generated!",
        description: `Found ${state.recipes.length} recipe ideas.`,
      });
    }
    setIsLoadingForm(false); 
  }, [state, toast, onRecipeGenerationResult]);


  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        if (hiddenPhotoDataUriRef.current) {
          hiddenPhotoDataUriRef.current.value = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
      setPhotoFile(null);
      if (hiddenPhotoDataUriRef.current) {
          hiddenPhotoDataUriRef.current.value = "";
        }
    }
  };
  
  const handleAllergiesInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setAllergiesInput(value);
    const newTags = value.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setAllergiesTags(newTags);
  };

  const removeAllergyTag = (tagToRemove: string) => {
    const newTags = allergiesTags.filter(tag => tag !== tagToRemove);
    setAllergiesTags(newTags);
    setAllergiesInput(newTags.join(', '));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!photoFile) {
      toast({ variant: "destructive", title: "No Photo", description: "Please upload a photo of your ingredients." });
      return;
    }
    setIsLoadingForm(true);
    onRecipeGenerationResult(null, true); 
    
    const formData = new FormData(event.currentTarget);
    // Ensure photoDataUri is set from the ref if available, otherwise it might be stale
    if (hiddenPhotoDataUriRef.current?.value) {
      formData.set('photoDataUri', hiddenPhotoDataUriRef.current.value);
    } else if (photoPreview) { // Fallback if ref not updated, though less ideal
      formData.set('photoDataUri', photoPreview);
    }
    formData.set('allergies', allergiesInput);

    formAction(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Discover Your Next Meal
        </CardTitle>
        <CardDescription>
          Upload a photo of your ingredients, tell us about any allergies, and let our AI whip up some recipe ideas for you!
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="photo" className="text-lg font-semibold flex items-center gap-1">
              <ImageUp className="h-5 w-5" /> Ingredient Photo
            </Label>
            <Input
              id="photo"
              name="photoFile" // Name for file input, not directly used by action but good practice
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="file:text-primary file:font-semibold hover:file:bg-primary/10"
              required
            />
            <input type="hidden" name="photoDataUri" ref={hiddenPhotoDataUriRef} />
            {photoPreview && (
              <div className="mt-4 relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden border-2 border-primary shadow-md">
                <Image src={photoPreview} alt="Ingredients preview" layout="fill" objectFit="cover" data-ai-hint="food ingredients"/>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-lg font-semibold flex items-center gap-1">
              <Tag className="h-5 w-5" /> Allergies (Optional)
            </Label>
            <Textarea
              id="allergies"
              name="allergies" // This name will be used by FormData
              placeholder="e.g., gluten, nuts, dairy (comma-separated)"
              value={allergiesInput}
              onChange={handleAllergiesInputChange}
              rows={2}
            />
             {allergiesTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {allergiesTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-0.5">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-1 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAllergyTag(tag)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tag}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Separate multiple allergies with a comma.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoadingForm}>
            {isLoadingForm ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Generating Recipes...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Find Recipes
              </>
            )}
          </Button>
        </CardFooter>
      </form>
      {state?.error && !isLoadingForm && ( // Check isLoadingForm here
         <CardFooter>
            <div role="alert" className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2 text-sm w-full">
                <AlertCircle className="h-5 w-5" />
                <span>{state.error}</span>
            </div>
         </CardFooter>
      )}
    </Card>
  );
}
