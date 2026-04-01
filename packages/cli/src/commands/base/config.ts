/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { Command } from 'commander'
import pc from 'picocolors'

import { readCLIConfig, writeCLIConfig } from '../../utils/config'
import { logger } from '../../utils/logger'

type ConfigKey = 'remoteSource' | 'remoteRef'

const validateConfigKey = (key: string): key is ConfigKey => key === 'remoteSource' || key === 'remoteRef'

export const config = (program: Command) =>
    program
        .createCommand('config')
        .description('Manage global miao CLI configuration')
        .addCommand(
            program
                .createCommand('list')
                .description('List current global config')
                .option('--json', 'Output as JSON')
                .action(async (options: { json?: boolean }) => {
                    const current = await readCLIConfig()
                    if (options.json) {
                        logger.log(JSON.stringify(current, null, 2))
                        return
                    }

                    logger.log(pc.bold('Global config'))
                    logger.log(`remoteSource: ${current.remoteSource ?? '(not set)'}`)
                    logger.log(`remoteRef: ${current.remoteRef ?? '(not set)'}`)
                })
        )
        .addCommand(
            program
                .createCommand('get')
                .description('Get one global config value')
                .argument('<key>', 'remoteSource | remoteRef')
                .action(async (key: string) => {
                    if (!validateConfigKey(key)) {
                        logger.error(pc.red('Invalid key. Use remoteSource or remoteRef.'))
                        process.exit(1)
                    }

                    const current = await readCLIConfig()
                    logger.log(current[key] ?? '')
                })
        )
        .addCommand(
            program
                .createCommand('set')
                .description('Set one global config value')
                .argument('<key>', 'remoteSource | remoteRef')
                .argument('<value>', 'Config value')
                .action(async (key: string, value: string) => {
                    if (!validateConfigKey(key)) {
                        logger.error(pc.red('Invalid key. Use remoteSource or remoteRef.'))
                        process.exit(1)
                    }

                    const current = await readCLIConfig()
                    const next = {
                        ...current,
                        [key]: value
                    }
                    await writeCLIConfig(next)
                    logger.log(pc.green(`Saved ${key}=${value}`))
                })
        )
