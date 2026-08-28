import './styles.css';
import { addDays, availableLeftovers, dinnerName, effortLabel, ensureWeek, fromIso, groceryCsv, groceryRows, mondayOf, parseIngredients, validateImport, warningsForDay, weekDates } from './domain';
import { eraseData, loadData, saveData } from './db';
import { acceptLicenseFromUrl, cachedLicenseState, checkoutUrl, storeLicense, verifyLicense, type LicenseState } from './license';
import type { AppData, DinnerPlan, Effort, Recipe } from './types';

const mount = document.querySelector<HTMLDivElement>('#app');
if (!mount) throw new Error('App mount not found');
const app: HTMLDivElement = mount;

let data: AppData;
let activeWeek = mondayOf();
let license: LicenseState = cachedLicenseState();
let storageError = '';
let toastMessage = '';
let updateWorker: ServiceWorker | null = null;
let offlineReady = false;

const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] || character));
const recipeById = (id?: string): Recipe | undefined => data.recipes.find((recipe) => recipe.id === id);

function formatWeek(start: string): string {
  const end = fromIso(addDays(start, 6));
  const beginning = fromIso(start);
  const sameMonth = beginning.getMonth() === end.getMonth();
  return sameMonth
    ? `${beginning.toLocaleDateString(undefined, { month: 'short' })} ${beginning.getDate()}–${end.getDate()}, ${end.getFullYear()}`
    : `${beginning.toLocaleDateString(undefined, { month: 'short' })} ${beginning.getDate()}–${end.toLocaleDateString(undefined, { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
}

function pips(effort: Effort): string {
  return `<span class="effort-key" aria-label="${effortLabel(effort)} effort"><span aria-hidden="true">${Array.from({ length: effort }, () => '<i class="pip"></i>').join('')}</span> ${effortLabel(effort)}</span>`;
}

function dinnerValue(plan: DinnerPlan | null): string {
  if (!plan) return '';
  if (plan.kind === 'other') return 'other';
  return `${plan.kind}:${plan.recipeId}`;
}

function renderDay(date: string): string {
  const week = ensureWeek(data, activeWeek);
  const day = week.days[date]!;
  const leftovers = availableLeftovers(week, date, data.recipes);
  const existingLeftover = day.dinner?.kind === 'leftover' ? recipeById(day.dinner.recipeId) : undefined;
  if (existingLeftover && !leftovers.some((item) => item.recipe.id === existingLeftover.id)) leftovers.push({ recipe: existingLeftover, remaining: 0 });
  const warnings = warningsForDay(week, date, data.recipes);
  const currentValue = dinnerValue(day.dinner);
  const options = data.recipes.map((recipe) => `<option value="recipe:${escapeHtml(recipe.id)}" ${currentValue === `recipe:${recipe.id}` ? 'selected' : ''}>${escapeHtml(recipe.name)} · ${effortLabel(recipe.effort)}</option>`).join('');
  const leftoverOptions = leftovers.map(({ recipe, remaining }) => `<option value="leftover:${escapeHtml(recipe.id)}" ${currentValue === `leftover:${recipe.id}` ? 'selected' : ''}>↳ ${escapeHtml(recipe.name)} leftovers${remaining ? ` (${remaining})` : ''}</option>`).join('');
  const dayDate = fromIso(date);
  const isToday = date === new Date().toLocaleDateString('en-CA');
  return `
    <article class="day-card ${isToday ? 'today' : ''}" data-energy="${day.energy}" aria-labelledby="day-${date}">
      <h3 id="day-${date}">${dayDate.toLocaleDateString(undefined, { weekday: 'long' })}</h3>
      <p class="day-date">${dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}${isToday ? ' · Today' : ''}</p>
      <fieldset class="field-group">
        <legend>Cook's energy</legend>
        <div class="energy-picks" aria-label="Energy for ${dayDate.toLocaleDateString(undefined, { weekday: 'long' })}">
          ${([1, 2, 3] as Effort[]).map((effort) => `<button type="button" data-action="energy" data-date="${date}" data-value="${effort}" aria-pressed="${day.energy === effort}" title="${effortLabel(effort)} energy">${'●'.repeat(effort)}</button>`).join('')}
        </div>
      </fieldset>
      <label class="field-label" for="school-${date}">School / canteen meal</label>
      <input id="school-${date}" data-action="school" data-date="${date}" value="${escapeHtml(day.schoolMeal)}" placeholder="e.g. tomato pasta" autocomplete="off">
      <label class="field-label" for="dinner-${date}">Dinner plan</label>
      <select id="dinner-${date}" data-action="dinner" data-date="${date}">
        <option value="">Choose dinner</option>
        ${options}
        ${leftoverOptions ? `<optgroup label="Available leftovers">${leftoverOptions}</optgroup>` : ''}
        <option value="other" ${currentValue === 'other' ? 'selected' : ''}>Flexible / takeout night</option>
      </select>
      ${day.dinner ? `<p class="meal-name">${escapeHtml(dinnerName(day.dinner, data.recipes))}</p>${day.dinner.kind !== 'other' && recipeById(day.dinner.recipeId) ? pips(recipeById(day.dinner.recipeId)!.effort) : ''}` : '<p class="meal-name">Nothing planned yet</p>'}
      <ul class="warnings" aria-live="polite">${warnings.map((warning) => `<li class="warning">${escapeHtml(warning.message)}</li>`).join('')}</ul>
      ${day.dinner ? `<div class="outcome-row" aria-label="Dinner outcome"><button type="button" data-action="outcome" data-date="${date}" data-outcome="cooked" aria-pressed="${day.outcome === 'cooked'}">✓ Cooked</button><button type="button" data-action="outcome" data-date="${date}" data-outcome="abandoned" aria-pressed="${day.outcome === 'abandoned'}">× Changed</button></div>` : ''}
    </article>`;
}

function renderRecipe(recipe: Recipe): string {
  return `<li><article class="recipe-card">
    <div class="recipe-card-top"><h3>${escapeHtml(recipe.name)}</h3>${pips(recipe.effort)}</div>
    <p>${recipe.leftoverMeals ? `Makes ${recipe.leftoverMeals} extra dinner${recipe.leftoverMeals === 1 ? '' : 's'}.` : 'No planned leftovers.'} ${recipe.ingredients.length} grocery item${recipe.ingredients.length === 1 ? '' : 's'}.</p>
    ${recipe.tags.length ? `<ul class="tag-list" aria-label="User-entered tags">${recipe.tags.map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join('')}</ul>` : ''}
    ${recipe.notes ? `<p>${escapeHtml(recipe.notes)}</p>` : ''}
    <div class="recipe-actions"><button type="button" data-action="edit-recipe" data-id="${escapeHtml(recipe.id)}">Edit</button><button type="button" data-action="delete-recipe" data-id="${escapeHtml(recipe.id)}">Delete</button></div>
  </article></li>`;
}

function render(): void {
  const week = ensureWeek(data, activeWeek);
  const dates = weekDates(activeWeek);
  const allWarnings = dates.flatMap((date) => warningsForDay(week, date, data.recipes));
  const planned = dates.filter((date) => week.days[date]?.dinner).length;
  const cooked = dates.filter((date) => week.days[date]?.outcome === 'cooked').length;
  const groceries = groceryRows(week, data.recipes).length;
  app.innerHTML = `
    <header class="app-header">
      <div class="topbar">
        <a class="brand" href="/" aria-label="Low-Energy Menu home"><span class="brand-mark" aria-hidden="true">◒</span><span>Low-Energy Menu</span></a>
        <nav class="header-nav" aria-label="Main navigation"><a href="#planner">Week</a><a href="#recipes">Recipes</a><a href="#data">Data & unlock</a></nav>
        <span class="status-chip ${navigator.onLine ? '' : 'offline'}" id="network-status"><span class="status-dot" aria-hidden="true"></span>${navigator.onLine ? (offlineReady ? 'Ready offline' : 'Online') : 'Offline'}</span>
      </div>
      <div class="hero">
        <div class="hero-copy"><p class="eyebrow">A week that respects the cook</p><h1>Plan for the energy you actually have.</h1><p class="lede">Match dinner effort to each day, spot school-meal repeats, carry leftovers forward, and leave with one honest grocery list.</p></div>
        <figure class="hero-art"><img src="/assets/week-rhythm.webp" width="1200" height="800" alt="Seven geometric place settings arranged around two linked leftover bowls" fetchpriority="high" decoding="async"><figcaption class="hero-caption">Seven days · one household rhythm</figcaption></figure>
      </div>
    </header>
    <main id="main" class="app-main">
      ${storageError ? `<p class="error-banner" role="alert">${escapeHtml(storageError)}</p>` : ''}
      ${license.notice ? `<p class="notice-banner" role="status">${escapeHtml(license.notice)}</p>` : ''}
      <section id="planner" aria-labelledby="planner-title">
        <div class="section-heading"><div><p class="eyebrow">Dinner map</p><h2 id="planner-title">This week's workable plan</h2><p>Start with energy, then place meals. Warnings are prompts to reconsider—not nutrition or allergy advice.</p></div>
          <div class="week-controls"><button class="icon-button" type="button" data-action="week-prev" aria-label="Previous week">←</button><span class="week-title">${formatWeek(activeWeek)}</span><button class="icon-button" type="button" data-action="week-next" aria-label="Next week">→</button></div>
        </div>
        <div class="week-grid">${dates.map(renderDay).join('')}</div>
        <div class="plan-summary" aria-label="Week summary"><span class="summary-stat"><strong>${planned}</strong><span>nights planned</span></span><span class="summary-stat"><strong>${cooked}</strong><span>cooked</span></span><span class="summary-stat"><strong>${allWarnings.length}</strong><span>checks</span></span><span class="summary-stat"><strong>${groceries}</strong><span>grocery lines</span></span></div>
      </section>

      <div class="panel-grid">
        <section class="panel" id="recipes" aria-labelledby="recipes-title">
          <div class="panel-head"><div><p class="eyebrow">Your repertoire</p><h2 id="recipes-title">Recipe cards</h2></div><button class="primary-button" type="button" data-action="add-recipe">+ Add recipe</button></div>
          ${data.recipes.length ? `<ul class="recipe-list">${data.recipes.map(renderRecipe).join('')}</ul>` : `<div class="empty-recipes"><div class="empty-geometry" aria-hidden="true"></div><div><h3>Start with dinners you already know.</h3><p>Add effort, extra leftover dinners, your own tags, and grocery ingredients. No recipe corpus or generated meals—this stays yours.</p><button class="primary-button" type="button" data-action="add-recipe">Add your first recipe</button></div></div>`}
        </section>
        <aside class="side-stack" id="data" aria-label="Grocery, data, and purchase tools">
          <section class="utility-card"><h3>Grocery list</h3><p>${groceries ? `${groceries} combined ingredient line${groceries === 1 ? '' : 's'} from dinners cooked this week.` : 'Plan a recipe dinner with ingredients to create the list.'}</p><button class="secondary-button" type="button" data-action="grocery" ${groceries ? '' : 'disabled'}>Export grocery CSV</button></section>
          <section class="utility-card"><h3>Your data, portable</h3><p>Back up every recipe and week as JSON, or bring a backup onto this device.</p><div class="button-stack"><button class="secondary-button" type="button" data-action="export">Export backup</button><label class="file-label">Import backup<input type="file" data-action="import" accept="application/json,.json"></label><button class="danger-button" type="button" data-action="erase">Erase local data</button></div><p class="data-note">Stored only in this browser. Import replaces local planning data after confirmation.</p></section>
          ${license.unlocked ? `<section class="utility-card"><span class="premium-stamp">✓ Household unlocked</span><h3>Unlimited planning</h3><p>Your one-time license unlocks unlimited recipes and full week history on this device.</p></section>` : `<section class="utility-card unlock-card"><p class="eyebrow">One-time unlock</p><h3>Keep the whole household rhythm</h3><p><span class="unlock-price">$12</span> once. No subscription.</p><ul><li>Unlimited recipe cards</li><li>Full previous and future week history</li><li>Free export stays free</li></ul><a class="buy-button" href="${checkoutUrl}">Buy household unlock</a><form class="restore-form" data-action="restore"><label for="license-token">Have a license? Paste it</label><div class="restore-row"><input id="license-token" name="license" required autocomplete="off"><button class="secondary-button" type="submit">Restore</button></div></form><p><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a><br>Sociobot/Dodo is the merchant of record.</p></section>`}
        </aside>
      </div>
    </main>
    <footer class="app-footer"><div class="footer-inner"><span>Built for real weeks, not perfect ones. Illustration generated for this product.</span><nav class="footer-links" aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-low-energy-menu">Source</a></nav></div></footer>
    <div class="toast-region" aria-live="polite" aria-atomic="true">${toastMessage ? `<div class="toast"><span>${escapeHtml(toastMessage)}</span><button type="button" data-action="toast">${updateWorker ? 'Reload' : 'Dismiss'}</button></div>` : ''}</div>
    <dialog id="recipe-dialog" aria-labelledby="recipe-dialog-title"><form class="dialog-form" id="recipe-form"><input type="hidden" name="id"><h2 id="recipe-dialog-title">Add a recipe</h2><p class="dialog-intro">Record what your household already cooks. Tags and allergens are your own notes, not verified claims.</p>
      <div class="form-grid"><div class="form-field full"><label for="recipe-name">Recipe name</label><input id="recipe-name" name="name" required maxlength="80" autocomplete="off"></div>
      <div class="form-field"><label for="recipe-effort">Effort</label><select id="recipe-effort" name="effort"><option value="1">Low · mostly hands-off</option><option value="2" selected>Medium · some prep</option><option value="3">High · active cooking</option></select></div>
      <div class="form-field"><label for="recipe-leftovers">Extra dinners made</label><input id="recipe-leftovers" name="leftovers" type="number" min="0" max="6" value="0" inputmode="numeric"></div>
      <div class="form-field full"><label for="recipe-tags">Tags / allergen notes</label><input id="recipe-tags" name="tags" maxlength="160" placeholder="vegetarian, contains nuts, pasta"><p class="help-text">Comma-separated, entered and checked by you.</p></div>
      <div class="form-field full"><label for="recipe-ingredients">Grocery ingredients</label><textarea id="recipe-ingredients" name="ingredients" placeholder="2 | cans | chickpeas&#10;1 | bunch | spinach"></textarea><p class="help-text">One per line. Use quantity | unit | ingredient, or just an ingredient name.</p></div>
      <div class="form-field full"><label for="recipe-notes">Practical notes</label><textarea id="recipe-notes" name="notes" maxlength="300" placeholder="Freezes well; child prefers sauce on the side"></textarea></div></div>
      <p class="form-error" id="recipe-error" role="alert"></p><div class="dialog-actions"><button class="secondary-button" type="button" data-action="close-recipe">Cancel</button><button class="primary-button" type="submit">Save recipe</button></div></form></dialog>`;
  bindEvents();
}

async function persist(message?: string): Promise<void> {
  try { await saveData(data); storageError = ''; if (message) showToast(message); }
  catch { storageError = 'Your change could not be saved locally. Export a backup before closing this page.'; render(); }
}

function showToast(message: string): void {
  toastMessage = message;
  const region = document.querySelector('.toast-region');
  if (region) region.innerHTML = `<div class="toast"><span>${escapeHtml(message)}</span><button type="button" data-action="toast">${updateWorker ? 'Reload' : 'Dismiss'}</button></div>`;
  region?.querySelector('button')?.addEventListener('click', () => {
    if (updateWorker) { updateWorker.postMessage({ type: 'SKIP_WAITING' }); return; }
    toastMessage = ''; if (region) region.innerHTML = '';
  });
}

function download(name: string, contents: string, type: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([contents], { type }));
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1_000);
}

function canOpenWeek(start: string): boolean {
  if (license.unlocked) return true;
  const current = mondayOf();
  return start === current || start === addDays(current, 7);
}

function openRecipeDialog(id?: string): void {
  if (!id && data.recipes.length >= 8 && !license.unlocked) {
    document.querySelector<HTMLElement>('.unlock-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('The free plan holds 8 recipes. Unlock once for unlimited cards.');
    return;
  }
  const dialog = document.querySelector<HTMLDialogElement>('#recipe-dialog');
  const form = document.querySelector<HTMLFormElement>('#recipe-form');
  if (!dialog || !form) return;
  form.reset();
  const recipe = id ? recipeById(id) : undefined;
  (form.elements.namedItem('id') as HTMLInputElement).value = recipe?.id || '';
  (form.elements.namedItem('name') as HTMLInputElement).value = recipe?.name || '';
  (form.elements.namedItem('effort') as HTMLSelectElement).value = String(recipe?.effort || 2);
  (form.elements.namedItem('leftovers') as HTMLInputElement).value = String(recipe?.leftoverMeals || 0);
  (form.elements.namedItem('tags') as HTMLInputElement).value = recipe?.tags.join(', ') || '';
  (form.elements.namedItem('ingredients') as HTMLTextAreaElement).value = recipe?.ingredients.map((item) => typeof item.quantity === 'number' ? `${item.quantity} | ${item.unit || ''} | ${item.name}` : item.name).join('\n') || '';
  (form.elements.namedItem('notes') as HTMLTextAreaElement).value = recipe?.notes || '';
  dialog.querySelector('h2')!.textContent = recipe ? 'Edit recipe' : 'Add a recipe';
  dialog.showModal();
  requestAnimationFrame(() => (form.elements.namedItem('name') as HTMLInputElement).focus());
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-action="energy"]').forEach((button) => button.addEventListener('click', () => {
    ensureWeek(data, activeWeek).days[button.dataset.date!]!.energy = Number(button.dataset.value) as Effort;
    void persist(); render();
  }));
  document.querySelectorAll<HTMLInputElement>('[data-action="school"]').forEach((input) => input.addEventListener('change', () => {
    ensureWeek(data, activeWeek).days[input.dataset.date!]!.schoolMeal = input.value.trim();
    void persist(); render();
  }));
  document.querySelectorAll<HTMLSelectElement>('[data-action="dinner"]').forEach((select) => select.addEventListener('change', () => {
    const day = ensureWeek(data, activeWeek).days[select.dataset.date!]!;
    if (!select.value) day.dinner = null;
    else if (select.value === 'other') day.dinner = { kind: 'other', label: 'Flexible / takeout night' };
    else {
      const [kind, recipeId] = select.value.split(':') as ['recipe' | 'leftover', string];
      day.dinner = { kind, recipeId };
    }
    day.outcome = 'planned'; void persist(); render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-action="outcome"]').forEach((button) => button.addEventListener('click', () => {
    const day = ensureWeek(data, activeWeek).days[button.dataset.date!]!;
    const next = button.dataset.outcome as 'cooked' | 'abandoned';
    day.outcome = day.outcome === next ? 'planned' : next;
    void persist('Outcome saved.'); render();
  }));
  document.querySelector('[data-action="week-prev"]')?.addEventListener('click', () => {
    const target = addDays(activeWeek, -7);
    if (!canOpenWeek(target)) { showToast('Previous week history is part of the one-time unlock.'); return; }
    activeWeek = target; render(); document.querySelector('#planner')?.scrollIntoView();
  });
  document.querySelector('[data-action="week-next"]')?.addEventListener('click', () => {
    const target = addDays(activeWeek, 7);
    if (!canOpenWeek(target)) { showToast('Planning beyond next week is part of the one-time unlock.'); return; }
    activeWeek = target; render(); document.querySelector('#planner')?.scrollIntoView();
  });
  document.querySelectorAll('[data-action="add-recipe"]').forEach((button) => button.addEventListener('click', () => openRecipeDialog()));
  document.querySelectorAll<HTMLElement>('[data-action="edit-recipe"]').forEach((button) => button.addEventListener('click', () => openRecipeDialog(button.dataset.id)));
  document.querySelectorAll<HTMLElement>('[data-action="delete-recipe"]').forEach((button) => button.addEventListener('click', () => {
    const recipe = recipeById(button.dataset.id);
    if (!recipe || !confirm(`Delete “${recipe.name}”? Existing dinner slots will show a missing recipe.`)) return;
    data.recipes = data.recipes.filter((item) => item.id !== recipe.id); void persist('Recipe deleted.'); render();
  }));
  document.querySelector('[data-action="close-recipe"]')?.addEventListener('click', () => document.querySelector<HTMLDialogElement>('#recipe-dialog')?.close());
  document.querySelector<HTMLDialogElement>('#recipe-dialog')?.addEventListener('click', (event) => {
    const dialog = event.currentTarget as HTMLDialogElement;
    if (event.target === dialog) dialog.close();
  });
  document.querySelector<HTMLFormElement>('#recipe-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const values = new FormData(form);
    const name = String(values.get('name') || '').trim();
    const error = form.querySelector<HTMLElement>('#recipe-error')!;
    if (!name) { error.textContent = 'Give this recipe a name.'; return; }
    const id = String(values.get('id') || '') || crypto.randomUUID();
    const existing = recipeById(id);
    const recipe: Recipe = { id, name, effort: Number(values.get('effort')) as Effort, leftoverMeals: Math.max(0, Math.min(6, Number(values.get('leftovers')) || 0)), tags: String(values.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean), ingredients: parseIngredients(String(values.get('ingredients') || '')), notes: String(values.get('notes') || '').trim(), createdAt: existing?.createdAt || new Date().toISOString() };
    if (existing) data.recipes[data.recipes.findIndex((item) => item.id === id)] = recipe; else data.recipes.push(recipe);
    await persist(existing ? 'Recipe updated.' : 'Recipe added.'); document.querySelector<HTMLDialogElement>('#recipe-dialog')?.close(); render();
  });
  document.querySelector('[data-action="grocery"]')?.addEventListener('click', () => download(`grocery-${activeWeek}.csv`, groceryCsv(ensureWeek(data, activeWeek), data.recipes), 'text/csv;charset=utf-8'));
  document.querySelector('[data-action="export"]')?.addEventListener('click', () => download(`low-energy-menu-${new Date().toLocaleDateString('en-CA')}.json`, JSON.stringify(data, null, 2), 'application/json'));
  document.querySelector<HTMLInputElement>('[data-action="import"]')?.addEventListener('change', async (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const imported = validateImport(JSON.parse(await file.text()));
      if (!confirm(`Replace local data with “${file.name}”? This contains ${imported.recipes.length} recipes.`)) { input.value = ''; return; }
      data = imported; activeWeek = mondayOf(); await persist('Backup imported.'); render();
    } catch (error) { showToast(error instanceof Error ? error.message : 'That backup could not be imported.'); input.value = ''; }
  });
  document.querySelector('[data-action="erase"]')?.addEventListener('click', async () => {
    if (!confirm('Erase every local recipe and weekly plan on this device? Export a backup first if you may need it.')) return;
    await eraseData(); location.reload();
  });
  document.querySelector<HTMLFormElement>('form[data-action="restore"]')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const token = new FormData(event.currentTarget as HTMLFormElement).get('license');
    if (!token) return; storeLicense(String(token)); license = { unlocked: true, notice: 'Checking license…' }; render(); license = await verifyLicense(true); render();
  });
  document.querySelector('[data-action="toast"]')?.addEventListener('click', () => {
    if (updateWorker) { updateWorker.postMessage({ type: 'SKIP_WAITING' }); return; }
    toastMessage = ''; document.querySelector('.toast')?.remove();
  });
}

function updateNetworkStatus(): void {
  const chip = document.querySelector('#network-status');
  if (!chip) return;
  chip.classList.toggle('offline', !navigator.onLine);
  chip.innerHTML = `<span class="status-dot" aria-hidden="true"></span>${navigator.onLine ? (offlineReady ? 'Ready offline' : 'Online') : 'Offline'}`;
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  offlineReady = true;
  updateNetworkStatus();
  if (registration.waiting) { updateWorker = registration.waiting; showToast('An app update is ready. Reload to use it.'); }
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { updateWorker = worker; showToast('An app update is ready. Reload to use it.'); } });
  });
}

async function start(): Promise<void> {
  acceptLicenseFromUrl();
  license = cachedLicenseState();
  try { data = await loadData(); ensureWeek(data, activeWeek); await saveData(data); }
  catch { data = { version: 1, recipes: [], weeks: {}, updatedAt: new Date().toISOString() }; ensureWeek(data, activeWeek); storageError = 'Local storage is unavailable. Changes may not survive this tab.'; }
  render();
  addEventListener('online', updateNetworkStatus); addEventListener('offline', updateNetworkStatus);
  void registerServiceWorker();
  if (localStorage.getItem('sb_license:low-energy-menu')) { license = await verifyLicense(); render(); }
}

void start();
