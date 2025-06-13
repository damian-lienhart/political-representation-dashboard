import { mergeConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

const baseViteConfig = defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
})

export default mergeConfig(baseViteConfig, {
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
        deps: {
            inline: ['@vue']
        }
    }
})
