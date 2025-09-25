// server.ts (Angular 18)
import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';          // ✅ v18 location
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import bootstrap from './main.server';

// --- helpers ---
function isMainEsmModule(moduleUrl: string): boolean {
  // Equivalent to v19's isMainModule: compares import.meta.url to argv[1]
  // and ensures we're running from a file:// URL.
  if (!moduleUrl.startsWith('file:')) return false;
  const mainArg = process.argv[1];
  if (!mainArg) return false;
  return pathToFileURL(mainArg).href === moduleUrl;
}

// --- paths ---
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

// --- app ---
const app = express();
const commonEngine = new CommonEngine();

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }),
);

/**
 * SSR handler
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html: string) => res.send(html))
    .catch((err: unknown) => next(err));
});

/**
 * Start server only when this file is executed directly (ESM-safe).
 */
if (isMainEsmModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
