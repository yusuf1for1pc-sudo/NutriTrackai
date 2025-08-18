import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDr4hwOAg1IoMD-6b4Nsy58-msbRFonGHE');

// Test function to check if API is working
export async function testGeminiAPI() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, this is a test.");
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API test failed:', error);
    throw error;
  }
}

export async function analyzeFood(imageFile: File, extraText?: string): Promise<{
  food_name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}> {
  try {
    console.log('Starting food analysis with Gemini AI...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Enhanced prompt for better nutrition analysis
    const prompt = `You are a nutrition expert. Analyze this food image and provide accurate nutritional information.

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "food_name": "Descriptive name of the food",
  "calories": number,
  "carbs": number,
  "protein": number,
  "fat": number
}

Guidelines:
- Estimate realistic portion sizes (typical serving)
- Use standard nutritional values per 100g or typical serving
- Round all numbers to whole integers
- If multiple foods are visible, analyze the main/primary food item
- For beverages, estimate based on typical serving size (250ml for drinks, 30ml for alcohol)
- For desserts/sweets, be conservative with estimates
- For fruits/vegetables, use standard USDA values
- For cooked dishes, estimate based on ingredients and cooking method

${extraText ? `Additional context: ${extraText}` : ''}

Analyze the image and return ONLY the JSON response.`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text);

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    const requiredFields = ['food_name', 'calories', 'carbs', 'protein', 'fat'];
    for (const field of requiredFields) {
      if (typeof analysis[field] === 'undefined' || analysis[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure all values are numbers
    const validatedAnalysis = {
      food_name: String(analysis.food_name),
      calories: Math.round(Number(analysis.calories)) || 0,
      carbs: Math.round(Number(analysis.carbs)) || 0,
      protein: Math.round(Number(analysis.protein)) || 0,
      fat: Math.round(Number(analysis.fat)) || 0
    };

    console.log('Validated analysis:', validatedAnalysis);
    return validatedAnalysis;

  } catch (error) {
    console.error('Food analysis failed:', error);
    
    // Provide specific error messages
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your Gemini API configuration.');
    } else if (error.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (error.message?.includes('JSON')) {
      throw new Error('Failed to parse AI response. Please try again.');
    } else {
      throw new Error('Food analysis failed. Please try again or enter manually.');
    }
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

// Mock functions for development/testing
export function getRandomFoodSuggestion(): string {
  const suggestions = [
    "Grilled chicken breast with steamed vegetables",
    "Salmon with quinoa and roasted asparagus",
    "Greek yogurt with berries and granola",
    "Avocado toast with poached eggs",
    "Buddha bowl with chickpeas and tahini dressing",
    "Smoothie bowl with banana and chia seeds",
    "Turkey and avocado wrap",
    "Lentil soup with whole grain bread",
    "Stir-fried tofu with brown rice",
    "Mediterranean salad with feta cheese"
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

export function getDailyTip(): string {
  const tips = [
    "Stay hydrated! Aim for 8 glasses of water daily.",
    "Include protein in every meal to maintain muscle mass.",
    "Eat the rainbow - colorful fruits and vegetables provide essential nutrients.",
    "Don't skip breakfast - it kickstarts your metabolism.",
    "Practice mindful eating - savor each bite and listen to your body.",
    "Plan your meals ahead to avoid unhealthy choices.",
    "Include healthy fats like avocado and nuts in your diet.",
    "Limit processed foods and added sugars.",
    "Get enough sleep - it affects your hunger hormones.",
    "Move your body daily - even a 30-minute walk helps!"
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}
