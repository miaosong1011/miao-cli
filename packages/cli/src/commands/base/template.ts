/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { Command } from 'commander'
import pc from 'picocolors'

import { templateChoices } from '../../constants/templates'
import { Framework } from '../../types/template'
import { logger } from '../../utils/logger'

const frameworkList = Object.keys(templateChoices) as Framework[]

const printTextList = () => {
    logger.log(pc.bold('Available templates'))
    frameworkList.forEach(framework => {
        logger.log(pc.cyan(`- ${framework}`))
        templateChoices[framework].forEach(choice => {
            logger.log(`  • ${choice.value} (${choice.title})`)
        })
    })
}

const printJsonList = () => {
    const data = frameworkList.map(framework => ({
        framework,
        templates: templateChoices[framework].map(choice => ({
            name: choice.value,
            title: choice.title
        }))
    }))

    logger.log(JSON.stringify(data, null, 2))
}

export const template = (program: Command) =>
    program
        .createCommand('template')
        .description('Template commands (use: miao template list)')
        .addCommand(
            program
                .createCommand('list')
                .description('List built-in templates')
                .option('--json', 'Output as JSON')
                .action((options: { json?: boolean }) => {
                    if (options.json) {
                        printJsonList()
                        return
                    }
                    printTextList()
                })
        )
