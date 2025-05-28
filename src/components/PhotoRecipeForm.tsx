
"use client";

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useRef, useEffect, useActionState, startTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ImageUp, Sparkles, Tag, X, Loader2, Info } from 'lucide-react';
import { generateRecipesAction, type RecipeGenerationResult } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

interface PhotoRecipeFormProps {
  onRecipeGenerationResult: (result: RecipeGenerationResult | null, isLoading: boolean) => void;
}

const initialState: RecipeGenerationResult | null = null;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_IMAGE_DIMENSION = 1024; // Max width or height for compressed image
const IMAGE_COMPRESSION_QUALITY = 0.7; // JPEG quality (0.0 to 1.0)

export function PhotoRecipeForm({ onRecipeGenerationResult }: PhotoRecipeFormProps) {
  const [actionState, formAction, isActionPending] = useActionState(generateRecipesAction, initialState);
  const { toast } = useToast();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // Keep original file for name/type if needed
  const [allergiesInput, setAllergiesInput] = useState<string>('');
  const [allergiesTags, setAllergiesTags] = useState<string[]>([]);

  const hiddenPhotoDataUriRef = useRef<HTMLInputElement>(null);

  // Effect to notify parent about the current actionState and pending status
  useEffect(() => {
    onRecipeGenerationResult(actionState, isActionPending);
  }, [actionState, isActionPending, onRecipeGenerationResult]);

  // Effect to show toasts when an action completes
  useEffect(() => {
    if (!isActionPending && actionState !== initialState) { // Only when action state changes from initial AND is not pending
      if (actionState?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: actionState.error,
        });
      } else if (actionState?.success && actionState.recipes) {
         toast({
          title: "Recipes Generated!",
          description: `Found ${actionState.recipes.length} recipe ideas.`,
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionState, isActionPending]);


  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) { // broader check for image/*
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: `Please upload a valid image file (e.g., JPG, PNG, WEBP). Selected type: ${file.type}`,
        });
        event.target.value = ""; 
        setPhotoPreview(null);
        setPhotoFile(null);
        if (hiddenPhotoDataUriRef.current) {
          hiddenPhotoDataUriRef.current.value = "";
        }
        return;
      }
      
      setPhotoFile(file); // Store the original file

      const reader = new FileReader();
      reader.onloadend = () => {
        const originalDataUrl = reader.result as string;
        
        const img = document.createElement('img');
        img.onload = () => {
          let { width, height } = img;
          
          if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
              width = MAX_IMAGE_DIMENSION;
            } else {
              width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
              height = MAX_IMAGE_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Prefer JPEG for photos for better compression, PNG otherwise or if original was PNG
            // However, for simplicity and broad compatibility, always outputting JPEG is often fine for model input.
            const compressedDataUrl = canvas.toDataURL('image/jpeg', IMAGE_COMPRESSION_QUALITY);
            setPhotoPreview(compressedDataUrl);
            if (hiddenPhotoDataUriRef.current) {
              hiddenPhotoDataUriRef.current.value = compressedDataUrl;
            }
          } else {
            // Fallback to original if canvas context fails (should be rare)
            setPhotoPreview(originalDataUrl);
            if (hiddenPhotoDataUriRef.current) {
              hiddenPhotoDataUriRef.current.value = originalDataUrl;
            }
            toast({variant: "destructive", title: "Compression Error", description: "Could not compress image, using original."})
          }
        };
        img.onerror = () => {
            // Fallback if image can't be loaded (e.g. HEIC on unsupported browser without polyfill)
            setPhotoPreview(originalDataUrl); // Use original if compression fails
            if (hiddenPhotoDataUriRef.current) {
                hiddenPhotoDataUriRef.current.value = originalDataUrl;
            }
            toast({variant: "destructive", title: "Image Load Error", description: "Could not load image for compression, using original."})
        };
        img.src = originalDataUrl;
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
    if (!hiddenPhotoDataUriRef.current?.value && !photoPreview) { // Check if there's data to send
      toast({ variant: "destructive", title: "No Photo", description: "Please upload and process a photo of your ingredients." });
      return;
    }

    const formData = new FormData(event.currentTarget);
    if (hiddenPhotoDataUriRef.current?.value) {
      formData.set('photoDataUri', hiddenPhotoDataUriRef.current.value);
    } else if (photoPreview) { 
      // This case should ideally not be hit if compression works and sets the ref
      formData.set('photoDataUri', photoPreview);
    } else {
      toast({ variant: "destructive", title: "Photo Error", description: "Could not process photo. Please re-upload." });
      return;
    }
    
    startTransition(() => {
      formAction(formData);
    });
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
              name="photoFile" 
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              onChange={handlePhotoChange}
              className="file:text-primary file:font-semibold hover:file:bg-primary/10"
              required
              disabled={isActionPending}
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
              name="allergies" 
              placeholder="e.g., gluten, nuts, dairy (comma-separated)"
              value={allergiesInput}
              onChange={handleAllergiesInputChange}
              rows={2}
              disabled={isActionPending}
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
                      disabled={isActionPending}
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
          <Button type="submit" className="w-full text-lg py-6" disabled={isActionPending || (!photoPreview && !hiddenPhotoDataUriRef.current?.value)}>
            {isActionPending ? (
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
       <div className="px-6 pb-4 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Info className="h-3 w-3" />
            AI-generated content. Please verify critical information, like allergy details.
          </p>
        </div>
      {!isActionPending && actionState?.error && (
         <CardFooter>
            <div role="alert" className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2 text-sm w-full">
                <AlertCircle className="h-5 w-5" />
                <span>{actionState.error}</span>
            </div>
         </CardFooter>
      )}
    </Card>
  );
}
