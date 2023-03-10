#!/usr/bin/env node

import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill';
import esbuild from 'esbuild';
import {existsSync, mkdirSync, readdirSync, statSync, writeFileSync} from 'fs';
import {join} from 'path';

const dist = join(process.cwd(), 'dist');

const createDistFolder = () => {
  if (!existsSync(dist)) {
    mkdirSync(dist);
  }
};

const buildEsmCjs = () => {
  const entryPoints = readdirSync(join(process.cwd(), 'src'))
    .filter(
      (file) =>
        !file.includes('test') &&
        !file.includes('spec') &&
        !file.endsWith('.swp') &&
        statSync(join(process.cwd(), 'src', file)).isFile()
    )
    .map((file) => `src/${file}`);

  // esm output bundles with code splitting
  esbuild
    .build({
      entryPoints,
      outdir: 'dist/browser',
      bundle: true,
      sourcemap: true,
      minify: true,
      splitting: true,
      format: 'esm',
      define: {global: 'window'},
      target: ['esnext'],
      plugins: [NodeModulesPolyfillPlugin()]
    })
    .catch(() => process.exit(1));

  // cjs output bundle
  esbuild
    .build({
      entryPoints: ['src/index.ts'],
      outfile: 'dist/node/index.mjs',
      bundle: true,
      sourcemap: true,
      minify: true,
      format: 'esm',
      platform: 'node',
      target: ['node18', 'esnext'],
      banner: {
        js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);"
      }
    })
    .catch(() => process.exit(1));
};

const writeEntries = () => {
  // an entry file for cjs at the root of the bundle
  writeFileSync(join(dist, 'index.js'), "export * from './esm/index.js';");

  // an entry file for esm at the root of the bundle
  writeFileSync(join(dist, 'index.cjs.js'), "module.exports = require('./cjs/index.cjs.js');");
};

export const build = () => {
  createDistFolder();
  buildEsmCjs();
  writeEntries();
};
