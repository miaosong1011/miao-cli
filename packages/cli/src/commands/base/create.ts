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
import { validateGivenFramework } from '../../utils/validateGivenFramework'
import { validateGivenTemplate } from '../../utils/validateGivenTemplate'

const DEFAULT_FRAMEWORK: Framework = 'vue'
const DEFAULT_TEMPLATE: Template = 'vue-ts'

type CreateCommandOptions = {
    framework?: Framework
    template?: Template
    remote?: boolean
    remoteTemplate?: string
    remoteSource?: string
    remoteRef?: string
    yes?: boolean
    install?: boolean
    packageManager?: string
    force?: boolean
}

const CANCELLED_MESSAGE = '__MIAO_PROMPT_CANCELLED__'
const REMOTE_TEMPLATE_PRESETS = {
    monorepo: 'github:miaosong1011/vue-ts-monorepo',
    turborepo: 'github:miaosong1011/vue-ts-turborepo'
} as const

type RemoteTemplatePreset = keyof typeof REMOTE_TEMPLATE_PRESETS

const selectPrompt = async <T>(message: string, choices: { title: string; value: T }[]) => {
    const response = await prompts(
        {
            type: 'select',
            choices,
            name: 'value',
            message
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

const resolveRemoteSourceByPreset = (remoteTemplate?: string) => {
    if (!remoteTemplate) {
        return undefined
    }

    if (remoteTemplate === 'monorepo' || remoteTemplate === 'turborepo') {
        return REMOTE_TEMPLATE_PRESETS[remoteTemplate as RemoteTemplatePreset]
    }

    throw new Error(`Unsupported remote template "${remoteTemplate}". Use monorepo or turborepo.`)
}

const installDependencies = async (projectPath: string, packageManager: PackageManager) => {
    const params = packageManager === 'npm' ? ['install'] : packageManager === 'yarn' ? ['install'] : ['install']

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

export const create = (program: Command) =>
    program
        .createCommand('create')
        .arguments('<project-name>')
        .option('-f, --framework <framework>', 'framework')
        .option('-t, --template <template>', 'template')
        .option('-y, --yes', 'skip prompts and use defaults for missing options')
        .option('--install', 'install dependencies after project creation')
        .option('--package-manager <pm>', 'package manager for --install (pnpm|npm|yarn)', 'pnpm')
        .option('-r, --remote', 'remote template')
        .option('--remote-template <name>', 'remote template preset (monorepo|turborepo)')
        .option('--remote-source <source>', 'remote template source, e.g. github:user/repo')
        .option('--remote-ref <ref>', 'remote template branch, tag, or commit')
        .option('--force', 'overwrite target directory if it exists and is not empty')
        .description('Create project from local or remote template')
        .helpOption('-h, --help', 'display help for command')
        .action(async (projectName: string, options: CreateCommandOptions) => {
            /**
             * validate project name
             */
            let { framework, template } = options
            const { remote, remoteTemplate, remoteRef, remoteSource, force, yes, install, packageManager } = options
            const projectPath = resolve(process.cwd(), projectName)
            const resolvedPackageManager = resolvePackageManager(packageManager)
            const presetRemoteSource = resolveRemoteSourceByPreset(remoteTemplate)
            const finalRemoteSource = remoteSource || presetRemoteSource

            try {
                await warnIfCreatingInsideWorkspace(projectPath)

                if (remote) {
                    await loadTemplate({
                        projectName,
                        remote,
                        remoteRef,
                        remoteSource: finalRemoteSource,
                        force
                    })
                    if (install) {
                        logger.info(pc.green(`Installing dependencies with ${resolvedPackageManager}...`))
                        await installDependencies(projectPath, resolvedPackageManager)
                    }
                    return
                }

                // If the framework is not specified, prompt the user to select a framework
                if (!framework || !validateGivenFramework(framework)) {
                    if (yes) {
                        framework = DEFAULT_FRAMEWORK
                    } else {
                        framework = await selectPrompt('What is your framework?', [
                            { title: 'Vue', value: 'vue' },
                            { title: 'React', value: 'react' },
                            { title: 'Vanilla', value: 'vanilla' }
                        ])
                    }
                }

                // If the template is not specified, prompt the user to select a template
                if (!framework || !template || !validateGivenTemplate(framework, template)) {
                    if (!framework) {
                        logger.error(pc.red('Invalid framework'))
                        process.exit(1)
                    }

                    if (yes) {
                        template = (templateChoices[framework][0]?.value ?? DEFAULT_TEMPLATE) as Template
                    } else {
                        const choices = templateChoices[framework] as { title: string; value: Template }[]
                        template = await selectPrompt<Template>('What is your template?', choices)
                    }
                }

                if (!framework || !template) {
                    logger.error(pc.red('Invalid framework or template'))
                    process.exit(1)
                }

                logger.info(pc.green(`Create project ${projectName} with ${framework} and ${template}`))

                await loadTemplate({ projectName, template, remote, remoteRef, remoteSource, force })

                if (install) {
                    logger.info(pc.green(`Installing dependencies with ${resolvedPackageManager}...`))
                    await installDependencies(projectPath, resolvedPackageManager)
                }
            } catch (error) {
                if (error instanceof Error && error.message === CANCELLED_MESSAGE) {
                    logger.warn(pc.yellow('Operation cancelled by user.'))
                    process.exit(0)
                }
                const message = error instanceof Error ? error.message : 'Unknown error'
                logger.error(pc.red(`Create project failed. ${message}`))
                process.exit(1)
            }
        })
