import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, 
  Camera, 
  Heart, 
  Zap, 
  Sword, 
  Shield, 
  Flame,
  Settings,
  History,
  Calendar,
  TestTube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { getProfile, computeGoals } from "@/services/profileService";
import { sumForDate, listMeals, streakCounter, addMeal } from "@/services/mealService";
import { getDailyTip } from "@/services/aiClientService";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [todaysSummary, setTodaysSummary] = useState<any>(null);
  const [todaysMeals, setTodaysMeals] = useState<any[]>([]);
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [goals, setGoals] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // Test function to verify Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test saving a meal
      const testMeal = {
        meal_name: 'Test Meal',
        food_name: 'Test Food',
        calories: 100,
        carbs: 20,
        protein: 5,
        fat: 2,
        portion: '1 serving',
        brand: 'Test Brand',
        notes: 'Test meal for Supabase verification',
        source: 'manual' as const,
        meal_time: new Date().toISOString(),
      };

      const savedMeal = await addMeal(testMeal);
      if (savedMeal) {
        console.log('✅ Test meal saved successfully:', savedMeal);
        toast({
          title: "Supabase Test Success!",
          description: "Test meal saved and retrieved successfully.",
        });
        
        // Test retrieving meals
        const meals = await listMeals();
        console.log('✅ Meals retrieved successfully:', meals.length, 'meals');
        
        // Clean up test meal
        // Note: In production, you might want to delete the test meal
      } else {
        console.error('❌ Failed to save test meal');
        toast({
          title: "Supabase Test Failed",
          description: "Could not save test meal to database.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Supabase test error:', error);
      toast({
        title: "Supabase Test Error",
        description: "Error testing database connection.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    const loadData = async () => {
      try {
        console.log('Loading dashboard data...');
        const profileData = await getProfile();
        console.log('Profile data:', profileData);
        
        if (!profileData) {
          console.log('No profile found, redirecting to onboarding');
          navigate("/onboarding");
          return;
        }
        
        setProfile(profileData);
        const computedGoals = computeGoals(profileData);
        console.log('Computed goals:', computedGoals);
        setGoals(computedGoals);
        
        const today = new Date().toISOString().split('T')[0];
        const [summaryData, mealsData, streakData] = await Promise.all([
          sumForDate(today),
          listMeals(today),
          streakCounter()
        ]);
        
        console.log('Summary data:', summaryData);
        console.log('Meals data:', mealsData);
        console.log('Streak data:', streakData);
        
        setTodaysSummary(summaryData);
        setTodaysMeals(mealsData);
        setStreak(streakData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    if (user) {
      loadData();
    }
  }, [navigate, user, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (!profile || !goals) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  const isGoalComplete = (current: number, goal: number) => current >= goal;
  const allGoalsComplete = todaysSummary && goals ? 
    isGoalComplete(todaysSummary.calories, goals.calories) &&
    isGoalComplete(todaysSummary.carbs, goals.carbs) &&
    isGoalComplete(todaysSummary.protein, goals.protein) &&
    isGoalComplete(todaysSummary.fat, goals.fat) : false;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-hp/10 via-background to-defense/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-hp/5 to-defense/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(239,68,68,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold">Hi, {profile.name}! 👋</h1>
            <p className="text-muted-foreground">{currentDate}</p>
          </div>
          <div className="flex items-center gap-3">
            {streak.current_streak > 0 && (
              <GlassCard size="sm" className="flex items-center gap-2 px-4 py-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">{streak.current_streak} day{streak.current_streak > 1 ? 's' : ''}</span>
              </GlassCard>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/history")}
              className="backdrop-blur-glass bg-white/10 border border-white/20 hover:bg-white/20"
              title="View History"
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="backdrop-blur-glass bg-white/10 border border-white/20 hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={testSupabaseConnection}
              className="backdrop-blur-glass bg-white/10 border border-white/20 hover:bg-white/20"
              title="Test Supabase Connection"
            >
              <TestTube className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </motion.header>

        {/* RPG Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Calories - XL Hero Card */}
          <div className="md:col-span-2 lg:col-span-2">
                      <StatCard
            title="HP (Calories)"
            current={todaysSummary?.calories || 0}
            goal={goals.calories}
            unit="kcal"
            icon={Heart}
            variant="hp"
            size="xl"
          />
          </div>
          
          {/* Other stats */}
          <StatCard
            title="Stamina (Carbs)"
            current={todaysSummary?.carbs || 0}
            goal={goals.carbs}
            unit="g"
            icon={Zap}
            variant="stamina"
          />
          
          <StatCard
            title="Strength (Protein)"
            current={todaysSummary?.protein || 0}
            goal={goals.protein}
            unit="g"
            icon={Sword}
            variant="strength"
          />
          
          <div className="md:col-span-2 lg:col-span-1">
                      <StatCard
            title="Defense (Fat)"
            current={todaysSummary?.fat || 0}
            goal={goals.fat}
            unit="g"
            icon={Shield}
            variant="defense"
          />
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Add Food CTA */}
          <GlassCard variant="primary" glow="subtle" className="text-center">
            <div className="p-8">
              <div className="p-4 bg-primary/20 rounded-full w-fit mx-auto mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Snap Your Food</h3>
              <p className="text-muted-foreground mb-6">
                Use AI to instantly track your nutrition
              </p>
              <Button 
                onClick={() => navigate("/upload")}
                className="bg-gradient-primary hover:shadow-glow w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          </GlassCard>

          {/* Today's Progress */}
          <GlassCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Progress
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Meals logged</span>
                  <span className="font-semibold">{todaysMeals.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">XP earned</span>
                  <span className="font-semibold text-primary">
                    +{todaysMeals.length * 10} XP
                  </span>
                </div>
                
                {allGoalsComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    <div className="text-2xl mb-1">🎉</div>
                    <div className="text-sm text-primary font-semibold">All goals completed!</div>
                  </motion.div>
                )}
              </div>

              <Button 
                variant="outline" 
                onClick={() => navigate("/history")}
                className="w-full mt-4"
              >
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Today's Meals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Today's Meals</h2>
            <Button
              onClick={() => navigate("/upload")}
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Meal
            </Button>
          </div>

          {todaysMeals.length === 0 ? (
            <GlassCard size="lg" className="text-center">
              <div className="p-8">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold mb-2">No meals logged yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your day by logging your first meal!
                </p>
                <Button 
                  onClick={() => navigate("/upload")}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Log Your First Meal
                </Button>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {todaysMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4 hover:shadow-glow transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{meal.meal_name || meal.food_name}</h4>
                                                  {meal.portion && (
                            <p className="text-sm text-muted-foreground mb-2">{meal.portion}</p>
                          )}
                        
                        {/* Macro chips */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-hp/20 text-hp-foreground rounded-md text-xs font-medium">
                            {meal.calories} kcal
                          </span>
                          <span className="px-2 py-1 bg-stamina/20 text-stamina-foreground rounded-md text-xs font-medium">
                            {meal.carbs}g carbs
                          </span>
                          <span className="px-2 py-1 bg-strength/20 text-strength-foreground rounded-md text-xs font-medium">
                            {meal.protein}g protein
                          </span>
                          <span className="px-2 py-1 bg-defense/20 text-defense-foreground rounded-md text-xs font-medium">
                            {meal.fat}g fat
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {new Date(meal.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="px-2 py-1 bg-primary/20 text-primary rounded-md text-xs font-medium">
                          +{meal.xp} XP
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Daily Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard variant="primary" className="text-center">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">💡 Daily Tip</h3>
              <p className="text-muted-foreground">{getDailyTip()}</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
