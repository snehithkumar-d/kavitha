/* =========================================================================
   kavitha — build.mjs
   Tiny build orchestrator: PostCSS for CSS, esbuild for JS. No gulp/rollup.
   Used in CI. For v0.1.0 the built assets are checked in; v0.2+ moves them
   to .gitignore and CI generates them on every deploy.

   Usage:
     node build.mjs              # one-shot build
     node build.mjs --watch      # watch mode for local dev
   ======================================================================== */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const watch = process.argv.includes('--watch');

const cssIn  = `${__dirname}/src/css/screen.css`;
const cssOut = `${__dirname}/assets/built/screen.css`;
const jsIn   = `${__dirname}/src/js/source.js`;
const jsOut  = `${__dirname}/assets/built/source.js`;

async function buildCSS() {
    const css = await readFile(cssIn, 'utf8');
    const result = await postcss([
        postcssImport(),
        postcssPresetEnv({ stage: 2, features: { 'nesting-rules': true } }),
        autoprefixer(),
        cssnano({ preset: ['default', { discardComments: { removeAll: true } }] }),
    ]).process(css, { from: cssIn, to: cssOut, map: { inline: false } });
    await mkdir(dirname(cssOut), { recursive: true });
    await writeFile(cssOut, result.css);
    if (result.map) await writeFile(cssOut + '.map', result.map.toString());
    console.log('✓ css   ' + cssOut + '  (' + (result.css.length / 1024).toFixed(1) + ' KB)');
}

async function buildJS() {
    const result = await esbuild.build({
        entryPoints: [jsIn],
        bundle: true,
        minify: true,
        target: 'es2020',
        format: 'iife',
        outfile: jsOut,
        sourcemap: watch,
        logLevel: 'silent',
    });
    if (result.errors.length) throw new Error(result.errors.map(e => e.text).join('\n'));
    console.log('✓ js    ' + jsOut);
}

async function build() {
    try {
        await Promise.all([buildCSS(), buildJS()]);
    } catch (e) {
        console.error('✗ build failed:', e.message);
        process.exit(1);
    }
}

if (watch) {
    /* Simple polling watch — keeps deps minimal. For more sophisticated
       watching, swap in chokidar later. */
    const { watch: fsWatch } = await import('node:fs');
    await build();
    console.log('… watching src/');
    let pending;
    const trigger = () => {
        clearTimeout(pending);
        pending = setTimeout(build, 50);
    };
    fsWatch(`${__dirname}/src`, { recursive: true }, trigger);
} else {
    await build();
}
