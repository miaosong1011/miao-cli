# Vue TS Turborepo Team Template

Team standardized monorepo template with Turborepo incremental builds.

## Includes

-   Vue + Vite + TypeScript (`apps/web`)
-   Shared package workspace (`packages/shared`)
-   Turborepo (`turbo.json`) with incremental `build/dev/lint`
-   ESLint + Stylelint + CSpell
-   Commitlint + Commitizen (cz-git)
-   Husky + lint-staged

## Quick Start

```bash
pnpm install
pnpm prepare
pnpm check
```

## Turborepo Commands

```bash
pnpm dev
pnpm build
pnpm lint
```
