/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */
import type { Command } from 'commander'
import { program } from 'commander'

// eslint-disable-next-line no-unused-vars
type Fn = (p: Command) => Command

/**
 * register new command
 * @param program
 * @param command
 */
export const registerCommand = (fn: Fn) => {
    program.addCommand(fn(program))
}
