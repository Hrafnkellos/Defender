import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/Defender/' : '/',
    server: {
        port: 3000,
        open: true,
    },
    build: {
        target: 'es2020',
        outDir: 'dist',
    },
}));
