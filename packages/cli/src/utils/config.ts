/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { ensureFile, pathExists, readJson, writeJson } from 'fs-extra'
import { homedir } from 'node:os'
import { join } from 'node:path'

export type CLIConfig = {
    remoteSource?: string
    remoteRef?: string
}

const configPath = join(homedir(), '.miao-cli', 'config.json')

export const getCLIConfigPath = () => configPath

export const readCLIConfig = async (): Promise<CLIConfig> => {
    const exists = await pathExists(configPath)
    if (!exists) {
        return {}
    }

    try {
        const data = await readJson(configPath)
        return {
            remoteSource: typeof data.remoteSource === 'string' ? data.remoteSource : undefined,
            remoteRef: typeof data.remoteRef === 'string' ? data.remoteRef : undefined
        }
    } catch {
        return {}
    }
}

export const writeCLIConfig = async (config: CLIConfig) => {
    await ensureFile(configPath)
    await writeJson(configPath, config, { spaces: 4 })
}
