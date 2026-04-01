/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { frameworks } from '../constants/templates'
import { Framework } from '../types/template'

export const validateGivenFramework = (framework: Framework) => frameworks.includes(framework)
