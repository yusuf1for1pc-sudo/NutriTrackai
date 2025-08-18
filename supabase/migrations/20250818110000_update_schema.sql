-- Update meals table to add source field and meal_name
ALTER TABLE public.meals 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('ai', 'manual')),
ADD COLUMN IF NOT EXISTS meal_name TEXT;

-- Update existing meals to have meal_name = food_name if meal_name is null
UPDATE public.meals 
SET meal_name = food_name 
WHERE meal_name IS NULL;

-- Make meal_name NOT NULL after setting default values
ALTER TABLE public.meals 
ALTER COLUMN meal_name SET NOT NULL;

-- Update streaks table to match requirements
ALTER TABLE public.streaks 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;

-- Update existing streaks to have proper values
UPDATE public.streaks 
SET current_streak = COALESCE(streak_count, 0),
    longest_streak = COALESCE(streak_count, 0)
WHERE current_streak IS NULL OR longest_streak IS NULL;

-- Make current_streak and longest_streak NOT NULL
ALTER TABLE public.streaks 
ALTER COLUMN current_streak SET NOT NULL,
ALTER COLUMN longest_streak SET NOT NULL;

-- Drop the old streak_count column
ALTER TABLE public.streaks 
DROP COLUMN IF EXISTS streak_count;

-- Update settings table to match requirements
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS notifications BOOLEAN DEFAULT true;

-- Update profiles table to ensure all required fields exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles to have email from auth.users
UPDATE public.profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE public.profiles.id = auth.users.id 
AND public.profiles.email IS NULL;

-- Add email policy
CREATE POLICY IF NOT EXISTS "Users can view own profile email" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meals_user_id_timestamp ON public.meals(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_meals_source ON public.meals(source);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);
