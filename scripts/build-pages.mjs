// Compatibility with the existing GitHub Pages workflow; Cloudflare uses npm run build.
process.env.NEXT_PUBLIC_BASE_PATH ??= '/martin-kostrhun';
await import('./build-static.mjs');
