import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';

const watch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

// Salin file statis (index.html, css, dll) ke dist/
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/js', { recursive: true });
cpSync('client/public', 'dist', { recursive: true });

const options = {
  entryPoints: ['client/src/main.jsx'],
  outfile: 'dist/js/app.js',
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  sourcemap: !isProd,
  minify: isProd,
  define: { 'process.env.NODE_ENV': isProd ? '"production"' : '"development"' },
  logLevel: 'info',
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('Watching client/src untuk perubahan...');
} else {
  await esbuild.build(options);
  console.log('Build frontend selesai di dist/');
}
