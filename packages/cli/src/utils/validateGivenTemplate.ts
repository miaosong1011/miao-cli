/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { reactTemplateChoices, vanillaTemplateChoices, vueTemplateChoices } from '../constants/templates'
import { Framework, Template } from '../types/template'

export const validateGivenTemplate = (framework: Framework, template: Template) => {
    switch (framework) {
        case 'vue':
            return vueTemplateChoices.map(({ value }) => value).includes(template)
        case 'react':
            return reactTemplateChoices.map(({ value }) => value).includes(template)
        case 'vanilla':
            return vanillaTemplateChoices.map(({ value }) => value).includes(template)
        default:
            return false
    }
}
