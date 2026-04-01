/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { Command } from 'commander'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import pc from 'picocolors'
import prompts from 'prompts'

import { templateChoices } from '../../constants/templates'
import { Framework, PackageManager, Template } from '../../types/template'
import { loadTemplate } from '../../utils/loadTemplate'
import { logger } from '../../utils/logger'
import { warnIfCreatingInsideWorkspace } from '../../utils/projectPathWarning'
import { validateGivenTemplate } from '../../utils/validateGivenTemplate'

type CreateMonorepoCommandOptions = {
    framework?: Framework
    template?: Template
    yes?: boolean
    install?: boolean
    packageManager?: string
    force?: boolean
}

const DEFAULT_MONOREPO_FRAMEWORK: Framework = 'vue'
const DEFAULT_MONOREPO_TEMPLATE: Template = 'vue-ts-monorepo'
const CANCELLED_MESSAGE = '__MIAO_PROMPT_CANCELLED__'

const isMonorepoTemplate = (template: string) => template.endsWith('-monorepo') || template.endsWith('-turborepo')

const getMonorepoFrameworks = () =>
    (Object.keys(templateChoices) as Framework[]).filter(framework =>
        templateChoices[framework].some(choice => isMonorepoTemplate(choice.value))
    )

const getMonorepoTemplateChoices = (framework: Framework) => templateChoices[framework].filter(choice => isMonorepoTemplate(choice.value))

const selectPrompt = async <T>(message: string, choices: { title: string; value: T }[]) => {
    const response = await prompts(
        {
            type: 'select',
            name: 'value',
            message,
            choices
        },
        {
            onCancel: () => {
                throw new Error(CANCELLED_MESSAGE)
            }
        }
    )

    return response.value as T | undefined
}

const resolvePackageManager = (input?: string): PackageManager => {
    if (!input) {
        return 'pnpm'
    }

    if (input === 'pnpm' || input === 'npm' || input === 'yarn') {
        return input
    }

    throw new Error(`Unsupported package manager "${input}". Use pnpm, npm, or yarn.`)
}

const installDependencies = async (projectPath: string, packageManager: PackageManager) => {
    const params = ['install']

    await new Promise<void>((resolvePromise, reject) => {
        const child = spawn(packageManager, params, {
            stdio: 'inherit',
            cwd: projectPath
        })

        child.on('error', error => {
            reject(error)
        })

        child.on('close', code => {
            if (code === 0) {
                resolvePromise()
                return
            }
            reject(new Error(`Install dependencies failed with exit code ${code ?? 1}.`))
        })
    })
}

export const createMonorepo = (program: Command) =>
    program
        .createCommand('create-monorepo')
        .arguments('<project-name>')
        .option('-f, --framework <framework>', 'framework (monorepo templates only)')
        .option('-t, --template <template>', 'template (monorepo templates only)')
        .option('-y, --yes', 'skip prompts and use defaults for missing options')
        .option('--install', 'install dependencies after project creation')
        .option('--package-manager <pm>', 'package manager for --install (pnpm|npm|yarn)', 'pnpm')
        .option('--force', 'overwrite target directory if it exists and is not empty')
        .description('Create monorepo project from team templates (supports -f/-t)')
        .helpOption('-h, --help', 'display help for command')
        .action(async (projectName: string, options: CreateMonorepoCommandOptions) => {
            let { framework, template } = options
            const { yes, install, packageManager, force } = options
            const projectPath = resolve(process.cwd(), projectName)
            const monorepoFrameworks = getMonorepoFrameworks()
            const autoSelectDefaults = yes || !process.stdout.isTTY

            try {
                await warnIfCreatingInsideWorkspace(projectPath)

                if (framework && !monorepoFrameworks.includes(framework)) {
                    throw new Error(`Framework "${framework}" has no monorepo templates.`)
                }

                if (template && !isMonorepoTemplate(template)) {
                    throw new Error(`Template "${template}" is not a monorepo template.`)
                }

                if (!framework) {
                    if (autoSelectDefaults) {
                        framework = DEFAULT_MONOREPO_FRAMEWORK
                    } else {
                        framework = await selectPrompt(
                            'Which monorepo framework do you want?',
                            monorepoFrameworks.map(item => ({
                                title: item,
                                value: item
                            }))
                        )
                    }
                }

                if (!framework) {
                    throw new Error('Invalid framework.')
                }

                const monorepoChoices = getMonorepoTemplateChoices(framework)
                if (monorepoChoices.length === 0) {
                    throw new Error(`No monorepo templates found for framework "${framework}".`)
                }

                if (!template || !validateGivenTemplate(framework, template) || !isMonorepoTemplate(template)) {
                    if (autoSelectDefaults) {
                        template = (monorepoChoices[0]?.value ?? DEFAULT_MONOREPO_TEMPLATE) as Template
                    } else {
                        template = await selectPrompt<Template>(
                            'Which monorepo template do you want?',
                            monorepoChoices as { title: string; value: Template }[]
                        )
                    }
                }

                if (!template) {
                    throw new Error('Invalid template.')
                }

                await loadTemplate({
                    projectName,
                    template,
                    force
                })

                if (install) {
                    const resolvedPackageManager = resolvePackageManager(packageManager)
                    logger.info(pc.green(`Installing dependencies with ${resolvedPackageManager}...`))
                    await installDependencies(projectPath, resolvedPackageManager)
                }

                logger.log('')
                logger.log(pc.bold('Next steps:'))
                logger.log(`  cd ${projectName}`)
                if (!install) {
                    logger.log('  pnpm install')
                }
                logger.log('  pnpm check')
                logger.log('  pnpm commit')
            } catch (error) {
                if (error instanceof Error && error.message === CANCELLED_MESSAGE) {
                    logger.warn(pc.yellow('Operation cancelled by user.'))
                    process.exit(0)
                }
                const message = error instanceof Error ? error.message : 'Unknown error'
                logger.error(pc.red(`Create monorepo failed. ${message}`))
                process.exit(1)
            }
        })
