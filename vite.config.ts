import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/Defender/' : '/',
    server: {
        port: 3000,
        open: false,
    },
    build: {
        target: 'es2020',
        outDir: 'dist',
    },
}));
