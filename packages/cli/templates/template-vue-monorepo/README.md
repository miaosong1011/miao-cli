# Vue TS Monorepo Template

Team standardized monorepo template with:

-   Vue + Vite + TypeScript
-   ESLint + Stylelint + CSpell
-   Commitlint + Commitizen (cz-git)
-   Husky + lint-staged

## Quick Start

```bash
pnpm install
pnpm prepare
pnpm check
```

## Common Commands

```bash
pnpm lint
pnpm spellcheck
pnpm format
pnpm commit
```

## Git Hooks

-   `pre-commit`: runs `lint-staged` and `spellcheck`
-   `commit-msg`: runs `commitlint`

## Team Rules

-   Use conventional commits via `pnpm commit`
-   Ensure `pnpm check` passes before push
-   Keep dependencies and tooling versions aligned with this template
