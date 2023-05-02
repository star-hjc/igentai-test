import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        vue(),
        AutoImport({
            imports: ['vue', 'pinia'],
            resolvers: [ElementPlusResolver()],
            eslintrc: {
                /** 生成变量白名单,手动改true保存再改false */
                enabled: false,
                filepath: './.eslintrc-auto-import.json',
                globalsPropValue: true
            }
        }),
        Components({
            resolvers: [ElementPlusResolver({ importStyle: 'css' })]
        })
    ],
    resolve: {
        /** 配置别名 */
        alias: {
            '@': `${path.resolve(__dirname, './src')}/`
        }
    },
    server: { hmr: true }
})
