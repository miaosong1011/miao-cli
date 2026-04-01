/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { Command } from 'commander'
import { spawn } from 'node:child_process'
import pc from 'picocolors'

import { hasPnpm } from '../../utils/env'
import { logger } from '../../utils/logger'

export const build = (program: Command) =>
    program
        .createCommand('build')
        .description('build project')
        .action(async () => {
            const _hasPnpm = hasPnpm()

            const command = _hasPnpm ? 'pnpm' : 'npm'
            const params = _hasPnpm ? ['build'] : ['run', 'build']

            const child = spawn(command, params, {
                stdio: 'inherit'
            })

            child.on('error', error => {
                logger.error(pc.red(`Failed to execute "${command} ${params.join(' ')}". ${error.message}`))
                process.exit(1)
            })

            child.on('close', code => {
                process.exit(code ?? 1)
            })
        })
