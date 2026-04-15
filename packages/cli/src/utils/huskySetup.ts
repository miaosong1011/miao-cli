import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const runCommand = async (
    command: string,
    args: string[],
    cwd: string,
    options?: {
        stdio?: 'inherit' | 'pipe'
    }
) => {
    const stdio = options?.stdio ?? 'inherit'

    return await new Promise<{ stdout: string }>((resolvePromise, reject) => {
        const child = spawn(command, args, {
            cwd,
            stdio: stdio === 'pipe' ? ['ignore', 'pipe', 'ignore'] : 'inherit'
        })

        let stdout = ''

        if (stdio === 'pipe') {
            child.stdout?.on('data', chunk => {
                stdout += chunk.toString()
            })
        }

        child.on('error', reject)
        child.on('close', code => {
            if (code === 0) {
                resolvePromise({ stdout: stdout.trim() })
                return
            }

            reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code ?? 1}.`))
        })
    })
}

export const hasHuskyHooks = (projectPath: string) => existsSync(join(projectPath, '.husky', 'pre-commit'))

const getGitTopLevel = async (projectPath: string) => {
    try {
        const { stdout } = await runCommand('git', ['rev-parse', '--show-toplevel'], projectPath, {
            stdio: 'pipe'
        })

        return stdout ? resolve(stdout) : null
    } catch {
        return null
    }
}

export const ensureStandaloneGitRepo = async (projectPath: string) => {
    if (!hasHuskyHooks(projectPath)) {
        return 'no-husky' as const
    }

    const gitTopLevel = await getGitTopLevel(projectPath)
    if (!gitTopLevel) {
        await runCommand('git', ['init'], projectPath)
        return 'initialized' as const
    }

    if (gitTopLevel === resolve(projectPath)) {
        return 'ready' as const
    }

    return 'ancestor-repo' as const
}

export const installHuskyHooks = async (projectPath: string) => {
    if (!hasHuskyHooks(projectPath)) {
        return
    }

    await runCommand('npx', ['husky'], projectPath)
}
