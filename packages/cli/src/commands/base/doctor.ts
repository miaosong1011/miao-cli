/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { Command } from 'commander'
import pc from 'picocolors'

import { getPnpmVersion } from '../../utils/env'
import { logger } from '../../utils/logger'

const REQUIRED_NODE_MAJOR = 20

const getNodeMajor = () => {
    const major = Number.parseInt(process.versions.node.split('.')[0], 10)
    return Number.isNaN(major) ? 0 : major
}

export const runDoctorCheck = () => {
    const nodeVersion = process.versions.node
    const nodeMajor = getNodeMajor()
    const pnpmVersion = getPnpmVersion()?.trim()

    const checks = [
        {
            label: `Node.js >= ${REQUIRED_NODE_MAJOR}`,
            pass: nodeMajor >= REQUIRED_NODE_MAJOR,
            detail: `current: ${nodeVersion}`
        },
        {
            label: 'pnpm installed',
            pass: Boolean(pnpmVersion),
            detail: `current: ${pnpmVersion ?? 'not found'}`
        }
    ]

    logger.log(pc.bold('miao doctor'))
    checks.forEach(check => {
        const prefix = check.pass ? pc.green('✔') : pc.red('✖')
        logger.log(`${prefix} ${check.label} (${check.detail})`)
    })

    const failed = checks.filter(check => !check.pass)
    if (failed.length > 0) {
        logger.error(pc.red(`Environment check failed (${failed.length} issue${failed.length > 1 ? 's' : ''}).`))
        process.exit(1)
    }
}

export const doctor = (program: Command) =>
    program
        .createCommand('doctor')
        .description('Check local environment for miao CLI')
        .action(() => {
            runDoctorCheck()
        })
