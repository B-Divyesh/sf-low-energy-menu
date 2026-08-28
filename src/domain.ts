import type { AppData, DayPlan, DinnerPlan, Effort, Ingredient, PlanWarning, Recipe, WeekPlan } from './types';

const DAY_MS = 86_400_000;

export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromIso(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

export function mondayOf(date = new Date()): string {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return isoDate(copy);
}

export function addDays(value: string, days: number): string {
  return isoDate(new Date(fromIso(value).getTime() + days * DAY_MS));
}

export function weekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function blankDay(): DayPlan {
  return { energy: 2, schoolMeal: '', dinner: null, outcome: 'planned' };
}

export function ensureWeek(data: AppData, weekStart: string): WeekPlan {
  if (!data.weeks[weekStart]) {
    data.weeks[weekStart] = {
      weekStart,
      days: Object.fromEntries(weekDates(weekStart).map((date) => [date, blankDay()])),
    };
  }
  return data.weeks[weekStart];
}

export function createEmptyData(): AppData {
  return { version: 1, recipes: [], weeks: {}, updatedAt: new Date().toISOString() };
}

export function effortLabel(effort: Effort): string {
  return effort === 1 ? 'Low' : effort === 2 ? 'Medium' : 'High';
}

function words(value: string): Set<string> {
  return new Set(value.toLocaleLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 4));
}

function intersects(a: Set<string>, b: Set<string>): boolean {
  return [...a].some((word) => b.has(word));
}

export function dinnerName(plan: DinnerPlan | null, recipes: Recipe[]): string {
  if (!plan) return '';
  if (plan.kind === 'other') return plan.label || 'Flexible dinner';
  const recipe = recipes.find((item) => item.id === plan.recipeId);
  if (!recipe) return 'Missing recipe';
  return plan.kind === 'leftover' ? `${recipe.name} leftovers` : recipe.name;
}

export function availableLeftovers(week: WeekPlan, date: string, recipes: Recipe[]): Array<{ recipe: Recipe; remaining: number }> {
  const counts = new Map<string, number>();
  for (const cursor of weekDates(week.weekStart)) {
    if (cursor >= date) break;
    const dinner = week.days[cursor]?.dinner;
    if (dinner?.kind === 'recipe' && dinner.recipeId) {
      const recipe = recipes.find((item) => item.id === dinner.recipeId);
      if (recipe) counts.set(recipe.id, (counts.get(recipe.id) || 0) + recipe.leftoverMeals);
    }
    if (dinner?.kind === 'leftover' && dinner.recipeId) {
      counts.set(dinner.recipeId, Math.max(0, (counts.get(dinner.recipeId) || 0) - 1));
    }
  }
  return recipes.flatMap((recipe) => {
    const remaining = counts.get(recipe.id) || 0;
    return remaining > 0 ? [{ recipe, remaining }] : [];
  });
}

export function warningsForDay(week: WeekPlan, date: string, recipes: Recipe[]): PlanWarning[] {
  const day = week.days[date];
  if (!day?.dinner) return [];
  const plan = day.dinner;
  const recipe = plan.recipeId ? recipes.find((item) => item.id === plan.recipeId) : undefined;
  const warnings: PlanWarning[] = [];

  if (recipe && plan.kind === 'recipe' && recipe.effort > day.energy) {
    warnings.push({ kind: 'effort', message: `${effortLabel(recipe.effort)}-effort dinner on a ${effortLabel(day.energy).toLowerCase()}-energy day.` });
  }

  const dinnerWords = words(recipe ? `${recipe.name} ${recipe.tags.join(' ')}` : plan.label || '');
  if (day.schoolMeal && intersects(dinnerWords, words(day.schoolMeal))) {
    warnings.push({ kind: 'school', message: 'Looks similar to the school or canteen meal.' });
  }

  for (const distance of [1, 2]) {
    const previousDate = addDays(date, -distance);
    if (previousDate < week.weekStart) continue;
    const previous = week.days[previousDate];
    const previousWords = words(`${dinnerName(previous?.dinner || null, recipes)} ${previous?.schoolMeal || ''}`);
    if (dinnerWords.size && intersects(dinnerWords, previousWords)) {
      warnings.push({ kind: 'repeat', message: `A similar meal appears ${distance === 1 ? 'the day before' : 'two days earlier'}.` });
      break;
    }
  }

  if (plan.kind === 'leftover' && recipe) {
    const available = availableLeftovers(week, date, recipes).find((item) => item.recipe.id === recipe.id)?.remaining || 0;
    if (available < 1) warnings.push({ kind: 'leftovers', message: 'No portion of these leftovers is available yet.' });
  }
  return warnings;
}

export function parseIngredients(raw: string): Ingredient[] {
  return raw.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split('|').map((part) => part.trim());
    if (parts.length >= 3) {
      const quantity = Number(parts[0]);
      return { quantity: Number.isFinite(quantity) ? quantity : undefined, unit: parts[1] || undefined, name: parts.slice(2).join(' | ') };
    }
    return { name: line };
  }).filter((item) => item.name);
}

export function groceryRows(week: WeekPlan, recipes: Recipe[]): Ingredient[] {
  const aggregate = new Map<string, Ingredient>();
  for (const date of weekDates(week.weekStart)) {
    const plan = week.days[date]?.dinner;
    if (plan?.kind !== 'recipe') continue;
    const recipe = recipes.find((item) => item.id === plan.recipeId);
    for (const ingredient of recipe?.ingredients || []) {
      const key = `${ingredient.name.trim().toLowerCase()}|${ingredient.unit?.trim().toLowerCase() || ''}`;
      const existing = aggregate.get(key);
      if (!existing) aggregate.set(key, { ...ingredient });
      else if (typeof ingredient.quantity === 'number' && typeof existing.quantity === 'number') existing.quantity += ingredient.quantity;
      else existing.quantity = undefined;
    }
  }
  return [...aggregate.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function groceryCsv(week: WeekPlan, recipes: Recipe[]): string {
  const escape = (value: string | number | undefined) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return ['Ingredient,Quantity,Unit', ...groceryRows(week, recipes).map((item) => [item.name, item.quantity, item.unit].map(escape).join(','))].join('\n');
}

export function validateImport(value: unknown): AppData {
  if (!value || typeof value !== 'object') throw new Error('That file does not contain a Low-Energy Menu backup.');
  const candidate = value as Partial<AppData>;
  if (candidate.version !== 1 || !Array.isArray(candidate.recipes) || !candidate.weeks || typeof candidate.weeks !== 'object') {
    throw new Error('That backup version is not supported.');
  }
  for (const recipe of candidate.recipes) {
    if (!recipe || typeof recipe.name !== 'string' || ![1, 2, 3].includes(recipe.effort)) throw new Error('A recipe in the backup is incomplete.');
  }
  return candidate as AppData;
}
