# NutriTrackAI Backend Setup Guide

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```
   VITE_GEMINI_API_KEY=AIzaSyDr4hwOAg1IoMD-6b4Nsy58-msbRFonGHE
   ```

3. **Database Setup**
   The Supabase database is already configured with the required tables:
   - `profiles` - User profiles with BMR calculations
   - `meals` - Food tracking with AI analysis
   - `streaks` - User streak tracking
   - `settings` - User preferences

4. **Run the Application**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Profiles Table
- `id` (uuid, pk) → auth.uid()
- `email` (text)
- `gender` (text)
- `age` (int)
- `weight` (float)
- `height` (float)
- `activity` (text)
- `goal_type` (text) → "cut" | "maintain" | "bulk"
- `daily_calories` (int)
- `carbs_goal` (int)
- `protein_goal` (int)
- `fat_goal` (int)

### Meals Table
- `id` (uuid, pk)
- `user_id` (uuid) → references profiles.id
- `meal_name` (text)
- `food_name` (text)
- `calories` (int)
- `carbs` (int)
- `protein` (int)
- `fat` (int)
- `meal_time` (timestamptz)
- `source` (text) → "ai" | "manual"

### Streaks Table
- `id` (uuid, pk)
- `user_id` (uuid)
- `current_streak` (int)
- `longest_streak` (int)
- `last_logged` (date)

### Settings Table
- `id` (uuid, pk)
- `user_id` (uuid)
- `theme` (text)
- `notifications` (boolean)

## 🔢 BMR + Goals Logic

The application uses the Mifflin-St Jeor equation for BMR calculation:

```typescript
// Male: 10 × weight + 6.25 × height - 5 × age + 5
// Female: 10 × weight + 6.25 × height - 5 × age - 161
```

Activity multipliers:
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Active: 1.725
- Very Active: 1.9

Goal adjustments:
- Cut: -500 calories
- Bulk: +500 calories
- Maintain: No adjustment

## 🤖 Gemini AI Integration

The AI food analysis is implemented using Google's Gemini Vision API:

1. **Client-side**: `src/services/aiClientService.ts` - Handles image upload and API calls
2. **Server-side**: `supabase/functions/analyze-food/index.ts` - Edge function for secure API calls
3. **Fallback**: If AI fails, the system provides reasonable defaults

### AI Analysis Flow
1. User uploads food image
2. Image is converted to base64
3. Sent to Supabase Edge Function
4. Edge Function calls Gemini Vision API
5. AI returns structured nutrition data
6. Meal is automatically saved to database
7. User can edit the AI results

## 🔥 Streak Logic

Each time a meal is logged:
- If `last_logged` is yesterday → increment `current_streak`
- If `last_logged` is today → streak unchanged
- If gap > 1 day → reset streak to 1
- Always update `longest_streak` if current streak exceeds it

## ✅ Features Implemented

- ✅ Supabase authentication and database
- ✅ BMR calculation with activity and goal adjustments
- ✅ Gemini AI food analysis with image upload
- ✅ Meal tracking with AI and manual entry
- ✅ Streak tracking with proper logic
- ✅ User profiles with automatic goal calculation
- ✅ Row Level Security (RLS) on all tables
- ✅ Responsive UI with modern design
- ✅ Real-time data updates

## 🛠️ Development

### Key Files
- `src/lib/bmrCalculator.ts` - BMR calculation logic
- `src/services/aiClientService.ts` - AI integration
- `src/services/mealService.ts` - Meal management
- `src/services/profileService.ts` - Profile management
- `supabase/functions/analyze-food/index.ts` - AI Edge Function

### Database Migrations
- `supabase/migrations/20250818105451_*.sql` - Initial schema
- `supabase/migrations/20250818110000_update_schema.sql` - Updated schema

## 🚀 Deployment

1. **Supabase**: Database and Edge Functions are already deployed
2. **Frontend**: Deploy to Vercel, Netlify, or any static hosting
3. **Environment**: Set `VITE_GEMINI_API_KEY` in production

## 🔧 Troubleshooting

### Common Issues
1. **AI Analysis Fails**: Check Gemini API key and quota
2. **Database Errors**: Verify Supabase connection and RLS policies
3. **Image Upload Issues**: Check file size and format restrictions

### Debug Mode
Enable debug logging by setting `VITE_DEBUG=true` in environment variables.

## 📱 Mobile Support

The application is fully responsive and supports:
- Camera capture for food photos
- Touch-friendly interface
- Offline capability (with sync when online)
- PWA features for app-like experience
