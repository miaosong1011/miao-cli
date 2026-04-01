import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const binPath = resolve(__dirname, '../../bin/miao')

const runMiao = (args, cwd, env = {}) =>
    spawnSync(process.execPath, [binPath, ...args], {
        cwd,
        encoding: 'utf8',
        env: {
            ...process.env,
            ...env
        }
    })

test('doctor command reports environment status', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))

    try {
        const result = runMiao(['doctor'], cwd)
        const output = `${result.stdout}\n${result.stderr}`

        assert.equal(result.status, 0)
        assert.match(output, /miao doctor/i)
        assert.match(output, /Node\.js >= 20/i)
        assert.match(output, /pnpm installed/i)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create remote reports configured remote source and ref on failure', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))

    try {
        const source = 'invalid:foo/bar'
        const ref = 'release-1'
        const result = runMiao(
            ['create', 'remote-app', '--remote', '--remote-source', source, '--remote-ref', ref],
            cwd
        )

        const output = `${result.stdout}\n${result.stderr}`
        assert.equal(result.status, 1)
        assert.match(output, new RegExp(`${source}#${ref}`))
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('create remote template preset resolves to turborepo source', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))

    try {
        const missingRef = '__missing_ref_for_test__'
        const result = runMiao(
            ['create', 'remote-preset-app', '--remote', '--remote-template', 'turborepo', '--remote-ref', missingRef],
            cwd
        )
        const output = `${result.stdout}\n${result.stderr}`

        assert.equal(result.status, 1)
        assert.match(output, /github:miaosong1011\/vue-ts-turborepo#__missing_ref_for_test__/i)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('template list --json prints built-in templates', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))

    try {
        const result = runMiao(['template', 'list', '--json'], cwd)
        assert.equal(result.status, 0)

        const payload = JSON.parse(result.stdout)
        assert.equal(Array.isArray(payload), true)
        assert.equal(payload.some(item => item.framework === 'vue'), true)
        assert.equal(payload.some(item => item.framework === 'react'), true)
        assert.equal(payload.some(item => item.framework === 'vanilla'), true)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
    }
})

test('config set/get/list manages global remote defaults', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'miao-cli-test-'))
    const fakeHome = mkdtempSync(join(tmpdir(), 'miao-cli-home-'))

    try {
        const source = 'github:example/team-template'
        const ref = 'release-2026'

        const setSource = runMiao(['config', 'set', 'remoteSource', source], cwd, { HOME: fakeHome })
        const setRef = runMiao(['config', 'set', 'remoteRef', ref], cwd, { HOME: fakeHome })
        const getSource = runMiao(['config', 'get', 'remoteSource'], cwd, { HOME: fakeHome })
        const listJson = runMiao(['config', 'list', '--json'], cwd, { HOME: fakeHome })

        assert.equal(setSource.status, 0)
        assert.equal(setRef.status, 0)
        assert.equal(getSource.status, 0)
        assert.equal(getSource.stdout.trim(), source)

        const config = JSON.parse(listJson.stdout)
        assert.equal(config.remoteSource, source)
        assert.equal(config.remoteRef, ref)
    } finally {
        rmSync(cwd, { recursive: true, force: true })
        rmSync(fakeHome, { recursive: true, force: true })
    }
})
