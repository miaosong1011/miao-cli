/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
export const vueTemplateChoices = [
    {
        title: 'Vue TypeScript',
        value: 'vue-ts'
    },
    {
        title: 'Vue JavaScript',
        value: 'vue'
    },
    {
        title: 'Vue TypeScript Monorepo',
        value: 'vue-ts-monorepo'
    },
    {
        title: 'Vue TypeScript Turborepo',
        value: 'vue-ts-turborepo'
    }
]

export const reactTemplateChoices = [
    {
        title: 'React TypeScript',
        value: 'react-ts'
    },
    {
        title: 'React JavaScript',
        value: 'react'
    }
]

export const vanillaTemplateChoices = [
    {
        title: 'Vanilla TypeScript',
        value: 'vanilla-ts'
    },
    {
        title: 'Vanilla JavaScript',
        value: 'vanilla'
    }
]

export const templateChoices = {
    vue: vueTemplateChoices,
    react: reactTemplateChoices,
    vanilla: vanillaTemplateChoices
}

export const frameworks = ['vue', 'react', 'vanilla'] as const

export const templates = ['vue-ts', 'vue', 'vue-ts-monorepo', 'vue-ts-turborepo', 'react-ts', 'react', 'vanilla-ts', 'vanilla'] as const
