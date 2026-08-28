export interface LicenseState {
  unlocked: boolean;
  notice: string;
}

const SLUG = 'low-energy-menu';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;
const BASE_URL = (import.meta.env.VITE_BILLING_BASE_URL as string | undefined) || 'https://api.sociobot.in';

interface Verdict { valid: boolean; checkedAt: number }

export const checkoutUrl = `${BASE_URL}/api/v1/products/${SLUG}/checkout`;

function readVerdict(): Verdict | null {
  try { return JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null; } catch { return null; }
}

export function acceptLicenseFromUrl(): boolean {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function cachedLicenseState(): LicenseState {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { unlocked: false, notice: '' };
  const verdict = readVerdict();
  if (!verdict) return { unlocked: true, notice: 'Checking license…' };
  return verdict.valid
    ? { unlocked: true, notice: '' }
    : { unlocked: false, notice: 'This license is no longer active.' };
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { unlocked: false, notice: '' };
  const cached = readVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cachedLicenseState();
  try {
    const response = await fetch(`${BASE_URL}/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    return result.valid
      ? { unlocked: true, notice: '' }
      : { unlocked: false, notice: 'This license is no longer active.' };
  } catch {
    return cached?.valid || !cached
      ? { unlocked: true, notice: 'Offline — using the last license state.' }
      : { unlocked: false, notice: 'License verification is unavailable.' };
  }
}

export function storeLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}
