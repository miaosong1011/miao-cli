/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { Command } from 'commander'
import pc from 'picocolors'

import pkg from '../../../package.json'
import { logger } from '../../utils/logger'

export const info = (program: Command) =>
    program
        .createCommand('info')
        .description('Display info about the miao CLI')
        .action(() => {
            logger.log(pc.bgGreen(`Product: miao CLI v${pkg.version}`))
            logger.log(pc.green('Author: miaosong'))
            logger.log(pc.underline('Website: https://www.miaos.site'))
        })
