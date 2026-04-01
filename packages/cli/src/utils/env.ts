/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *
 */

import { execSync } from 'node:child_process'

export function hasPnpm() {
    return !!getPnpmVersion()
}

export function getPnpmVersion() {
    let _pnpmVersion
    try {
        _pnpmVersion = execSync('pnpm --version', {
            stdio: ['pipe', 'pipe', 'ignore']
        }).toString()
    } catch {
        _pnpmVersion = undefined
    }
    return _pnpmVersion
}
