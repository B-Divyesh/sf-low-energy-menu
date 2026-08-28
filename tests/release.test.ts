import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('release configuration regressions', () => {
  it('builds against the production Sociobot billing API by default', () => {
    const bundle = readdirSync('dist/assets')
      .filter((name) => name.endsWith('.js'))
      .map((name) => readFileSync(`dist/assets/${name}`, 'utf8'))
      .join('\n');
    expect(bundle).toContain('https://api.sociobot.in');
    expect(bundle).not.toContain('https://pilot-api.sociobot.in');
  });

  it('declares CSP, immutable assets, manifest MIME, and a 404 response', () => {
    const config = JSON.parse(readFileSync('staticwebapp.config.json', 'utf8'));
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.routes.find((route: { route: string }) => route.route === '/assets/*').headers['Cache-Control']).toContain('immutable');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
    expect(readFileSync('dist/404.html', 'utf8')).toContain('This page is not on the menu.');
  });

  it('lists every claim with one matching tagged browser test', () => {
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string; test: string }>;
    const browserTests = readFileSync('tests/e2e/app.spec.ts', 'utf8');
    expect(claims.length).toBeGreaterThan(0);
    for (const claim of claims) {
      expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
      expect(browserTests.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, 'g'))).toHaveLength(1);
    }
  });
});
