/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { pathExists } from 'fs-extra'
import { dirname, join } from 'node:path'
import pc from 'picocolors'

import { logger } from './logger'

const isInside = (baseDir: string, targetDir: string) => targetDir === baseDir || targetDir.startsWith(`${baseDir}/`)

export const warnIfCreatingInsideWorkspace = async (targetProjectPath: string) => {
    let cursor = process.cwd()

    while (true) {
        const hasWorkspaceFile = await pathExists(join(cursor, 'pnpm-workspace.yaml'))
        const hasGitDir = await pathExists(join(cursor, '.git'))

        if (hasWorkspaceFile && hasGitDir && isInside(cursor, targetProjectPath)) {
            logger.warn(pc.yellow(`You are creating a project inside workspace: ${cursor}`))
            logger.warn(pc.yellow('Recommended: cd to your target projects directory first.'))
            break
        }

        const parent = dirname(cursor)
        if (parent === cursor) {
            break
        }
        cursor = parent
    }
}
