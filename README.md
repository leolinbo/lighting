# 💡 ENCORE — LED Track Lighting & Downlight Manufacturer Website

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE.md)

基于 **[Astro v6](https://astro.build/) + [Tailwind CSS v4](https://tailwindcss.com/)** 构建的静态企业官网，为 **ENCORE（深圳市英科光电科技有限公司）** 提供 LED 轨道灯、筒灯、磁吸轨道灯等产品的 B2B 展示与 OEM/ODM 询盘服务。

> 本项目由开源模板 **[AstroWind](https://github.com/arthelokyo/astrowind)** 改造而来，在保留其高性能与 SEO 优势的基础上，完成了品牌化定制。

---

## ✨ 功能特性

- ✅ **B2B 企业官网**：首页、产品中心、OEM/ODM、关于我们、质量控制、认证证书、服务与报价、联系页面
- ✅ **产品图库**：四类产品线（Track Lighting / LED Downlights / Magnetic Track Lights / Commercial Lighting），支持大图画廊
- ✅ **SEO 优化**：结构化数据（Schema.org）、Open Graph 标签、Sitemap、RSS、Google Search Console 验证
- ✅ **博客系统**：MDX 支持、分类与标签、RSS 自动生成
- ✅ **图片优化**：Astro Assets + Sharp / Unpic 通用图片 CDN
- ✅ **暗色模式 & RTL**：基于 Tailwind CSS v4 的 CSS-first 主题系统
- ✅ **安全响应头**：全站安全 headers 配置

## 🚀 快速开始

> 环境要求：**Node.js >= 22.12.0**

```bash
# 安装依赖
npm install

# 本地开发（localhost:4321）
npm run dev

# 生产构建（输出到 ./dist/）
npm run build

# 本地预览生产构建
npm run preview

# 代码检查（astro check + ESLint + Prettier）
npm run check

# 自动修复 ESLint / Prettier 问题
npm run fix
```

## 📁 项目结构

```
/
├── public/                  # 静态资源（robots.txt、验证文件等）
├── src/
│   ├── assets/
│   │   ├── images/          # 产品与工厂图片
│   │   └── styles/
│   │       └── tailwind.css # Tailwind v4 主题配置
│   ├── components/
│   │   ├── blog/            # 博客组件
│   │   ├── common/          # 公共组件（Image、Metadata 等）
│   │   ├── ui/              # 基础组件（Button、ItemGrid 等）
│   │   └── widgets/         # 页面区块（Hero、Features、Header 等）
│   ├── content.config.ts    # 内容集合 Schema（Astro v6）
│   ├── data/post/           # 博客文章（.md / .mdx）
│   ├── layouts/             # 页面布局
│   ├── pages/               # 文件路由
│   ├── utils/               # 工具函数
│   ├── config.yaml          # 站点配置（名称、SEO、分析等）
│   └── navigation.ts        # 导航结构
├── astro.config.ts
├── package.json
└── ...
```

## ⚙️ 站点配置

核心配置在 [`src/config.yaml`](./src/config.yaml)：

```yaml
site:
  name: ENCORE
  site: "https://lightoem.com"

metadata:
  title:
    default: ENCORE — Professional LED Track Lighting & Downlight Manufacturer
  description: "Professional LED track lighting and downlight manufacturer offering OEM/ODM services. ETL/CE/ISO certified factory since 2011."
```

- **站点信息 / SEO 元数据**：修改 `site` 与 `metadata` 字段
- **博客配置**：`apps.blog`（每页文章数、分类、标签等）
- **分析工具**：`analytics.vendors.googleAnalytics` 填入 Google Analytics ID
- **主题**：`ui.theme`（system / light / dark）

### 自定义设计

Tailwind CSS v4 采用 CSS-first 配置：

- `src/components/CustomStyles.astro` — 颜色、字体的 CSS 变量
- `src/assets/styles/tailwind.css` — 主题令牌（`@theme`）、自定义工具类（`@utility`）、插件

## 🌐 部署

### 手动部署（生产构建）

```bash
npm run build
```

将 `dist/` 目录部署到任意静态托管服务即可。

### Vercel / Netlify

- **Vercel**：导入仓库后，构建命令 `npm run build`，输出目录 `dist`
- **Netlify**：同样指向 `npm run build` + `dist`
- **Docker**：项目提供 [`Dockerfile`](./Dockerfile) 与 [`docker-compose.yml`](./docker-compose.yml)（Nginx 托管静态产物）

## 📝 内容更新

- **产品 / 公司信息**：直接编辑对应页面的 `.astro` 组件
- **博客文章**：在 `src/data/post/` 下新增 `.md` / `.mdx` 文件（frontmatter 含 `title`、`publishDate`、`excerpt`、`image`、`category`、`tags` 等字段）
- **产品图片**：放入 `src/assets/images/` 后按需引用

## 🤝 贡献

欢迎通过 Issue / PR 反馈问题或提交改进。

## 📄 许可证

本项目基于 **MIT 许可证** 开源 — 详见 [LICENSE](./LICENSE.md)。

- 项目代码与内容版权归 **Beamangle** 所有
- 原始模板 **AstroWind** 版权归 **onWidget**（Arthelokyo）所有

---

**ENCORE** — 自 2011 年起专注于高品质 LED 灯具研发与制造 · [sales@encore-tech.com](mailto:sales@encore-tech.com)
