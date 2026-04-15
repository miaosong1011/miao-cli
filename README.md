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

本地开发时，发布前建议先执行：

```bash
pnpm preflight
```

该命令会按顺序执行 `lint`、`typecheck`、`test` 和 `@miaosong1011/miao-cli` 构建。

如需在本地验证发布内容，但不真正发布：

```bash
pnpm release:check
```

该命令会在 `packages/cli/.pack` 生成打包产物用于检查发布内容。

## 版本与发布（推荐 CI 自动发布）

推荐发布路径已经调整为：**本地只负责生成 changeset 并推送，真正发布交给 GitHub Actions 在 `main` 分支自动完成**。

### 推荐流程

1. 生成功能对应的 changeset：

```bash
pnpm changeset
```

2. 提交代码与 changeset：

```bash
git add .
git commit -m "chore: add changeset"
```

3. 推送到 `main`：

```bash
git push origin main
```

4. GitHub Actions 会自动执行发布流程：

-   在 `.github/workflows/release.yml` 中监听 `main` 分支 push
-   使用 `changesets/action` 自动处理版本与发布
-   使用仓库中的 `NPM_TOKEN` 完成 npm 发布

### CI 发布前置条件

-   仓库已配置 `NPM_TOKEN` secret
-   `NPM_TOKEN` 对 `@miaosong1011/miao-cli` 具备发布权限
-   如果 npm 账户启用了发布保护，需要使用支持发布的 token（例如满足 npm 当前策略要求的 token 配置）

## 版本与变更日志（Changesets）

Changesets 仍然是版本与 changelog 的唯一来源。

新增对外能力后，先生成变更集：

```bash
pnpm changeset
```

本地如果需要预览版本与 changelog 变更，可以手动执行：

```bash
pnpm version:packages
```

## 本地发布命令（仅备用，不作为主流程推荐）

下面这些命令仍然保留，方便维护者在特殊场景下做本地检查或手动发布，但**默认不再推荐作为日常发布路径**：

```bash
pnpm publish:packages
pnpm --filter @miaosong1011/miao-cli release
```

其中：

-   `pnpm publish:packages` 会先执行 `pnpm release:check`，再执行 `changeset publish`
-   `pnpm --filter @miaosong1011/miao-cli release` 会直接对单包执行 `npm publish`

如果只是想验证打包结果，优先使用：

```bash
pnpm release:check
```

CI 已提供 `release.yml`，现在默认把它作为主发布链路使用。
