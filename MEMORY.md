# Project Memory & Credentials

> ⚠️ **重要：本文件是项目的持久化记忆文件**。所有 NPC（CodeBuddy、bob idea、bob view、bob seo、bob code）在开始工作时**必须先读取本文件**，了解项目已有的 API 凭据和配置。

## 最后更新：2026-08-12（Pexels 图片方案 + Vercel 部署）

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

### Pexels（免版税图片搜索 API，用于博客配图）

- **平台**：https://www.pexels.com/api/
- **API Key**：`Si5zrVMUY9CqbtpoTMykg7UEMLW1wsYL8n7PeIIITwXcNIr9B5RIX3qJ`
- **认证方式**：`Authorization: <KEY>`（Bearer 头，非 Bearer 前缀）
- **用途**：替代 APIMart AI 生图，搜索下载免版税照片作博客配图。Pexels **直连即可访问，无需代理**。
- **使用方式**：参考 `scripts/pexels_image.py`，key 从 `.env` 或环境变量 `PEXELS_API_KEY` 读取。
- **下载**：`GET /v1/photos/{id}` 或 `GET /v1/search?query=...` 返回 `src.large` 等可直接下载的图片 URL。

---

## 二、网络代理配置

- **代理工具**：Clash
- **代理端口**：7897
- **HTTP 代理**：`http://127.0.0.1:7897`
- **SOCKS5 代理**：`socks5://127.0.0.1:7897`
- **环境变量**：`.env` 中已配置 `HTTP_PROXY` / `HTTPS_PROXY` / `ALL_PROXY` / `TABAPI_PROXY` / `APIMART_PROXY`

> ⚠️ **关键澄清（2026-08-12 实测）**：
>
> - **TabAPI（SEO/域名情报）直连即可访问，无需代理**。SEO 类脚本可在无代理环境跑。
> - **APIMart（AI 生图 `api.apimart.ai`）被墙，只有在你本机（跑着 Clash 7897）才能访问**。
> - **代理必须在发起请求的那台机器上运行**——CI/构建机没有用户的 Clash，无法替用户访问 APIMart。
> - **✅ 已改用 Pexels 做博客配图（2026-08-12）**：`api.pexels.com` **直连即可访问，无需代理**。ODM vs OEM 文章配图已用 Pexels 免版税照片替换占位图（`scripts/pexels_image.py`）。后续博客配图优先用 Pexels，不再依赖 APIMart AI 生图。
> - TabAPI 脚本如需关闭代理，置空 `TABAPI_PROXY` 即可；APIMart 同理置空 `APIMART_PROXY`。

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
- **已有博客**：custom-track-lighting-manufacturer、why-is-track-lighting-hated、how-to-choose-custom-track-lighting-manufacturer-2026、odm-vs-oem-led-lighting（URL `/odm-vs-oem-led-lighting/`，配图已用 Pexels 免版税照片替换完成 ✅）
