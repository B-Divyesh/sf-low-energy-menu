export type Effort = 1 | 2 | 3;

export interface Ingredient {
  name: string;
  quantity?: number;
  unit?: string;
}

export interface Recipe {
  id: string;
  name: string;
  effort: Effort;
  leftoverMeals: number;
  tags: string[];
  ingredients: Ingredient[];
  notes: string;
  createdAt: string;
}

export interface DinnerPlan {
  kind: 'recipe' | 'leftover' | 'other';
  recipeId?: string;
  label?: string;
}

export interface DayPlan {
  energy: Effort;
  schoolMeal: string;
  dinner: DinnerPlan | null;
  outcome: 'planned' | 'cooked' | 'abandoned';
}

export interface WeekPlan {
  weekStart: string;
  days: Record<string, DayPlan>;
}

export interface AppData {
  version: 1;
  recipes: Recipe[];
  weeks: Record<string, WeekPlan>;
  updatedAt: string;
}

export interface PlanWarning {
  kind: 'effort' | 'school' | 'repeat' | 'leftovers';
  message: string;
}
