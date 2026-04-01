/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import { program } from 'commander'

import pkg from '../../package.json'

import { build } from './base/build'
import { config } from './base/config'
import { create } from './base/create'
import { createMonorepo } from './base/createMonorepo'
import { doctor } from './base/doctor'
import { info } from './base/info'
import { serve } from './base/serve'
import { template } from './base/template'
import { registerCommand } from './registerCommand'

program.version(pkg.version).description(pkg.description)
program.addHelpText(
    'after',
    `
Examples:
  $ miao create my-app -f vue -t vue-ts
  $ miao create my-app --remote
  $ miao create-monorepo team-app -f vue -t vue-ts-turborepo
  $ miao template list --json
`
)

/**
 * Register the info command
 */
registerCommand(info)

/**
 * Register the build command
 */
registerCommand(build)

/**
 * Register the config command
 */
registerCommand(config)

/**
 * Register the doctor command
 */
registerCommand(doctor)

/**
 * Register the create command
 */
registerCommand(create)

/**
 * Register the create-monorepo command
 */
registerCommand(createMonorepo)

/**
 * Register the template command
 */
registerCommand(template)

/**
 * Register the serve command
 */
registerCommand(serve)
