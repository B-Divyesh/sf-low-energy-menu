import { describe, expect, it } from 'vitest';
import { availableLeftovers, createEmptyData, ensureWeek, groceryCsv, parseIngredients, warningsForDay } from '../src/domain';
import type { Recipe } from '../src/types';

const lentils: Recipe = {
  id: 'lentils', name: 'Tomato lentil pasta', effort: 3, leftoverMeals: 1,
  tags: ['vegetarian', 'pasta'],
  ingredients: [{ name: 'lentils', quantity: 2, unit: 'cans' }, { name: 'spinach', quantity: 1, unit: 'bunch' }],
  notes: '', createdAt: '2026-01-01T00:00:00Z',
};

describe('household planning rules', () => {
  it('warns when effort exceeds energy and school food repeats', () => {
    const data = createEmptyData(); data.recipes.push(lentils);
    const week = ensureWeek(data, '2026-08-24');
    week.days['2026-08-24'] = { energy: 1, schoolMeal: 'Tomato pasta', dinner: { kind: 'recipe', recipeId: 'lentils' }, outcome: 'planned' };
    expect(warningsForDay(week, '2026-08-24', data.recipes).map((warning) => warning.kind)).toEqual(['effort', 'school']);
  });

  it('carries leftovers forward and consumes one dinner at a time', () => {
    const data = createEmptyData(); data.recipes.push(lentils);
    const week = ensureWeek(data, '2026-08-24');
    week.days['2026-08-24']!.dinner = { kind: 'recipe', recipeId: 'lentils' };
    expect(availableLeftovers(week, '2026-08-25', data.recipes)[0]?.remaining).toBe(1);
    week.days['2026-08-25']!.dinner = { kind: 'leftover', recipeId: 'lentils' };
    expect(availableLeftovers(week, '2026-08-26', data.recipes)).toHaveLength(0);
  });

  it('aggregates grocery quantities only for cooked recipe slots', () => {
    const data = createEmptyData(); data.recipes.push(lentils);
    const week = ensureWeek(data, '2026-08-24');
    week.days['2026-08-24']!.dinner = { kind: 'recipe', recipeId: 'lentils' };
    week.days['2026-08-25']!.dinner = { kind: 'recipe', recipeId: 'lentils' };
    expect(groceryCsv(week, data.recipes)).toContain('"lentils","4","cans"');
  });

  it('accepts flexible ingredient lines and structured lines', () => {
    expect(parseIngredients('2 | cans | beans\nsalt')).toEqual([
      { quantity: 2, unit: 'cans', name: 'beans' }, { name: 'salt' },
    ]);
  });
});
