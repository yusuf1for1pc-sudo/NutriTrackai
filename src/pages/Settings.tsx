import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Target, Download, RotateCcw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile, computeGoals } from "@/services/profileService";
import { exportMealsAsJSON, resetDemoData } from "@/services/mealService";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(getProfile());

  if (!profile) {
    navigate("/auth");
    return null;
  }

  const [formData, setFormData] = useState(profile);
  const goals = computeGoals(formData);

  const handleSave = () => {
    updateProfile(formData);
    toast({ title: "Profile updated successfully!" });
  };

  const handleExport = () => {
    const data = exportMealsAsJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nutritrack-data.json';
    a.click();
    toast({ title: "Data exported successfully!" });
  };

  const handleReset = () => {
    resetDemoData();
    toast({ title: "Demo data reset successfully!" });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
      toast({ title: "Signed out successfully!" });
    } catch (error) {
      toast({ 
        title: "Error signing out", 
        description: "Please try again",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="backdrop-blur-glass bg-white/10 border border-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
          <ThemeToggle />
        </motion.header>

        <div className="max-w-2xl mx-auto space-y-6">
          <GlassCard size="lg">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Profile Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select value={formData.goalType} onValueChange={(value: any) => setFormData({ ...formData, goalType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                    <SelectItem value="fat_loss">🔥 Fat Loss</SelectItem>
                    <SelectItem value="muscle_gain">💪 Muscle Gain</SelectItem>
                    <SelectItem value="weight_loss">⬇️ Weight Loss</SelectItem>
                    <SelectItem value="weight_gain">⬆️ Weight Gain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="font-medium mb-3">Current Goals</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-hp">{goals.calories}</div>
                    <div className="text-xs text-muted-foreground">Calories</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-stamina">{goals.carbs}g</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-strength">{goals.protein}g</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-defense">{goals.fat}g</div>
                    <div className="text-xs text-muted-foreground">Fat</div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full bg-gradient-primary">
                Save Changes
              </Button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Data Management</h2>
              <div className="space-y-3">
                <Button onClick={handleExport} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data as JSON
                </Button>
                <Button onClick={handleReset} variant="outline" className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Demo Data
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Account</h2>
              <div className="space-y-3">
                <Button onClick={handleSignOut} variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;