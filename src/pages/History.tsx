import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Camera, 
  Edit, 
  Trash2,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Plus,
  Minus,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { listMeals, deleteMeal, updateMeal } from "@/services/mealService";

const History = () => {
  const [meals, setMeals] = useState<any[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [macroFilter, setMacroFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const itemsPerPage = 10;

  const loadMeals = async () => {
    try {
      setLoading(true);
      const mealsData = await listMeals();
      setMeals(mealsData);
      setFilteredMeals(mealsData);
    } catch (error) {
      console.error('Error loading meals:', error);
      toast({
        title: "Error",
        description: "Failed to load meals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...meals];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(meal => 
        meal.meal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.food_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(meal => {
        const mealDate = new Date(meal.timestamp).toISOString().split('T')[0];
        return mealDate === selectedDate;
      });
    }

    // Macro filter
    if (macroFilter !== "all") {
      filtered = filtered.filter(meal => {
        switch (macroFilter) {
          case "high_protein":
            return meal.protein >= 20;
          case "low_carb":
            return meal.carbs <= 30;
          case "high_fat":
            return meal.fat >= 15;
          case "low_calorie":
            return meal.calories <= 300;
          default:
            return true;
        }
      });
    }

    setFilteredMeals(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDate, macroFilter, meals]);

  const handleEdit = (meal: any) => {
    setEditingMeal(meal);
    setEditForm({
      meal_name: meal.meal_name || meal.food_name,
      calories: meal.calories,
      carbs: meal.carbs,
      protein: meal.protein,
      fat: meal.fat,
      portion: meal.portion || "1 serving"
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const success = await updateMeal(editingMeal.id, editForm);
      if (success) {
        toast({
          title: "Success",
          description: "Meal updated successfully",
        });
        setIsEditDialogOpen(false);
        loadMeals();
      } else {
        toast({
          title: "Error",
          description: "Failed to update meal",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating meal:', error);
      toast({
        title: "Error",
        description: "Failed to update meal",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      const success = await deleteMeal(mealToDelete.id);
      if (success) {
        toast({
          title: "Success",
          description: "Meal deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        loadMeals();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete meal",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast({
        title: "Error",
        description: "Failed to delete meal",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (meal: any) => {
    setMealToDelete(meal);
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    loadMeals();
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredMeals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMeals = filteredMeals.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="backdrop-blur-glass bg-white/10 border border-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Meal History</h1>
          <ThemeToggle />
        </motion.header>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Filter Bar */}
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {showFilters ? "Hide" : "Show"} Filters
                  </Button>
                  <div className="flex items-center gap-1 bg-muted/20 rounded-lg p-1">
                    <Button
                      variant={viewMode === "cards" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("cards")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search meals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  
                  <Select value={macroFilter} onValueChange={setMacroFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by macros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Meals</SelectItem>
                      <SelectItem value="high_protein">High Protein (≥20g)</SelectItem>
                      <SelectItem value="low_carb">Low Carb (≤30g)</SelectItem>
                      <SelectItem value="high_fat">High Fat (≥15g)</SelectItem>
                      <SelectItem value="low_calorie">Low Calorie (≤300)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={loadMeals} variant="outline" className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </motion.div>
              )}
            </div>
          </GlassCard>

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredMeals.length} of {meals.length} meals
            </p>
            {filteredMeals.length > itemsPerPage && (
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading meals...</p>
            </div>
          ) : currentMeals.length === 0 ? (
            <GlassCard size="lg" className="text-center">
              <div className="p-8">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold mb-2">No meals found</h3>
                <p className="text-muted-foreground mb-6">
                  {filteredMeals.length === 0 && meals.length > 0 
                    ? "Try adjusting your filters"
                    : "Start by uploading a food photo!"
                  }
                </p>
                <Button onClick={() => navigate("/upload")} className="bg-gradient-primary hover:shadow-glow">
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Food Photo
                </Button>
              </div>
            </GlassCard>
          ) : viewMode === "table" ? (
            // Table View
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 font-semibold">Meal</th>
                      <th className="text-left p-4 font-semibold">Date</th>
                      <th className="text-left p-4 font-semibold">Calories</th>
                      <th className="text-left p-4 font-semibold">Macros</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMeals.map((meal, index) => (
                      <motion.tr
                        key={meal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/20 hover:bg-muted/20"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{meal.meal_name || meal.food_name}</div>
                            <div className="text-sm text-muted-foreground">{meal.portion}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {new Date(meal.timestamp).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-hp">{meal.calories} kcal</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <span className="px-2 py-1 bg-stamina/20 text-stamina-foreground rounded text-xs">
                              {meal.carbs}g
                            </span>
                            <span className="px-2 py-1 bg-strength/20 text-strength-foreground rounded text-xs">
                              {meal.protein}g
                            </span>
                            <span className="px-2 py-1 bg-defense/20 text-defense-foreground rounded text-xs">
                              {meal.fat}g
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(meal)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => confirmDelete(meal)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ) : (
            // Cards View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4 hover:shadow-glow transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{meal.meal_name || meal.food_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(meal.timestamp).toLocaleDateString()} • {meal.portion}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(meal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => confirmDelete(meal)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Calories</span>
                          <span className="font-semibold text-hp">{meal.calories} kcal</span>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <span className="px-2 py-1 bg-stamina/20 text-stamina-foreground rounded text-xs">
                            {meal.carbs}g carbs
                          </span>
                          <span className="px-2 py-1 bg-strength/20 text-strength-foreground rounded text-xs">
                            {meal.protein}g protein
                          </span>
                          <span className="px-2 py-1 bg-defense/20 text-defense-foreground rounded text-xs">
                            {meal.fat}g fat
                          </span>
                        </div>
                        
                        {meal.source === 'ai' && (
                          <span className="px-2 py-1 bg-primary/20 text-primary-foreground rounded text-xs inline-block">
                            🤖 AI Analyzed
                          </span>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <GlassCard>
              <div className="flex items-center justify-between p-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Meal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Meal Name</Label>
                <Input
                  value={editForm.meal_name}
                  onChange={(e) => setEditForm({ ...editForm, meal_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    value={editForm.calories}
                    onChange={(e) => setEditForm({ ...editForm, calories: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Portion</Label>
                  <Input
                    value={editForm.portion}
                    onChange={(e) => setEditForm({ ...editForm, portion: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={editForm.carbs}
                    onChange={(e) => setEditForm({ ...editForm, carbs: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    value={editForm.protein}
                    onChange={(e) => setEditForm({ ...editForm, protein: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    value={editForm.fat}
                    onChange={(e) => setEditForm({ ...editForm, fat: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Meal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to delete "{mealToDelete?.meal_name || mealToDelete?.food_name}"?</p>
              <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default History;