export function calculateBMR({
  gender,
  weight,
  height,
  age,
  activity,
  goal_type,
}: {
  gender: string;
  weight: number;
  height: number;
  age: number;
  activity: string;
  goal_type: string;
}) {
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const activityFactor = activityMultipliers[activity] || 1.2;

  let calories = bmr * activityFactor;
  if (goal_type === "cut") calories -= 500;
  if (goal_type === "bulk") calories += 500;

  const carbs = Math.round((calories * 0.4) / 4);
  const protein = Math.round((calories * 0.3) / 4);
  const fat = Math.round((calories * 0.3) / 9);

  return {
    daily_calories: Math.round(calories),
    carbs_goal: carbs,
    protein_goal: protein,
    fat_goal: fat,
  };
}
