import { supabase } from "@/integrations/supabase/client";
import { Meal } from "./mealService";

export interface AIAnalysisResult {
  food_name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  confidence?: number;
  portionSize?: string;
  suggestions?: string[];
}

export async function analyzeFoodWithAI(imageFile: File, extraText?: string): Promise<{ meal: Meal; analysis: AIAnalysisResult }> {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: {
        image: {
          data: base64Image,
          mimeType: imageFile.type,
        },
        extraText,
      },
    });

    if (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error analyzing food with AI:', error);
    throw error;
  }
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Generate random food suggestions for empty states
export function getRandomFoodSuggestion(): string {
  const suggestions = [
    'Try scanning a colorful salad! 🥗',
    'Upload your breakfast for tracking 🍳',
    'Snap a photo of your protein shake 🥤',
    'Track that delicious curry! 🍛',
    'Don\'t forget to log your snacks 🍎',
    'Capture your post-workout meal 💪',
    'Time to track that smoothie bowl! 🍓',
    'Log your coffee for complete tracking ☕'
  ];
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

// Mock nutrition tips
export function getDailyTip(): string {
  const tips = [
    '💡 Drink water before meals to help with portion control',
    '🥬 Add leafy greens to boost your vitamin intake',
    '🏃‍♂️ A 10-minute walk after meals aids digestion',
    '🥜 Nuts are great for healthy fats and protein',
    '⏰ Try eating your largest meal earlier in the day',
    '🌈 Eat a rainbow of colors for diverse nutrients',
    '🍎 Keep healthy snacks visible and junk food hidden',
    '💧 Staying hydrated can reduce unnecessary snacking'
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}
