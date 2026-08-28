import { ensureWeek, mondayOf, weekDates } from './domain';
import type { AppData, Recipe } from './types';

const recipes: Recipe[] = [
  {
    id: 'demo-traybake',
    name: 'Lemon chickpea traybake',
    effort: 1,
    leftoverMeals: 1,
    tags: ['vegetarian', 'hands-off'],
    ingredients: [
      { name: 'chickpeas', quantity: 2, unit: 'cans' },
      { name: 'sweet potatoes', quantity: 3 },
      { name: 'lemons', quantity: 2 },
    ],
    notes: 'Put Monday’s extra portion aside before serving.',
    createdAt: '2026-08-25T12:00:00.000Z',
  },
  {
    id: 'demo-pasta',
    name: 'Tomato lentil pasta',
    effort: 2,
    leftoverMeals: 1,
    tags: ['vegetarian', 'pasta'],
    ingredients: [
      { name: 'red lentils', quantity: 1, unit: 'cup' },
      { name: 'chopped tomatoes', quantity: 2, unit: 'cans' },
      { name: 'pasta', quantity: 500, unit: 'g' },
    ],
    notes: 'Keep sauce separate for the youngest child.',
    createdAt: '2026-08-25T12:01:00.000Z',
  },
  {
    id: 'demo-tacos',
    name: 'Black bean tacos',
    effort: 3,
    leftoverMeals: 0,
    tags: ['vegetarian', 'beans'],
    ingredients: [
      { name: 'black beans', quantity: 2, unit: 'cans' },
      { name: 'tortillas', quantity: 8 },
      { name: 'avocado', quantity: 1 },
    ],
    notes: 'Save this for a higher-energy evening.',
    createdAt: '2026-08-25T12:02:00.000Z',
  },
];

export function createDemoData(): AppData {
  const data: AppData = { version: 1, recipes: structuredClone(recipes), weeks: {}, updatedAt: new Date().toISOString() };
  const week = ensureWeek(data, mondayOf());
  const [monday, tuesday, wednesday, thursday, friday] = weekDates(week.weekStart);
  week.days[monday!] = { energy: 1, schoolMeal: 'Vegetable curry', dinner: { kind: 'recipe', recipeId: 'demo-traybake' }, outcome: 'cooked' };
  week.days[tuesday!] = { energy: 1, schoolMeal: 'Fish fingers and peas', dinner: { kind: 'leftover', recipeId: 'demo-traybake' }, outcome: 'planned' };
  week.days[wednesday!] = { energy: 2, schoolMeal: 'Tomato pasta', dinner: { kind: 'recipe', recipeId: 'demo-pasta' }, outcome: 'planned' };
  week.days[thursday!] = { energy: 1, schoolMeal: 'Baked potato', dinner: { kind: 'other', label: 'Flexible / takeout night' }, outcome: 'planned' };
  week.days[friday!] = { energy: 3, schoolMeal: 'Soup and bread', dinner: { kind: 'recipe', recipeId: 'demo-tacos' }, outcome: 'planned' };
  return data;
}
