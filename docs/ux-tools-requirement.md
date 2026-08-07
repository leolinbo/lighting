# ENCORE 体验小工具系列 · 需求文档

> 来源：Issue #11「挨个完成以上功能」——由 bob seo 提供 SEO 规范与调研，bob idea 拆解为需求文档，bob code 开发，bob view 把关体验，CodeBuddy 部署上线。
>
> 版本：v1.0（2026-08-07）

## 结论先行

按 bob seo / bob idea 两份候选清单合并去重，本轮落地 **3 个 P0 + 4 个 P1** 共 7 个工具，分两批交付：

| 批次 | 工具 | 说明 |
|---|---|---|
| **批次一（P0）** | ① Lux 照度计算器 | 独立工具页 `/tools/lux-calculator` |
| | ② 产品参数 RFQ 询盘表单 | 全站最高转化杠杆，随页面携带参数 |
| **批次二（P1）** | ③ 色温对比工具（CCT Guide） | 独立工具页 `/tools/cct-guide` |
| | ④ 光斑尺寸对照表（内置交互版） | 产品页内嵌 |
| | ⑤ 配光曲线 / 光度数据指南（Photometric Guide） | 信息型指南页 + 博客互链 |
| | ⑥ 产品对比表 Compare | 各产品页规格表组件 |
| | ⑦ 首页 FAQ + 工具互链闭环 | 兑现博客承诺的 beam selection guide |

> 延后项（P2，流量验证后再排）：m/ft·W/VA 单位换算、UGR 科普、i18n 多语言、回顶/阅读进度/站内搜索、样品申请表单。

## 功能范围与验收标准

### 全局验收红线（所有工具通用，来自 bob view 放行清单）

1. **SSR 静态输出核心说明文字与公式**（爬虫 / AI 搜索可读，不能只靠 JS 渲染）
2. H2 标题含主关键词簇；页面可见文本含关键词、公式、单位
3. 暗色模式 + 移动端 375px 无横向溢出
4. 单位换算正确且切换不丢输入值；边界防护，不允许 NaN/Infinity
5. `npm run build` / `npm run check` 通过，无 console 报错
6. FAQ 配 FAQPage Schema（结构化数据）
7. 纯函数逻辑抽离（如 `src/utils/`），组件只负责渲染，可单测可复算
8. 工具页 canonical 正确，与产品页避免关键词自吞噬

### 工具 ① Lux 照度计算器（P0，预估 1.5d）

**页面**：`/tools/lux-calculator`，与 beam-angle-calculator 互链 + 产品页互链 + 询盘 CTA。

**功能**：
- 输入：房间长 × 宽 × 高（m/ft 可切换）、应用场景（零售/展厅/办公/博物馆/仓库等预设）
- 输出：所需总流明（lm）、推荐灯具数量（按用户输入的灯具流明或预设光效）、建议功率（W）、建议光束角与间距（结合现有光束角计算器数据）
- 交互：实时计算、场景预设、单位切换保留输入、结果复制、携带参数跳转询盘
- 公式（SSR 静态输出）：
  - `total lumens = target lux × room area (m²) ÷ utilization factor ÷ maintenance factor`
  - `fixture count = total lumens ÷ lumens per fixture`
  - 默认利用率 0.6、维护系数 0.8（可在说明中标注典型值）

**SEO（bob seo 规范）**：关键词 `lux calculator` / `how many lumens do I need` / `lighting layout calculator` / `lux level for retail`；FAQPage Schema（"How many lumens per square meter for a retail store?" 等）；canonical 指向工具页，不与产品页抢商业词。

**验收数值（关键）**：
- 零售 100㎡、目标照度 300 lux → 总流明 ≈ 62,500 lm（300 × 100 ÷ 0.6 ÷ 0.8）
- 单灯 3,000 lm → 建议数量 ≈ 21 盏（向上取整）

### 工具 ② 产品参数 RFQ 询盘表单（P0，预估 1d）

**组件**：`QuoteForm.astro`，内嵌于 4 个产品页 + Lux 计算器页 + 光束角计算器页。

**功能**：
- 表单字段：产品系列（预填当前页）、型号/功率、光束角、色温、数量、姓名、公司、邮箱、留言
- 自动携带当前页产品参数（产品页 → 系列预填；计算器页 → 计算结果可一键带入）
- 提交动作：`mailto:sales@encore-tech.com` 生成邮件草稿 + 页面成功提示（纯静态方案，无后端）
- 全站 Get Quote CTA 统一指向该表单锚点

**验收**：表单在暗色/移动端正常；参数随提交带入邮件正文；无后端依赖、无 console 报错。

### 工具 ③ 色温对比工具 CCT Guide（P1，预估 1d）

**页面**：`/tools/cct-guide`；可交互色温色卡（2700K / 3000K / 4000K / 5000K / 6500K），点击对比 + 场景推荐（餐厅/展厅/办公/商场）。

**SEO**：`color temperature chart` / `2700k vs 3000k vs 4000k` / `warm white vs cool white`；FAQPage Schema。

### 工具 ④ 光斑尺寸对照表（P1，预估 0.5d）

在 track-lighting / led-downlights 产品页内嵌**交互式**光斑对照表（10°~90° × 2m/3m/5m 光斑直径），由现有静态表扩展，公式复用 `D = 2h·tan(θ/2)`，SSR 输出整表。

### 工具 ⑤ 配光曲线 / 光度数据指南（P1，预估 1d）

信息型指南页（或博客专题）：解释 IES 文件、配光曲线、UGR、IP/IK 等级，附"如何看配光曲线"三步教程。与博客 `why-is-track-lighting-hated-and-how-to-do-it-right.mdx` 互链。

**SEO**：`ugr meaning` / `ip rating chart` / `photometric data` / `what is an IES file` 信息型长尾。

### 工具 ⑥ 产品对比表 Compare（P1，预估 1d）

产品页统一规格表组件：VEGA/OVEGA/IMAX/FLEX（track）与 DELLA/ELLA/Galaxy/AVA（downlight）系列 wattage / 光束角 / CRI / 调光方式 / 色温逐项对比，可选 2~4 个型号。SSR 输出表格。

### 工具 ⑦ 首页 FAQ + 工具互链闭环（P1，预估 0.5d）

- 首页 FAQ 新增"如何计算照度/需要多少灯"问答 → 内链 Lux 计算器
- 首页 FAQ 新增色温选择问答 → 内链 CCT Guide
- 博客 `why-is-track-lighting-hated` 已承诺的 beam selection guide → 双向互链（工具页 ↔ 博客 ↔ 产品页）
- 四个产品页互相提供工具入口（横幅/卡片），形成"算完 → 选型 → 询盘"闭环

## 任务拆解与排期（串行，约 7.5 人日）

| # | 任务 | 预估 | 依赖 |
|---|------|------|------|
| 1 | `src/utils/lighting.ts` 纯函数（Lux/流明/数量/换算） | 0.5d | — |
| 2 | `/tools/lux-calculator` 页面（SEO + FAQPage Schema + SSR 公式） | 1d | 1 |
| 3 | `LuxCalculator.astro` 组件（场景预设/单位切换/实时计算/暗色/移动端） | 1.5d | 1 |
| 4 | `QuoteForm.astro` 组件 + 4 产品页内嵌 + 计算器页内嵌 | 1d | 3 |
| 5 | `/tools/cct-guide` 色温对比页 | 1d | — |
| 6 | 产品页光斑对照表（交互版）+ 产品对比表组件 | 1d | 1 |
| 7 | 首页 FAQ 扩展 + 工具互链闭环 + 博客互链 | 0.5d | 2,5 |
| 8 | 自测验收：build / check / 浏览器（暗色、375px、单位切换） | 0.5d | 全部 |
| 9 | bob view 评审 + bob seo SEO 复核 | — | 8 |
| 10 | CodeBuddy 合并 + Vercel 部署上线验证 | — | 9 |

## 关键验收数值速查

| 场景 | 期望值 |
|---|---|
| 24° @ 3m 光斑直径 | D ≈ 1.28 m |
| 60° @ 3ft 光斑直径（英制） | D ≈ 3.46 ft |
| 零售 100㎡、300 lux | 总流明 ≈ 62,500 lm |
| 单灯 3,000 lm 时数量 | ≈ 21 盏（向上取整） |
| 2700K / 3000K / 4000K / 5000K / 6500K | 色温色卡可见且对比清晰 |

## 待办确认（开发前 bob code 需对齐）

1. 单位制：Lux 计算器默认 Metric，保留 Imperial 切换（与光束角计算器一致）
2. 询盘表单提交方案：**mailto 纯静态方案**（无后端），如后续接入后端再替换
3. P2 项（i18n / 站内搜索 / 回顶等）不在本轮范围，流量验证后另行排期

## 交接

- `@Beamanglespace/Beamangle(bob code)`：按本需求文档开发，先批次一（① ②）再批次二（③~⑦）
- `@Beamanglespace/Beamangle(bob view)`：按全局验收红线逐项把关，达标才放行
- `@Beamanglespace/Beamangle(bob seo)`：提供工具页 SEO 落地清单与 FAQPage Schema 规范
- `@CodeBuddy`：合并后部署上线 Vercel，并修复 .cnb.yml 部署脚本（link + prebuilt 正确姿势）

需求我拆，锅你背。
