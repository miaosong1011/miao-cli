# miao-cli

一个基于 `pnpm workspace + Turbo` 的前端脚手架项目，用于快速创建 Vue / React / Vanilla 应用模板，并提供统一的 CLI 指令（`miao`）来完成项目初始化与本地开发流程。

## 项目简介

`miao-cli` 目前的核心包是 `@miaosong1011/miao-cli`。  
通过 `miao create <project-name>`，可以交互式选择框架和模板，自动拷贝项目模板并生成新的 `package.json`，帮助你快速起步。

## 核心能力

-   支持多框架模板初始化：`vue`、`react`、`vanilla`
-   支持 TypeScript / JavaScript 双模板
-   提供统一命令入口：`miao`
-   支持本地模板和远程模板拉取（`--remote`）
-   `vue` / `vue-ts` / `vue-ts-monorepo` 模板默认内置团队协作规范（lint、commitlint、cz-git、husky、cspell）
-   内置开发辅助命令：`serve`、`build`、`info`、`preview`

## 项目结构

```text
miao-cli/
├── apps/                  # 应用层（当前基本为空）
├── packages/
│   ├── cli/               # CLI 核心实现
│   │   ├── bin/           # 可执行入口（miao）
│   │   ├── src/           # 命令、工具函数、常量与类型
│   │   └── templates/     # 内置项目模板
│   └── core/              # 预留核心包（当前为空）
├── package.json           # monorepo 根脚本
├── pnpm-workspace.yaml    # workspace 配置
└── turbo.json             # Turbo 任务编排
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建 CLI

```bash
pnpm build
```

### 3. 本地调试 CLI

在 `packages/cli` 下可直接运行：

```bash
pnpm --filter @miaosong1011/miao-cli dev
```

## CLI 使用

### 创建项目

```bash
miao create my-app
```

可选参数：

-   `-f, --framework <framework>`：指定框架（`vue` / `react` / `vanilla`）
-   `-t, --template <template>`：指定模板（如 `vue-ts`、`react`）
-   `-y, --yes`：跳过交互，缺省参数使用默认值（`vue` + `vue-ts`）
-   `--install`：创建后安装依赖
-   `--package-manager <pm>`：安装依赖时使用的包管理器（`pnpm` / `npm` / `yarn`）
-   `-r, --remote`：使用远程模板
-   `--remote-template <name>`：远程模板预设（`monorepo` / `turborepo`）
-   `--remote-source <source>`：远程模板源（如 `github:user/repo`）
-   `--remote-ref <ref>`：远程模板分支/标签/提交
-   `--force`：目标目录非空时覆盖

示例：

```bash
miao create my-app -f react -t react-ts
miao create team-app -f vue -t vue-ts-monorepo
miao create turbo-app -f vue -t vue-ts-turborepo
miao create-monorepo team-app
```

团队规范化模板推荐直接使用：

```bash
miao create-monorepo team-app --install
```

### 其他命令

```bash
miao info      # 显示 CLI 信息
miao serve     # 启动开发服务（调用 pnpm dev 或 npm run dev）
miao build     # 构建项目（调用 pnpm build 或 npm run build）
miao doctor    # 环境检查（Node / pnpm）
miao template list         # 列出内置模板
miao template list --json  # JSON 格式列出内置模板
miao create-monorepo app   # 快速创建团队 monorepo 模板
miao config set remoteSource github:your-org/your-template
miao config set remoteRef main
miao config list
miao preview   # 已废弃，内部转发到 doctor
```

配置后可直接使用远程默认模板：

```bash
miao create my-app --remote
```

`create-monorepo` 支持与 `create` 类似的模板选择参数：

```bash
miao create-monorepo app -f vue -t vue-ts-monorepo
miao create-monorepo app -y
```

## 开发命令（仓库根目录）

```bash
pnpm dev         # turbo run dev
pnpm build       # turbo run build
pnpm lint        # 代码检查
pnpm typecheck   # 类型检查
pnpm spellcheck  # 拼写检查
```

## 质量与发布

发布前建议先执行：

```bash
pnpm preflight
```

该命令会按顺序执行 `lint`、`typecheck`、`test` 和 `@miaosong1011/miao-cli` 构建。

发布前干跑检查（不会真正发布）：

```bash
pnpm release:check
```

该命令会在 `packages/cli/.pack` 生成打包产物用于检查发布内容。

如需正式发布 `@miaosong1011/miao-cli`：

```bash
pnpm --filter @miaosong1011/miao-cli release
```

## 版本与变更日志（Changesets）

新增对外能力后，先生成变更集：

```bash
pnpm changeset
```

将 changeset 应用到版本号与 changelog：

```bash
pnpm version:packages
```

执行发布（会先走 `release:check`）：

```bash
pnpm publish:packages
```

CI 已提供 `release.yml`，在 `main` 分支上自动创建 release PR，并在满足条件后发布。  
使用前请在仓库 Secret 中配置 `NPM_TOKEN`。
