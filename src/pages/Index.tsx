import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Sparkles, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getProfile } from "@/services/profileService";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Check if user has a profile and redirect accordingly
    const checkProfile = async () => {
      if (!loading) {
        if (user) {
          const profile = await getProfile();
          if (profile && profile.name) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        }
      }
    };
    
    checkProfile();
  }, [navigate, user, loading]);

  const handleGetStarted = async () => {
    if (user) {
      const profile = await getProfile();
      if (profile && profile.name) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Camera,
      title: "AI-Powered Scanning",
      description: "Snap a photo and let AI identify nutrition instantly"
    },
    {
      icon: Target,
      title: "RPG-Style Tracking",
      description: "Turn nutrition into a game with HP, Stamina, Strength & Defense"
    },
    {
      icon: TrendingUp,
      title: "Smart Goals",
      description: "Personalized targets based on your lifestyle and objectives"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,119,198,0.1),transparent_50%)]" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-16"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              NutriTrackAI
            </h1>
          </div>
          <ThemeToggle />
        </motion.header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-hp to-strength bg-clip-text text-transparent">
              Snap. Track. Level Up.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform nutrition tracking into an epic RPG adventure. 
              AI identifies your food, you build your stats.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6 h-auto rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <Camera className="mr-2 h-6 w-6" />
              Start Your Journey
            </Button>
          </motion.div>

          {/* Demo Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-16"
          >
            <GlassCard variant="hp" size="sm" className="text-center">
              <div className="text-2xl font-bold text-hp">❤️</div>
              <div className="text-sm">HP (Calories)</div>
            </GlassCard>
            <GlassCard variant="stamina" size="sm" className="text-center">
              <div className="text-2xl font-bold text-stamina">⚡</div>
              <div className="text-sm">Stamina (Carbs)</div>
            </GlassCard>
            <GlassCard variant="strength" size="sm" className="text-center">
              <div className="text-2xl font-bold text-strength">🗡️</div>
              <div className="text-sm">Strength (Protein)</div>
            </GlassCard>
            <GlassCard variant="defense" size="sm" className="text-center">
              <div className="text-2xl font-bold text-defense">🛡️</div>
              <div className="text-sm">Defense (Fat)</div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <GlassCard size="lg" className="text-center h-full hover:scale-105 transition-transform duration-300">
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 text-muted-foreground"
        >
          <p>Built with ❤️ for healthier lifestyles</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;