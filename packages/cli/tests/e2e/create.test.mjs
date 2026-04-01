import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const binPath = resolve(__dirname, '../../bin/miao')

const runMiao = (args, cwd) =>
    spawnSync(process.execPath, [binPath, ...args], {
        cwd,
        encoding: 'utf8'
    })

test('create rejects absolute project path', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))

    try {
        const outputPath = join(tmpdir(), 'miao-cli-absolute-target')
        const result = runMiao(['create', outputPath, '-f', 'vue', '-t', 'vue-ts'], cwd)

        assert.equal(result.status, 1)
        assert.match(result.stderr, /relative directory name/i)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create blocks non-empty target directory without --force', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))
    const projectName = 'existing-app'
    const projectPath = join(cwd, projectName)
    const markerPath = join(projectPath, 'keep.txt')

    try {
        rmSync(projectPath, { recursive: true, force: true })
        runMiao(['create', projectName, '-f', 'vanilla', '-t', 'vanilla'], cwd)

        mkdirSync(projectPath, { recursive: true })
        writeFileSync(markerPath, 'keep')

        const result = runMiao(['create', projectName, '-f', 'vanilla', '-t', 'vanilla'], cwd)
        assert.equal(result.status, 1)
        assert.match(result.stderr, /not empty/i)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create succeeds with --force and normalizes .gitignore', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))
    const projectName = 'force-app'
    const projectPath = join(cwd, projectName)

    try {
        runMiao(['create', projectName, '-f', 'react', '-t', 'react-ts'], cwd)

        const result = runMiao(['create', projectName, '-f', 'react', '-t', 'react-ts', '--force'], cwd)
        assert.equal(result.status, 0)

        assert.equal(existsSync(join(projectPath, '.gitignore')), true)
        assert.equal(existsSync(join(projectPath, '_gitignore')), false)

        const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf8'))
        assert.equal(packageJson.name, projectName)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create --yes uses default framework and template without prompts', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))
    const projectName = 'default-app'
    const projectPath = join(cwd, projectName)

    try {
        const result = runMiao(['create', projectName, '--yes'], cwd)
        assert.equal(result.status, 0)

        const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf8'))
        assert.equal(packageJson.name, projectName)
        assert.equal(existsSync(join(projectPath, 'vite.config.ts')), true)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create supports vue-ts-monorepo team template', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))
    const projectName = 'team-monorepo-app'
    const projectPath = join(cwd, projectName)

    try {
        const result = runMiao(['create', projectName, '-f', 'vue', '-t', 'vue-ts-monorepo'], cwd)
        assert.equal(result.status, 0)

        assert.equal(existsSync(join(projectPath, 'pnpm-workspace.yaml')), true)
        assert.equal(existsSync(join(projectPath, 'commitlint.config.js')), true)
        assert.equal(existsSync(join(projectPath, 'stylelint.config.js')), true)
        assert.equal(existsSync(join(projectPath, 'cspell.json')), true)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create-monorepo shortcut creates vue-ts-monorepo team template', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))
    const projectName = 'shortcut-monorepo-app'
    const projectPath = join(cwd, projectName)

    try {
        const result = runMiao(['create-monorepo', projectName], cwd)
        assert.equal(result.status, 0)

        assert.equal(existsSync(join(projectPath, 'pnpm-workspace.yaml')), true)
        assert.equal(existsSync(join(projectPath, 'commitlint.config.js')), true)
        assert.equal(existsSync(join(projectPath, 'stylelint.config.js')), true)
        assert.equal(existsSync(join(projectPath, 'cspell.json')), true)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create-monorepo supports explicit framework and template options', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))
    const projectName = 'monorepo-explicit-app'
    const projectPath = join(cwd, projectName)

    try {
        const result = runMiao(['create-monorepo', projectName, '-f', 'vue', '-t', 'vue-ts-monorepo'], cwd)
        assert.equal(result.status, 0)

        assert.equal(existsSync(join(projectPath, 'pnpm-workspace.yaml')), true)
        assert.equal(existsSync(join(projectPath, 'commitlint.config.js')), true)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create supports vue-ts-turborepo incremental build template', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))
    const projectName = 'vue-ts-turborepo-app'
    const projectPath = join(cwd, projectName)

    try {
        const result = runMiao(['create', projectName, '-f', 'vue', '-t', 'vue-ts-turborepo'], cwd)
        assert.equal(result.status, 0)

        assert.equal(existsSync(join(projectPath, 'turbo.json')), true)
        assert.equal(existsSync(join(projectPath, 'apps/web/package.json')), true)
        assert.equal(existsSync(join(projectPath, 'packages/shared/package.json')), true)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create-monorepo rejects non-monorepo template', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))

    try {
        const result = runMiao(['create-monorepo', 'invalid-monorepo-app', '-f', 'vue', '-t', 'vue-ts'], cwd)
        assert.equal(result.status, 1)
        assert.match(`${result.stdout}\n${result.stderr}`, /not a monorepo template/i)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create vue template includes team collaboration standards', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))
    const projectName = 'vue-team-app'
    const projectPath = join(cwd, projectName)

    try {
        const result = runMiao(['create', projectName, '-f', 'vue', '-t', 'vue'], cwd)
        assert.equal(result.status, 0)

        assert.equal(existsSync(join(projectPath, 'eslint.config.js')), true)
        assert.equal(existsSync(join(projectPath, 'stylelint.config.js')), true)
        assert.equal(existsSync(join(projectPath, 'commitlint.config.js')), true)
        assert.equal(existsSync(join(projectPath, 'cspell.json')), true)
        assert.equal(existsSync(join(projectPath, '.husky/pre-commit')), true)
        assert.equal(existsSync(join(projectPath, '.husky/commit-msg')), true)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})
