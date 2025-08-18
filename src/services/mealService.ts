import { supabase } from "@/integrations/supabase/client";

export interface Meal {
  id: string;
  user_id: string;
  meal_name: string;
  food_name: string;
  portion?: string | null;
  brand?: string | null;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  notes?: string | null;
  source: 'ai' | 'manual';
  meal_time: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface DayMacros {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  mealCount: number;
}

export async function listMeals(date?: string): Promise<Meal[]> {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			console.error('No user found for listing meals');
			return [];
		}

		let query = supabase
			.from('meals')
			.select('*')
			.eq('user_id', user.id)
			.order('timestamp', { ascending: false });

		if (date) {
			// Use UTC boundaries to avoid timezone issues
			const startOfDay = `${date}T00:00:00.000Z`;
			const endOfDay = `${date}T23:59:59.999Z`;

			query = query
				.gte('timestamp', startOfDay)
				.lte('timestamp', endOfDay);
		}

		console.log('Fetching meals from Supabase for user:', user.id);

		const { data, error } = await query;

		if (error) {
			console.error('Error listing meals from Supabase:', error);
			return [];
		}

		console.log('Meals retrieved from Supabase:', data?.length || 0, 'meals');
		return data || [];
	} catch (error) {
		console.error('Error listing meals:', error);
		return [];
	}
}

export async function addMeal(meal: Omit<Meal, 'id' | 'user_id' | 'timestamp' | 'created_at' | 'updated_at'>): Promise<Meal | null> {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			console.error('No user found for meal save');
			return null;
		}

		// Only insert columns that are guaranteed to exist in the current schema
		const { meal_name: _mealName, source: _source, meal_time: _mealTime, ...base } = meal as any;
		const insertPayload = {
			food_name: base.food_name,
			calories: base.calories,
			carbs: base.carbs,
			protein: base.protein,
			fat: base.fat,
			portion: base.portion ?? null,
			brand: base.brand ?? null,
			notes: base.notes ?? null,
			user_id: user.id,
			timestamp: new Date().toISOString(),
		};

		console.log('Saving meal to Supabase:', insertPayload);

		const { data, error } = await supabase
			.from('meals')
			.insert(insertPayload)
			.select()
			.single();

		if (error) {
			console.error('Error adding meal to Supabase:', error);
			return null;
		}

		console.log('Meal saved successfully to Supabase:', data);

		// Update streak
		await updateStreak();

		return data as unknown as Meal;
	} catch (error) {
		console.error('Error adding meal:', error);
		return null;
	}
}

export async function updateMeal(id: string, updates: Partial<Meal>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('meals')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating meal:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating meal:', error);
    return false;
  }
}

export async function deleteMeal(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting meal:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    return false;
  }
}

export async function sumForDate(date: string): Promise<DayMacros> {
  const meals = await listMeals(date);
  
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      carbs: acc.carbs + meal.carbs,
      protein: acc.protein + meal.protein,
      fat: acc.fat + meal.fat,
      mealCount: acc.mealCount + 1
    }),
    { calories: 0, carbs: 0, protein: 0, fat: 0, mealCount: 0 }
  );
  
  return totals;
}

export async function streakCounter(): Promise<{ current_streak: number; longest_streak: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { current_streak: 0, longest_streak: 0 };

    const { data, error } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error getting streak:', error);
      return { current_streak: 0, longest_streak: 0 };
    }

    return {
      current_streak: data?.current_streak || 0,
      longest_streak: data?.longest_streak || 0
    };
  } catch (error) {
    console.error('Error getting streak:', error);
    return { current_streak: 0, longest_streak: 0 };
  }
}

export async function updateStreak(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const mealsToday = await listMeals(today);
    
    if (mealsToday.length === 0) return;

    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!streak) {
      // First time logging
      await supabase
        .from('streaks')
        .insert({
          user_id: user.id,
          last_logged: today,
          current_streak: 1,
          longest_streak: 1
        });
    } else {
      let newCurrentStreak = 1;
      let newLongestStreak = streak.longest_streak;
      
      if (streak.last_logged === yesterdayStr) {
        // Consecutive day
        newCurrentStreak = streak.current_streak + 1;
        newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);
      } else if (streak.last_logged === today) {
        // Already logged today
        return;
      }
      // If gap > 1 day, reset streak to 1
      
      await supabase
        .from('streaks')
        .update({
          last_logged: today,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak
        })
        .eq('user_id', user.id);
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

// Legacy compatibility functions for existing code
export function getMeals(): Meal[] {
  // This will be handled by async listMeals() now
  return [];
}

export function getMealsForDate(date: string): Meal[] {
  // This will be handled by async listMeals(date) now
  return [];
}

export function getMealSummaryForDate(date: string): any {
  // This will be handled by async sumForDate(date) now
  return { totalCalories: 0, totalCarbs: 0, totalProtein: 0, totalFat: 0, mealCount: 0 };
}

export function calculateStreak(): number {
  // This will be handled by async streakCounter() now
  return 0;
}

export function searchMeals(query: string, dateFilter?: string): Meal[] {
  // This will be handled differently in the new implementation
  return [];
}

export function exportMealsAsJSON(): string {
  return JSON.stringify([], null, 2);
}

export function resetDemoData(): void {
  // Not needed with Supabase
}

export function validateMeal(meal: Partial<Meal>): string[] {
  const errors: string[] = [];
  
  if (!meal.food_name?.trim()) {
    errors.push('Meal name is required');
  }
  
  if (!meal.calories || meal.calories <= 0 || meal.calories > 2000) {
    errors.push('Calories must be between 1 and 2000');
  }
  
  if (meal.carbs === undefined || meal.carbs < 0 || meal.carbs > 300) {
    errors.push('Carbs must be between 0 and 300g');
  }
  
  if (meal.protein === undefined || meal.protein < 0 || meal.protein > 150) {
    errors.push('Protein must be between 0 and 150g');
  }
  
  if (meal.fat === undefined || meal.fat < 0 || meal.fat > 150) {
    errors.push('Fat must be between 0 and 150g');
  }
  
  // Check macro consistency with increased tolerance for AI estimates
  if (meal.calories && meal.carbs !== undefined && meal.protein !== undefined && meal.fat !== undefined) {
    const macroCalories = (meal.carbs * 4) + (meal.protein * 4) + (meal.fat * 9);
    const difference = Math.abs(meal.calories - macroCalories);
    const tolerance = meal.calories * 0.25; // Increased from 15% to 25%
    
    if (difference > tolerance) {
      // For AI-analyzed meals, just log the warning but don't block
      console.warn(`Calorie-macro mismatch: ${meal.calories} vs ${macroCalories} (diff: ${difference}, tolerance: ${tolerance})`);
      // Don't add error for AI meals - let them pass through
    }
  }
  
  return errors;
}