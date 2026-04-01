/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { Command } from 'commander'
import pc from 'picocolors'

import { logger } from '../../utils/logger'

import { runDoctorCheck } from './doctor'

export const preview = (program: Command) =>
    program
        .createCommand('preview')
        .description('[Deprecated] Use doctor instead')
        .action(() => {
            logger.warn(pc.yellow('`miao preview` is deprecated. Running `miao doctor` instead.'))
            runDoctorCheck()
        })
