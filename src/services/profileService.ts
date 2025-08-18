import { supabase } from "@/integrations/supabase/client";
import { calculateBMR } from "@/lib/bmrCalculator";

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  age: number | null;
  gender: string | null;
  weight: number | null; // kg
  height: number | null; // cm
  activity: string | null;
  goal_type: string | null;
  daily_calories: number | null;
  carbs_goal: number | null;
  protein_goal: number | null;
  fat_goal: number | null;
  created_at: string;
  updated_at: string;
}

export interface Goals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

// Calculate goals based on profile and goal type using the new BMR calculator
export function computeGoals(profile: Profile, goalType?: string): Goals {
  const currentGoalType = goalType || profile.goal_type || 'maintain';
  
  if (!profile.weight || !profile.height || !profile.age || !profile.gender || !profile.activity) {
    return { calories: 0, carbs: 0, protein: 0, fat: 0 };
  }
  
  const goals = calculateBMR({
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    age: profile.age,
    activity: profile.activity,
    goal_type: currentGoalType,
  });
  
  return {
    calories: goals.daily_calories,
    carbs: goals.carbs_goal,
    protein: goals.protein_goal,
    fat: goals.fat_goal,
  };
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error getting profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

export async function saveProfile(profile: Partial<Profile>): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const goals = profile.goal_type ? computeGoals(profile as Profile, profile.goal_type) : {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0
    };

    const profileData = {
      ...profile,
      id: user.id,
      daily_calories: goals.calories,
      carbs_goal: goals.carbs,
      protein_goal: goals.protein,
      fat_goal: goals.fat,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error saving profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving profile:', error);
    return null;
  }
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
  try {
    const current = await getProfile();
    if (!current) return null;
    
    const updated = { ...current, ...updates };
    return await saveProfile(updated);
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

export async function isProfileComplete(): Promise<boolean> {
  const profile = await getProfile();
  return profile !== null && !!profile.name && !!profile.age && !!profile.weight && !!profile.height;
}