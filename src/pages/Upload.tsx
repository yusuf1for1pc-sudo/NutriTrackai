import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Camera, 
  Upload as UploadIcon, 
  Loader2, 
  Check, 
  Edit3,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { analyzeFood, getRandomFoodSuggestion } from "@/services/aiService";
import { addMeal, validateMeal } from "@/services/mealService";
import type { Meal } from "@/services/mealService";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [mealData, setMealData] = useState({
    name: "",
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    portionSize: "",
    restaurant: "",
    notes: "",
    recipeSteps: ""
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setMealData({
        name: "",
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        portionSize: "",
        restaurant: "",
        notes: "",
        recipeSteps: ""
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeFood(selectedFile);
      setAnalysisResult(analysis);
      setMealData({
        name: analysis.food_name,
        calories: analysis.calories,
        carbs: analysis.carbs,
        protein: analysis.protein,
        fat: analysis.fat,
        portionSize: "1 serving", // Default portion size
        restaurant: "",
        notes: "",
        recipeSteps: ""
      });

      // Automatically save the meal after AI analysis
      const mealToSave: Omit<Meal, 'id' | 'user_id' | 'timestamp' | 'created_at' | 'updated_at'> = {
        meal_name: analysis.food_name,
        food_name: analysis.food_name,
        calories: analysis.calories,
        carbs: analysis.carbs,
        protein: analysis.protein,
        fat: analysis.fat,
        portion: "1 serving", // Default portion size
        brand: "",
        notes: "AI analyzed",
        source: 'ai',
        meal_time: new Date().toISOString(),
      };

      const savedMeal = await addMeal(mealToSave);
      if (savedMeal) {
        toast({
          title: "Analysis Complete & Saved!",
          description: `Identified: ${analysis.food_name} - Saved to your log!`,
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Identified: ${analysis.food_name} - Failed to save automatically.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    const mealToSave: Omit<Meal, 'id' | 'user_id' | 'timestamp' | 'created_at' | 'updated_at'> = {
      meal_name: mealData.name,
      food_name: mealData.name,
      calories: mealData.calories,
      carbs: mealData.carbs,
      protein: mealData.protein,
      fat: mealData.fat,
      portion: mealData.portionSize,
      brand: mealData.restaurant,
      notes: mealData.notes,
      source: analysisResult?.source === 'ai' ? 'ai' : 'manual',
      meal_time: new Date().toISOString(),
    };

    // Skip validation for AI-analyzed meals since they may have estimation errors
    const isAIAnalyzed = analysisResult && analysisResult.source === 'ai';
    
    if (!isAIAnalyzed) {
      const validationErrors = validateMeal(mealToSave);
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors[0],
          variant: "destructive"
        });
        return;
      }
    }

    try {
      await addMeal(mealToSave);
      toast({
        title: analysisResult?.source === 'ai' ? "Meal Updated!" : "Meal Saved!",
        description: `${mealData.name} has been ${analysisResult?.source === 'ai' ? 'updated in' : 'added to'} your nutrition log.`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save the meal. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-stamina/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-stamina/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
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
            onClick={() => navigate("/dashboard")}
            className="backdrop-blur-glass bg-white/10 border border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Upload Food Photo</h1>
            <p className="text-sm text-muted-foreground">Let AI identify your nutrition</p>
          </div>
          <ThemeToggle />
        </motion.header>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard size="lg">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-6">
                  <Camera className="inline-block mr-2 h-5 w-5" />
                  Capture Your Food
                </h2>

                {/* File Upload Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/30 rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected food"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                      <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                      >
                        Choose Different Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                        <UploadIcon className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-medium mb-2">Drop your food photo here</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          or click to browse from your device
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRandomFoodSuggestion()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />

                {/* Mobile Camera Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6 md:hidden">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.capture = 'environment';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleFileSelect(file);
                      };
                      input.click();
                    }}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Choose Photo
                  </Button>
                </div>

                {/* Analyze Button */}
                {selectedFile && !analysisResult && (
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="mt-6 bg-gradient-primary hover:shadow-glow"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Analysis Results & Edit Form */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard size="lg">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        Analysis Complete
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                      </p>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Food Name</Label>
                        <Input
                          id="name"
                          value={mealData.name}
                          onChange={(e) => setMealData({ ...mealData, name: e.target.value })}
                          placeholder="Enter food name"
                        />
                      </div>

                      {/* Macros Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            type="number"
                            value={mealData.calories}
                            onChange={(e) => setMealData({ ...mealData, calories: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="carbs">Carbs (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            value={mealData.carbs}
                            onChange={(e) => setMealData({ ...mealData, carbs: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            value={mealData.protein}
                            onChange={(e) => setMealData({ ...mealData, protein: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            value={mealData.fat}
                            onChange={(e) => setMealData({ ...mealData, fat: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Details - Collapsible */}
                    <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <Edit3 className="h-4 w-4" />
                            Add More Details
                          </span>
                          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="portionSize">Portion Size</Label>
                          <Input
                            id="portionSize"
                            value={mealData.portionSize}
                            onChange={(e) => setMealData({ ...mealData, portionSize: e.target.value })}
                            placeholder="e.g., 1 cup, 2 slices, 1 medium"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="restaurant">Restaurant / Brand (optional)</Label>
                          <Input
                            id="restaurant"
                            value={mealData.restaurant}
                            onChange={(e) => setMealData({ ...mealData, restaurant: e.target.value })}
                            placeholder="Where did you get this food?"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes (optional)</Label>
                          <Textarea
                            id="notes"
                            value={mealData.notes}
                            onChange={(e) => setMealData({ ...mealData, notes: e.target.value })}
                            placeholder="Any additional notes about this meal..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="recipeSteps">Recipe Steps (optional)</Label>
                          <Textarea
                            id="recipeSteps"
                            value={mealData.recipeSteps}
                            onChange={(e) => setMealData({ ...mealData, recipeSteps: e.target.value })}
                            placeholder="How to prepare this dish..."
                            rows={4}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* AI Suggestions */}
                    {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <h4 className="font-medium mb-2 text-primary">💡 AI Suggestions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {analysisResult.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="pt-4">
                      <Button 
                        onClick={handleSave}
                        className="w-full bg-gradient-primary hover:shadow-glow"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {analysisResult?.source === 'ai' ? 'Update Meal' : 'Save Meal (+10 XP)'}
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Upload;