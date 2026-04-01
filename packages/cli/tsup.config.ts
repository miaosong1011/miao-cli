/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
    splitting: false,
    sourcemap: false,
    minify: true,
    clean: true,
    format: ['cjs'],
    outDir: 'dist',
    outExtension() {
        return {
            js: '.js'
        }
    }
})
