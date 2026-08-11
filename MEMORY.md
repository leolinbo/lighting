# Project Memory & Credentials

> ⚠️ **重要：本文件是项目的持久化记忆文件**。所有 NPC（CodeBuddy、bob idea、bob view、bob seo、bob code）在开始工作时**必须先读取本文件**，了解项目已有的 API 凭据和配置。

## 最后更新：2026-08-11

---

## 一、API 凭据

### TabAPI（SEO/域名情报 API）

- **平台**：https://tabapi.com
- **Base URL**：`https://tabapi.com/api/v1`
- **API Key**：`sk_qxu-AxGeGQ9zEWJ-Ff4Uh9PQOTn2M5Rn_xkMAX5iZlU`
- **认证方式**：`Authorization: Bearer <KEY>`
- **端点**：
  - `GET /domains/{domain}/traffic` — 流量/排名/关键词
  - `GET /domains/{domain}/whois` — 域名注册信息
  - `GET /domains/{domain}/dns` — DNS 记录
  - `GET /domains/{domain}/backlinks` — 外链分析
  - `GET /search/google?q=keyword&num=N` — Google SERP 查询
  - `GET /publishers/{id}/sites` — 反向 AdSense
  - `GET /markdown` — 网页转 Markdown
  - `GET /screenshot` — 网页截图
- **使用方式**：参考 `scripts/tabapi_client.py`，key 从 `.env` 或环境变量 `TABAPI_API_KEY` 读取

### APIMart（AI 能力/图片生成 API）

- **平台**：https://apimart.com
- **API Key**：`sk-Vx7EPPXfSZhzQk7Sc511oLBShEjdbkhnNygfyIG1ZxbzG2eA`
- **用途**：AI 生图等（用于博客文章配图等场景）
- **认证方式**：`Authorization: Bearer <KEY>`

---

## 二、网络代理配置

- **代理工具**：Clash
- **代理端口**：7897
- **HTTP 代理**：`http://127.0.0.1:7897`
- **SOCKS5 代理**：`socks5://127.0.0.1:7897`
- **用途**：访问需要翻墙的外部 API（TabAPI、APIMart 等）
- **环境变量**：`.env` 中已配置 `HTTP_PROXY` / `HTTPS_PROXY` / `ALL_PROXY` / `TABAPI_PROXY`

---

## 三、Vercel 部署信息

- **生产域名**：https://astrowindwopress.vercel.app
- **Vercel Team**：`encorelightingbob-3340`
- **Org ID**：`team_o0BtTLWzAHnGL2hIHk6iMnZs`
- **Project ID**：`prj_cpAHrPXwDLRBSEMietKswTgknpFx`
- **GA4 Measurement ID**：`G-1VKFQ8ZEW6`（Data Stream ID: `15409069175`）
- **部署方式**：`.cnb.yml` 流水线 `deploy-to-vercel` 阶段，需 `VERCEL_TOKEN` 环境变量（从 CNB 密钥仓库 `beamangle-secrets/vercel.yml` 读取）

---

## 四、SEO 规范摘要

- **TDH 三要素**：Title 50-60 字符、Description 150-160 字符、H1 唯一
- **URL 规范**：全小写、连字符分隔、slug ≤ 5 词
- **SSR 红线**：所有页面必须 SSG 静态输出核心内容，禁止 CSR 空壳
- **结构化数据**：博客配 Article + FAQPage + BreadcrumbList；产品页配 Product + BreadcrumbList；首页配 Organization + WebSite(SearchAction)
- **图片规范**：必须写 alt、≥300×300、WebP 格式、压缩 100-200KB
- **GA4 埋点**：已配置 `G-1VKFQ8ZEW6`

---

## 五、项目常用命令

```bash
npm run dev       # 本地开发 (localhost:4321)
npm run build     # 生产构建 (dist/)
npm run check     # astro check + ESLint + Prettier
npm run fix       # 自动修复 ESLint/Prettier
npm test          # 单元测试
```

---

## 六、其他重要信息

- **项目栈**：Astro v6 + Tailwind CSS v4 + TypeScript
- **Node.js 要求**：>= 22.12.0
- **已有工具页**：beam-angle-calculator、lux-calculator、fixture-count-estimator、cct-guide、cri-guide、ugr-guide、photometric-guide、unit-converter、products/compare
- **已有博客**：custom-track-lighting-manufacturer、why-is-track-lighting-hated、how-to-choose-custom-track-lighting-manufacturer-2026
