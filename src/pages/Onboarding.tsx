import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, User, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Profile, Goals, saveProfile, computeGoals } from "@/services/profileService";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<Profile>>({
    name: "",
    age: 25,
    gender: "male",
    weight: 70,
    height: 175,
    activity: "moderate",
    goal_type: "maintain"
  });
  const [goals, setGoals] = useState<Goals | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const goalTypes = [
    {
      id: "maintain",
      title: "⚖️ Maintain",
      description: "Maintain current weight with balanced nutrition",
      emoji: "⚖️"
    },
    {
      id: "cut",
      title: "🔥 Cut",
      description: "Reduce body fat while preserving muscle",
      emoji: "🔥"
    },
    {
      id: "bulk",
      title: "💪 Bulk",
      description: "Build muscle with optimized protein intake",
      emoji: "💪"
    }
  ];

  const updateProfile = (updates: Partial<Profile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    
    // Update goals preview if we have enough data
    if (newProfile.weight && newProfile.height && newProfile.age && newProfile.gender && newProfile.activity) {
      const newGoals = computeGoals(newProfile as Profile, newProfile.goal_type);
      setGoals(newGoals);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate profile data
      if (!profile.name || !profile.age || !profile.weight || !profile.height) {
        toast({
          title: "Missing Information",
          description: "Please fill in all profile fields.",
          variant: "destructive"
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleFinish = async () => {
    try {
      const finalProfile: Partial<Profile> = {
        name: profile.name!,
        age: profile.age!,
        gender: profile.gender!,
        weight: profile.weight!,
        height: profile.height!,
        activity: profile.activity!,
        goal_type: profile.goal_type!,
      };

      const savedProfile = await saveProfile(finalProfile);
      if (savedProfile) {
        toast({
          title: "Profile Complete!",
          description: `Welcome ${finalProfile.name}! Your personalized nutrition plan is ready.`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-strength/20 via-background to-primary/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-strength/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(16,185,129,0.1),transparent_50%)]" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => step === 1 ? navigate("/auth") : setStep(step - 1)}
            className="backdrop-blur-glass bg-white/10 border border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Setup Your Profile</h1>
            <p className="text-sm text-muted-foreground">Step {step} of 2</p>
          </div>
          <ThemeToggle />
        </motion.header>

        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(step / 2) * 100}%` }}
          className="h-2 bg-gradient-primary rounded-full mb-8 transition-all duration-500"
        />

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard size="xl">
                  <div className="text-center mb-8">
                    <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Tell Us About Yourself</h2>
                    <p className="text-muted-foreground">We'll use this to calculate your personalized nutrition goals</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => updateProfile({ name: e.target.value })}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={profile.age}
                          onChange={(e) => updateProfile({ age: parseInt(e.target.value) })}
                          placeholder="Age"
                          min="13"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={profile.gender} onValueChange={(value: any) => updateProfile({ gender: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={profile.weight}
                          onChange={(e) => updateProfile({ weight: parseFloat(e.target.value) })}
                          placeholder="Weight in kg"
                          min="30"
                          max="300"
                          step="0.1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={profile.height}
                          onChange={(e) => updateProfile({ height: parseInt(e.target.value) })}
                          placeholder="Height in cm"
                          min="120"
                          max="250"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Activity Level</Label>
                                              <Select value={profile.activity} onValueChange={(value: any) => updateProfile({ activity: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                          <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                          <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleNext} 
                    className="w-full mt-8 bg-gradient-primary hover:shadow-glow"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </GlassCard>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard size="xl">
                  <div className="text-center mb-8">
                    <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Choose Your Goal</h2>
                    <p className="text-muted-foreground">We'll adjust your calorie goal accordingly. You can change this anytime.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {goalTypes.map((goalType) => (
                      <motion.button
                        key={goalType.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateProfile({ goal_type: goalType.id as any })}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                          profile.goal_type === goalType.id
                            ? "border-primary bg-primary/10 shadow-glow"
                            : "border-white/20 bg-white/5 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                                                  <span className="text-2xl">{goalType.emoji}</span>
                        {profile.goal_type === goalType.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{goalType.title.replace(goalType.emoji + " ", "")}</h3>
                        <p className="text-sm text-muted-foreground">{goalType.description}</p>
                      </motion.button>
                    ))}
                  </div>

                  {/* Goals Preview */}
                  {goals && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-muted/20 rounded-lg p-6 mb-8"
                    >
                      <h3 className="font-semibold mb-4 text-center">Your Personalized Goals</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-hp">{goals.calories}</div>
                          <div className="text-sm text-muted-foreground">Calories ❤️</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-stamina">{goals.carbs}g</div>
                          <div className="text-sm text-muted-foreground">Carbs ⚡</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-strength">{goals.protein}g</div>
                          <div className="text-sm text-muted-foreground">Protein 🗡️</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-defense">{goals.fat}g</div>
                          <div className="text-sm text-muted-foreground">Fat 🛡️</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button 
                    onClick={handleFinish} 
                    className="w-full bg-gradient-primary hover:shadow-glow"
                  >
                    Complete Setup
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;