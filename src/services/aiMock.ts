import { Meal } from './mealService';

export interface AIAnalysisResult {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  confidence: number;
  portionSize?: string;
  suggestions?: string[];
}

// Mock food database for realistic analysis
const mockFoodDatabase = [
  {
    keywords: ['rice', 'dal', 'chawal', 'lentil'],
    result: {
      name: 'Dal Chawal',
      calories: 420,
      carbs: 68,
      protein: 14,
      fat: 7,
      confidence: 0.92,
      portionSize: '1 cup each',
      suggestions: ['Add vegetables for more nutrients', 'Consider brown rice for fiber']
    }
  },
  {
    keywords: ['pizza', 'margherita', 'cheese'],
    result: {
      name: 'Margherita Pizza',
      calories: 680,
      carbs: 75,
      protein: 28,
      fat: 32,
      confidence: 0.88,
      portionSize: '2 slices',
      suggestions: ['High in calories - consider sharing', 'Add a salad for balance']
    }
  },
  {
    keywords: ['burger', 'chicken', 'fried'],
    result: {
      name: 'Chicken Burger',
      calories: 520,
      carbs: 45,
      protein: 32,
      fat: 24,
      confidence: 0.85,
      portionSize: '1 burger',
      suggestions: ['Remove the fries to reduce calories', 'Ask for grilled instead of fried']
    }
  },
  {
    keywords: ['salad', 'caesar', 'chicken'],
    result: {
      name: 'Chicken Caesar Salad',
      calories: 380,
      carbs: 12,
      protein: 35,
      fat: 22,
      confidence: 0.90,
      portionSize: '1 bowl',
      suggestions: ['Great protein choice!', 'Ask for dressing on the side']
    }
  },
  {
    keywords: ['pasta', 'spaghetti', 'bolognese'],
    result: {
      name: 'Spaghetti Bolognese',
      calories: 560,
      carbs: 65,
      protein: 26,
      fat: 18,
      confidence: 0.87,
      portionSize: '1 cup',
      suggestions: ['Good protein from meat sauce', 'Consider whole wheat pasta']
    }
  },
  {
    keywords: ['coffee', 'latte', 'cappuccino'],
    result: {
      name: 'Coffee Latte',
      calories: 150,
      carbs: 12,
      protein: 8,
      fat: 8,
      confidence: 0.95,
      portionSize: '12 oz',
      suggestions: ['Switch to almond milk to reduce calories', 'Add cinnamon for flavor without calories']
    }
  },
  {
    keywords: ['sandwich', 'turkey', 'club'],
    result: {
      name: 'Turkey Club Sandwich',
      calories: 480,
      carbs: 42,
      protein: 28,
      fat: 22,
      confidence: 0.83,
      portionSize: '1 sandwich',
      suggestions: ['Lean protein choice', 'Skip the mayo to reduce fat']
    }
  },
  {
    keywords: ['smoothie', 'banana', 'protein'],
    result: {
      name: 'Banana Protein Smoothie',
      calories: 320,
      carbs: 35,
      protein: 25,
      fat: 8,
      confidence: 0.91,
      portionSize: '16 oz',
      suggestions: ['Perfect post-workout meal', 'Add spinach for extra nutrients']
    }
  },
  {
    keywords: ['chocolate', 'kitkat', 'candy'],
    result: {
      name: 'KitKat Chocolate Bar',
      calories: 210,
      carbs: 27,
      protein: 3,
      fat: 11,
      confidence: 0.96,
      portionSize: '1 bar (41.5g)',
      suggestions: ['High in sugar - enjoy in moderation', 'Consider dark chocolate for antioxidants']
    }
  },
  {
    keywords: ['apple', 'fruit', 'snack'],
    result: {
      name: 'Medium Apple',
      calories: 95,
      carbs: 25,
      protein: 0,
      fat: 0,
      confidence: 0.98,
      portionSize: '1 medium apple',
      suggestions: ['Great healthy snack!', 'Pair with nuts for protein']
    }
  }
];

// Simulate AI analysis with realistic delay and confidence
export async function analyzeFood(imageFile: File, userInput?: string): Promise<AIAnalysisResult> {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Try to match based on filename or user input
  const searchText = userInput || imageFile.name || '';
  const searchLower = searchText.toLowerCase();
  
  // Find matching food item
  const match = mockFoodDatabase.find(item =>
    item.keywords.some(keyword => searchLower.includes(keyword))
  );
  
  if (match) {
    return {
      ...match.result,
      // Add some randomness to make it feel more realistic
      calories: match.result.calories + Math.floor(Math.random() * 20 - 10),
      confidence: Math.max(0.7, match.result.confidence + (Math.random() * 0.1 - 0.05))
    };
  }
  
  // Default fallback
  return {
    name: 'Unknown Food Item',
    calories: 250 + Math.floor(Math.random() * 300),
    carbs: 30 + Math.floor(Math.random() * 20),
    protein: 10 + Math.floor(Math.random() * 15),
    fat: 8 + Math.floor(Math.random() * 12),
    confidence: 0.6 + Math.random() * 0.2,
    portionSize: '1 serving',
    suggestions: [
      'Please verify the nutrition information',
      'Consider adding portion details for accuracy'
    ]
  };
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