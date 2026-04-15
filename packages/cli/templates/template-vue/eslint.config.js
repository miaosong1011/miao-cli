import js from '@eslint/js'
import importSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import vueEslintParser from 'vue-eslint-parser'

export default [
    {
        ignores: ['dist/**', '**/dist/**']
    },
    {
        files: ['**/*.{js,vue}'],
        languageOptions: {
            parser: vueEslintParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        plugins: {
            vue: pluginVue,
            'simple-import-sort': importSort
        },
        rules: {
            ...js.configs.recommended.rules,
            ...pluginVue.configs['flat/recommended'].rules,
            'no-console': 'error',
            'simple-import-sort/imports': 'error'
        }
    }
]
