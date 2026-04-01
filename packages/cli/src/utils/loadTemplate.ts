/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { copy, move, pathExists, readdir, readJson, remove, writeJson } from 'fs-extra'
import { downloadTemplate } from 'giget'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'
import ora from 'ora'
import pc from 'picocolors'

import { Template } from '../types/template'

import { readCLIConfig } from './config'
import { logger } from './logger'

export type LoadLocalTemplateOptions = {
    projectName: string
    template: Template
    force?: boolean
}

export type LoadRemoteTemplateOptions = {
    projectName: string
    remoteSource?: string
    remoteRef?: string
    force?: boolean
}

export type LoadTemplateOptions = {
    projectName: string
    remote?: boolean
    remoteSource?: string
    remoteRef?: string
    template?: Template
    force?: boolean
}

const DEFAULT_REMOTE_SOURCE = 'github:miaosong1011/vue-ts-monorepo'
const DEFAULT_REMOTE_REF = 'main'
const localTemplateAliasMap: Partial<Record<Template, string>> = {
    'vue-ts-monorepo': 'vue-monorepo'
}

const validateProjectName = (projectName: string) => {
    if (!projectName || !projectName.trim()) {
        throw new Error('Project name cannot be empty.')
    }

    if (isAbsolute(projectName)) {
        throw new Error('Project name must be a relative directory name.')
    }

    if (projectName.includes('/') || projectName.includes('\\') || projectName.includes('..')) {
        throw new Error('Project name cannot contain path separators or "..".')
    }

    if (!/^[a-z0-9][a-z0-9._-]*$/.test(projectName)) {
        throw new Error('Project name can only include lowercase letters, numbers, ".", "-" and "_".')
    }
}

const getProjectPath = (projectName: string) => resolve(process.cwd(), projectName)

const ensureTargetDirectory = async (projectPath: string, force = false) => {
    const exists = await pathExists(projectPath)
    if (!exists) {
        return
    }

    const files = await readdir(projectPath)
    if (files.length === 0) {
        return
    }

    if (!force) {
        throw new Error(`Target directory "${projectPath}" is not empty. Use --force to overwrite.`)
    }

    await remove(projectPath)
}

const normalizeGitignore = async (projectPath: string) => {
    const from = join(projectPath, '_gitignore')
    const to = join(projectPath, '.gitignore')
    if (await pathExists(from)) {
        await move(from, to, { overwrite: true })
    }
}

const generatePackageJson = async (projectPath: string, projectName: string) => {
    const originalPkg = await readJson(`${projectPath}/package.json`)
    await writeJson(
        `${projectPath}/package.json`,
        {
            ...originalPkg,
            name: projectName,
            version: '0.1.0'
        },
        {
            spaces: 4
        }
    )
}

const resolveRemoteSource = async (remoteSource?: string, remoteRef?: string) => {
    const config = await readCLIConfig()
    const source = remoteSource?.trim() || config.remoteSource || DEFAULT_REMOTE_SOURCE
    const ref = remoteRef?.trim() || config.remoteRef || DEFAULT_REMOTE_REF

    if (!source) {
        throw new Error('Remote template source cannot be empty.')
    }

    if (source.includes('#')) {
        return source
    }

    return `${source}#${ref}`
}

const loadRemoteTemplate = async (options: LoadRemoteTemplateOptions) => {
    const { projectName, remoteSource, remoteRef, force } = options
    const projectPath = getProjectPath(projectName)
    const source = await resolveRemoteSource(remoteSource, remoteRef)
    let tempDir = ''

    const spinner = ora({
        text: 'Download template loading...',
        color: 'green'
    }).start()

    try {
        await ensureTargetDirectory(projectPath, force)
        tempDir = await mkdtemp(join(tmpdir(), 'miao-cli-'))

        const { dir } = await downloadTemplate(source, { dir: tempDir })

        await copy(dir, projectPath)
        await normalizeGitignore(projectPath)
        spinner.text = 'Copy template success'

        /**
         * write package.json
         */
        await generatePackageJson(projectPath, projectName)

        spinner.spinner = 'moon'
        spinner.text = pc.green(`Project named ${pc.bold(projectName)} created successfully!`)

        spinner.succeed()
    } catch (error) {
        if (error instanceof Error) {
            logger.error(pc.red(`Download template failed from "${source}". ${error.message}`))
        }
        spinner.fail()
        throw error
    } finally {
        if (tempDir) {
            await remove(tempDir)
        }
    }
}

const loadLocalTemplate = async (options: LoadLocalTemplateOptions) => {
    const { projectName, template, force } = options
    const projectPath = getProjectPath(projectName)
    const templateDir = localTemplateAliasMap[template] ?? template

    const spinner = ora({
        text: 'Copy template loading...',
        color: 'green'
    }).start()

    try {
        await ensureTargetDirectory(projectPath, force)
        const templatePath = join(__dirname, `../templates/template-${templateDir}`)
        /**
         * copy template
         */
        await copy(templatePath, projectPath)
        await normalizeGitignore(projectPath)
        spinner.text = 'Copy template success'

        /**
         * write package.json
         */
        await generatePackageJson(projectPath, projectName)

        spinner.spinner = 'moon'
        spinner.text = pc.green(`Project named ${pc.bold(projectName)} created successfully!`)

        spinner.succeed()
    } catch (error) {
        if (error instanceof Error) {
            logger.error(pc.red(`Copy template failed. ${error.message}`))
        }
        spinner.fail()
        throw error
    }
}

export const loadTemplate = async (options: LoadTemplateOptions) => {
    const { projectName, remote, remoteSource, remoteRef, template, force } = options
    validateProjectName(projectName)

    if (remote) {
        await loadRemoteTemplate({ projectName, remoteSource, remoteRef, force })
    } else {
        if (!template) {
            throw new Error('Template is required when using local template mode.')
        }
        await loadLocalTemplate({ projectName, template, force })
    }
}
