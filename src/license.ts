export interface LicenseState {
  unlocked: boolean;
  notice: string;
}

const SLUG = 'low-energy-menu';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;
const BASE_URL = (import.meta.env.VITE_BILLING_BASE_URL as string | undefined) || 'https://api.sociobot.in';

interface Verdict {
  valid: boolean;
  checkedAt: number;
  token?: string;
}

export const checkoutUrl = `${BASE_URL}/api/v1/products/${SLUG}/checkout`;

function readVerdict(token: string): Verdict | null {
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null;
    if (!verdict || typeof verdict.valid !== 'boolean' || typeof verdict.checkedAt !== 'number') return null;
    if (verdict.token && verdict.token !== token) return null;
    return verdict;
  } catch {
    return null;
  }
}

function saveToken(token: string): void {
  const normalized = token.trim();
  const previous = localStorage.getItem(TOKEN_KEY);
  localStorage.setItem(TOKEN_KEY, normalized);
  if (previous !== normalized) localStorage.removeItem(VERDICT_KEY);
}

export function acceptLicenseFromUrl(): boolean {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  saveToken(token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function cachedLicenseState(): LicenseState {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { unlocked: false, notice: '' };
  const verdict = readVerdict(token);
  if (!verdict) return { unlocked: false, notice: 'Checking this license. Paid features stay locked until it is verified.' };
  return verdict.valid
    ? { unlocked: true, notice: '' }
    : { unlocked: false, notice: 'This license is no longer active.' };
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { unlocked: false, notice: '' };
  const cached = readVerdict(token);
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cachedLicenseState();
  try {
    const response = await fetch(`${BASE_URL}/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now(), token }));
    return result.valid
      ? { unlocked: true, notice: '' }
      : { unlocked: false, notice: 'This license is no longer active.' };
  } catch {
    return cached?.valid
      ? { unlocked: true, notice: 'Offline — using the last verified license.' }
      : { unlocked: false, notice: 'License verification is unavailable. Paid features stay locked.' };
  }
}

export function storeLicense(token: string): void {
  saveToken(token);
}
