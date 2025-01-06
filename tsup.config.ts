import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ["main.ts", "stars.ts", "geometry.ts", "svg.ts"],
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
});
