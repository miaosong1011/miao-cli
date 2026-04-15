import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const huskyPath = '.husky'

if (!existsSync(join(huskyPath, '_'))) {
    const hooks = ['pre-commit', 'commit-msg']
    const backups = {}
    for (const hook of hooks) {
        const hookPath = join(huskyPath, hook)
        if (existsSync(hookPath)) {
            backups[hook] = readFileSync(hookPath, 'utf-8')
        }
    }

    execSync('npx husky init', { stdio: 'inherit' })

    for (const [hook, content] of Object.entries(backups)) {
        writeFileSync(join(huskyPath, hook), content, 'utf-8')
    }
}

execSync('husky install', { stdio: 'inherit' })
