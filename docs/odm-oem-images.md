# ODM vs OEM 博客文章配图 — 部署说明

> 文章 URL：`/odm-vs-oem-led-lighting/`
> 代码已合并到 `main`（commit `95bf076`），当前使用工厂现有照片作为**占位图**，可正常构建部署。
> 本文档说明如何把占位图替换成 APIMart 生成专属 1k AI 配图。

---

## 背景：为什么配图需要你本机操作？

- **APIMart（`api.apimart.ai`）在当前 CI / 构建机网络被墙**（TCP 443 超时不可达）。
- **Clash 代理是你本机的进程**，CI/构建机没有你的 Clash，无法替你访问 APIMart。
- 因此，**只有在你本机（跑着 Clash，端口 7897）执行生图脚本**，才能生成专属 AI 配图。

> 💡 TabAPI（SEO 分析）直连即可访问，无需代理；只有 APIMart 生图需要本机代理。

---

## 你的操作步骤（只需两步）

### 第 1 步：在本地生成并部署 AI 配图

在你本机（已开 Clash）执行：

```bash
bash scripts/gen_blog_odm_oem_images.sh
```

脚本会自动：
1. 调用 APIMart `gpt-image-2` 生成 3 张 1k 配图（封面 + 2 张插图）
2. **校验**每张图片（非空 + 可解码）
3. 生成失败的图片**自动重试**（默认最多 3 次）
4. 自动把合格图片转成 JPEG 并**部署到站点资源目录**：

| 目标文件 | 用途 |
|----------|------|
| `src/assets/images/blog/odm-oem-guide/odm-oem-cover.jpg` | 文章封面（经 astro:assets 优化） |
| `public/images/blog/odm-oem-guide/odm-existing-design-rebrand.jpg` | ODM 小节插图 |
| `public/images/blog/odm-oem-guide/oem-custom-engineering.jpg` | OEM 小节插图 |

> 原始 PNG 会保留在 `outputs/images/odm-oem-guide/`（已被 `.gitignore` 忽略，不会入库）。

### 第 2 步：提交并推送，触发部署

```bash
git add .
git commit -m "feat: add AI-generated ODM vs OEM blog images"
git push
```

---

## 常见问题

| 现象 | 处理 |
|------|------|
| 脚本报网络超时 | 确认 Clash 已开、端口是 7897；或 `export APIMART_PROXY=...` 覆盖代理 |
| 报 API Key 无效 | 确认根目录 `.env` 里有 `APIMART_API_KEY`（参考 `.env.example`） |
| 个别图生成失败 | 脚本会自动重试 3 次；仍失败可重跑脚本 |
| 想手动把某张图部署 | 运行脚本后它会自动处理，无需手动 cp |

---

## 配套文件

- `scripts/gen_blog_odm_oem_images.sh` — 一键生图 + 校验 + 自动部署脚本
- `scripts/gen_image.py` — APIMart 生图底层封装
- `.env.example` — 环境变量参考（含代理说明）
- `outputs/` — 生图草稿目录（已 gitignore）
