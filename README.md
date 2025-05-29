
# PhotoRecipe - AI Powered Recipe Generator
**Author:** Kingsley Leung (Zihong Liang)  

![PhotoRecipe Open Graph Image](src/app/opengraph-image.png)  

PhotoRecipe is a Next.js application that uses AI to identify ingredients from a photo and suggests recipes. Users can upload images of their available ingredients, specify allergies, and receive AI-generated recipe ideas complete with descriptions, ingredient lists, instructions, nutritional information, and even AI-generated images for the dishes.

## Key Features

*   **Ingredient Photo Upload**: Easily upload a photo of your ingredients.
*   **AI-Driven Ingredient Identification**: Leverages AI to analyse the uploaded photo and identify food items.
*   **AI-Powered Recipe Suggestions**: Generates multiple recipe ideas based on identified ingredients and optional user-specified allergies. Each suggestion includes:
    *   Recipe Name
    *   Description
    *   Detailed Ingredient List (with quantities)
    *   Step-by-step Cooking Instructions
    *   Approximate Nutritional Information
*   **AI-Generated Recipe Images**: Creates unique images for each suggested recipe.
*   **Save & View Recipes**:
    *   Save up to 3 favourite recipes to local storage.
    *   View detailed recipe information on dedicated pages.
    *   Manage saved recipes from a "Saved Recipes" page.
*   **Responsive Design**: User-friendly interface optimised for both desktop and mobile devices.
*   **Client-Side Image Compression**: Compresses uploaded ingredient photos and generated recipe images (before saving to local storage) to optimise performance and storage.
*   **User Feedback**: Toast notifications for actions like saving recipes, reaching save limits, and errors.

## Tech Stack

*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **UI Library**: React
*   **Styling**: Tailwind CSS
*   **UI Components**: ShadCN UI
*   **AI Toolkit**: Firebase Genkit
*   **AI Models**: Google AI - Gemini models (e.g., Gemini 2.0 Flash for text and experimental image generation)
*   **State Management**: React Hooks (`useState`, `useActionState`), Custom `useLocalStorage` hook.
*   **Forms**: React Hook Form (implicitly via `useActionState` and server actions)
*   **Linting**: ESLint

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.18.0 or later recommended)
*   pnpm (or npm/yarn if you prefer, but `pnpm-lock.yaml` is provided)

### Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/KingsleyLeung03/photo-recipe.git 
    cd photo-recipe
    ```

2.  **Environment Variables**:
    This project uses Genkit with the Google AI plugin, which requires an API key.
    *   Create a `.env.local` file in the root of your project:
        ```bash
        touch .env
        ```
    *   Add your Google AI API key to the `.env` file:
        ```
        GEMINI_API_KEY=your_google_api_key_here
        ```
        You can obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

3.  **Install dependencies**:
    Using pnpm (recommended):
    ```bash
    pnpm install
    ```
    Or using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

4.  **Run the development server**:
    ```bash
    pnpm run dev
    ```
    The application should now be running on [http://localhost:9002](http://localhost:9002) (or the port specified in `package.json`).

5.  **(Optional) Run the Genkit development server**:
    To inspect Genkit flows and traces, you can run the Genkit dev server in a separate terminal:
    ```bash
    pnpm genkit:dev
    ```
    This usually starts the Genkit UI on [http://localhost:4000](http://localhost:4000).

## How to Use

1.  **Navigate** to the homepage.
2.  **Upload Photo**: Click the "Ingredient Photo" input field and select a photo of your ingredients.
3.  **Specify Allergies (Optional)**: In the "Allergies" text area, list any ingredients you want to exclude, separated by commas (e.g., "peanuts, shellfish, gluten").
4.  **Generate Recipes**: Click the "Find Recipes" button. The AI will process the image and your preferences.
5.  **Browse Results**: Recipe cards will appear with generated ideas.
6.  **View Details**: Click the "View" button on a recipe card to see its full details, including ingredients, instructions, and nutritional information.
7.  **Save/Unsave**: Click the heart icon on a recipe card or on the recipe detail page to save or unsave a recipe. You can save up to 3 recipes.
8.  **Access Saved Recipes**: Navigate to the "Saved Recipes" page using the link in the header to view your collection.

## AI Features Overview

This application leverages Genkit to orchestrate calls to Google's Gemini AI models for several key tasks:

*   **Ingredient Identification** (`src/ai/flows/identify-ingredients.ts`):
    *   Takes a photo of ingredients (as a data URI).
    *   Uses a Gemini model to analyse the image and return a list of identified food items.
*   **Recipe Suggestion** (`src/ai/flows/suggest-recipes.ts`):
    *   Takes the list of identified ingredients and any user-specified allergies.
    *   Uses a Gemini model to generate a list of recipe ideas. For each recipe, it provides:
        *   Name
        *   Description
        *   Detailed list of ingredients with quantities
        *   Step-by-step cooking instructions
        *   Approximate nutritional information
*   **Recipe Image Generation** (`src/ai/flows/generate-recipe-image-flow.ts`):
    *   Takes the recipe name and description.
    *   Uses the `gemini-2.0-flash-exp` model (or a similar image-capable model) to generate an appealing image for the recipe.
    *   The image is returned as a data URI.

Genkit configuration can be found in `src/ai/genkit.ts`, and the development entry point for Genkit flows is `src/ai/dev.ts`.

## Project Structure

A brief overview of the main directories:

*   `src/app/`: Contains the Next.js App Router pages, layouts, and server actions (`actions.ts`).
    *   `page.tsx`: Homepage.
    *   `saved/page.tsx`: Page for displaying saved recipes.
    *   `recipe/[id]/page.tsx`: Page for displaying individual recipe details.
*   `src/components/`: Reusable React components.
    *   `ui/`: ShadCN UI components.
    *   `AppLayout.tsx`, `AppHeader.tsx`: Main layout and header components.
    *   `PhotoRecipeForm.tsx`: The main form for uploading photos and specifying allergies.
    *   `RecipeCard.tsx`: Component to display a summary of a recipe.
    *   `RecipeDetailsDisplay.tsx`: Component to display full details of a recipe.
*   `src/ai/`: Genkit related files.
    *   `flows/`: Contains all the Genkit flow definitions (e.g., `identify-ingredients.ts`, `suggest-recipes.ts`).
    *   `genkit.ts`: Global Genkit AI configuration.
    *   `dev.ts`: Development entry point for Genkit to load flows.
*   `src/hooks/`: Custom React hooks like `useLocalStorage.ts` and `use-mobile.ts`.
*   `src/lib/`: Utility functions, primarily `utils.ts` for `cn`.
*   `src/types/`: TypeScript type definitions, including `AIAssistedRecipe`.
*   `src/utils/`: General utility functions, like `image-utils.ts` for client-side image compression.
*   `public/`: Static assets.

## Notes & Disclaimers

*   **AI-Generated Content**: The recipes, ingredient lists, instructions, and nutritional information are generated by AI. While the AI strives for accuracy, it's essential to double-check all information, especially regarding allergies and cooking safety, before use.
*   **Image Generation**: AI image generation is an experimental feature. The quality and relevance of images may vary. Sometimes, image generation might fail, and a placeholder will be shown.
*   **Local Storage**: Saved recipes are stored in your browser's local storage, which means they are specific to that browser and can be cleared if browser data is deleted. The current limit is 3 saved recipes due to local storage size constraints with image data.

---

This project was built with Firebase Studio.
Happy Cooking!
```
