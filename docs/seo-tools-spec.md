# ENCORE 照明站 · 工具套件 SEO 规范（V1.0）

> 编写：bob seo ｜ 服务于 ISSUE #11「挨个完成以上功能」
> 适用对象：`@bob idea`（按此规范落需求文档）、`@bob code`（按此规范开发）、`@bob view`（按此规范验收放行）。
> 数据声明：本仓库无 Search Console / 爬取权限，所有关键词量级、排名、SERP 快照一律标 `unknown`；以下结论基于站内结构证据 + 通用搜索形态，不编造数据。

---

## 0. 结论先行（TL;DR）

1. **所有工具统一收口到 `/tools/` 目录**，每工具一个独立 URL、一个主关键词簇，防自吞噬（cannibalization）。
2. **工具页 = 信息型内容 + 交互工具**，SEO 靠「SSR 静态文本（公式/说明/FAQ）+ 结构化数据 + 内链」，不靠 JS。
3. **转化在 CTA**：每个工具页结果区都要带询盘 CTA（可携带参数跳 `/contact`），工具页本身不抢产品页的商业关键词。
4. 本次范围内 4 个 P0 工具 + 3 个 P1 工具 + 2 个 P2 工具 + 1 个 RFQ 表单，**每个都给出 页面/URL/关键词/Schema/内链/验收** 六件套（见第 4 章）。
5. 已有光束角计算器有 **3 项遗留补强**（FAQPage Schema、与博客互链、首页 FAQ 指向）建议随本轮一起补齐（见第 7 章）。

---

## 1. 范围（来自 bob seo + bob idea 两个清单的合并去重）

| 优先级 | 工具 | 形态 | 放置 |
|---|---|---|---|
| P0 | 照度计算器（Lux Calculator） | 独立工具页 | `/tools/lux-calculator` |
| P0 | 灯具数量估算器（Fixture Count Estimator） | 独立工具页 | `/tools/fixture-count-estimator` |
| P0 | 实时询盘表单（RFQ，带产品参数） | 组件嵌入产品页/工具页 | 全局组件 |
| P0 | 色温指南（CCT Guide） | 独立工具页 | `/tools/color-temperature-guide` |
| P1 | 光斑尺寸对照表（Beam Spread Table，交互式） | 产品页内嵌 + 独立锚点 | `/products/track-lighting#beam-spread-table` 等 |
| P1 | CRI 科普工具 | 独立工具页或博客配套 | `/tools/cri-guide` |
| P1 | 选型向导（Product Finder，3 步） | 交互组件 | 首页 + 产品导航 |
| P2 | 单位换算器（m/ft·W/VA） | 独立小工具 | `/tools/unit-converter` |
| P2 | UGR/IP/IK 指南 | 独立指南页 | `/tools/photometric-guide` |
| P2 | 产品对比表（Compare） | 独立页/组件 | `/products/compare` |

> 已存在：光束角计算器 `/beam-angle-calculator`（本轮保留现状，仅做遗留补强，不迁移 URL）。

---

## 2. 核心原则（每个工具都必须遵守）

1. **SSR 静态输出**：公式、说明文字、FAQ 必须出现在初始 HTML（爬虫/AI 搜索可读），交互脚本只是增强。验收方法：`curl 页面 | grep "公式关键词"` 能命中。
2. **一页一主题**：每个工具页只做一件事、只打一个主关键词簇；工具之间用「相关工具」互链，不互相复制大段文本。
3. **URL 可读可预期**：`/tools/<工具名>`，全小写、连字符，不做参数版 URL 收录。
4. **结构化数据**：每工具页至少一个 `JSON-LD` 实体（FAQPage / HowTo / SoftwareApplication / BreadcrumbList），内容必须与页面可见文本一致（不能藏 Schema 内容）。
5. **转化闭环**：工具页底部/结果区必有 CTA（`/contact` 或产品页），B2B 询盘转化优先于一切花哨交互。
6. **性能红线**：纯前端工具、无重型框架、首屏无布局偏移（CLS≈0）、移动端 375px 无溢出；这些同时是 Core Web Vitals 的 SEO 因子。
7. **语言**：当前 `i18n.language: en`，全站英文输出（海外 B2B 买家为主）；不做多语言（P2 再说）。

---

## 3. 信息架构与 URL 规范

### 3.1 URL 规划（本轮新增）

| URL | 工具 | canonical |
|---|---|---|
| `/tools/lux-calculator` | 照度计算器 | 自身 |
| `/tools/fixture-count-estimator` | 灯具数量估算器 | 自身 |
| `/tools/color-temperature-guide` | 色温指南 | 自身 |
| `/tools/cri-guide` | CRI 科普 | 自身 |
| `/tools/photometric-guide` | 配光/IP/IK/UGR 指南 | 自身 |
| `/tools/unit-converter` | 单位换算 | 自身 |
| `/products/compare` | 产品对比 | 自身 |
| `/products/track-lighting#beam-spread-table` | 光斑对照表（内嵌锚点） | 所在产品页 |
| 已有 `/beam-angle-calculator` | 光束角计算器 | 自身（不改） |

- sitemap：Astro 的 `@astrojs/sitemap` 会自动收录所有静态页，无需手工维护；但**锚点页（如 `#beam-spread-table`）不进 sitemap**，靠产品页内链传递。
- 每个页面必须带 `canonical`（用 `getCanonical(getPermalink(...))`，与光束角计算器同款写法）。

### 3.2 导航

- Header「Tools」下拉扩展为：Beam Angle Calculator / Lux Calculator / Fixture Count Estimator / Color Temperature Guide / CRI Guide（P0+P1 上导航）。
- Footer「Tools」栏同步扩展；P2 工具（photometric-guide、unit-converter）只进 Footer + 相关工具互链，**不上 Header**（避免导航过载、稀释权重）。
- `/products/compare` 放产品导航「Products」下拉底部。

### 3.3 互链网络（信息茧房）

```
光束角计算器 ←→ 照度计算器 ←→ 灯具数量估算器
      ↑              ↑              ↑
  博客文章 ←────→ 色温指南 ←────→ CRI 指南
                      ↑
              产品页（track-lighting / led-downlights 内嵌工具横幅 + #beam-spread-table 锚点）
```

- 每个工具页都放「Related tools」区块（3~4 个相关工具链接），锚文本用关键词变体（如 `lux calculator`、`how many lumens do I need`）。
- 工具页 → 产品页用「View Track Lighting / View Downlights」；产品页 → 工具页用「Free calculator」。

---

## 4. 分工具 SEO 规范（六件套：URL / 关键词 / 页面 / Schema / 内链 / 验收）

### 4.1 P0-1 照度计算器 `/tools/lux-calculator`

**关键词（量级 unknown）**
- 主：`lux calculator`、`how many lumens do I need`
- 次：`lux level requirements by room`、`lux to lumens`、`lighting layout calculator`、`recommended lux levels`
- 意图：信息+商业混合（买家算完要买灯）——本工具是**询盘前最后一个计算**，转化意图全场最强。

**页面 SEO**
- Title：`Lux Calculator — How Many Lumens Do I Need? | ENCORE`
- Meta description：`Free lux level calculator for retail, office, museum and warehouse lighting. Convert lux to lumens, get recommended fixture counts and spacing for LED track lights and downlights.`
- H1：`Lux Level Calculator`；H2：`How Many Lumens Do I Need?` / `Recommended Lux Levels by Space` / `From Lux to Fixture Count` / `Formula`
- 可见文本必须包含公式：`Total lumens = Area (m²) × Target lux ÷ (Coefficient of Utilization × Maintenance Factor)`；常用场景 lux 建议表（retail 300–750、office 300–500、museum 150–300、warehouse 150–300、supermarket 750）；参数 `CU = 0.6`、`MF = 0.8` 需写清楚是假设值。

**核心逻辑（给 bob code 的验收数值）**
- 输入：房间长 L、宽 W、高度（可选，用于建议间距）、用途/目标 lux、灯具功率 W、光效 lm/W
- 输出：面积、所需总流明、所需灯具数量、建议功率、建议光束角与间距
- 公式：`A = L×W`；`lumens_needed = A × lux / (0.6 × 0.8)`；`count = ceil(lumens_needed / (W × lm_per_W))`
- 验收数值：10m×8m=80㎡、retail 500 lux → 需 `80×500/0.48 ≈ 83,333 lm`；36W @ 110 lm/W = 3,960 lm/灯 → **21 盏**（`ceil(83,333/3,960)`）。间距建议：光束角 θ 在高度 h 的光斑 `D = 2h·tan(θ/2)`，建议 `spacing ≤ D`（均匀覆盖）或 `≤ D/1.2`（更高均匀度）。
- 单位：m/ft 切换（复用光束角计算器的 `toMeters/fromMeters` 模式，0.3048 常量），切换不丢已输入值。
- 边界：L/W/h>0，lux 有默认值，W、lm/W 合理区间钳制，禁止 NaN/Infinity。

**Schema**：`SoftwareApplication`（`applicationCategory: UtilitiesApplication`）+ 页面可见的 FAQ → `FAQPage`；`BreadcrumbList`。
**内链**：入=工具导航/首页 FAQ/光束角计算器「相关工具」；出=Fixture Count Estimator、光束角计算器、产品页 + CTA「Calculate for my project → /contact」。

---

### 4.2 P0-2 灯具数量估算器 `/tools/fixture-count-estimator`

**关键词**：主 `how many lights do i need`、`recessed lighting calculator`；次 `track lighting spacing`、`light layout calculator`、`downlight spacing calculator`。
**意图**：事务型，采购决策最后一步，转化意图与照度计算器同级。

**页面 SEO**
- Title：`How Many Lights Do I Need? — Fixture Count & Spacing Calculator | ENCORE`
- H1：`Fixture Count & Spacing Calculator`；H2：`How Many Lights Do I Need?`、`Recommended Spacing`、`Formula`
- 可见文本：间距经验法则 `Spacing = Beam Diameter at Work Plane`（均匀照明 `s ≤ D`，重点照明 `s ≤ 1.5×D`）；工作平面高度默认 0.8m（桌面）/ 地面。

**核心逻辑（验收数值）**
- 输入：房间 L×W、安装高度、目标照度、灯具功率/光效、光束角
- 输出：灯具数量 + 排布网格（行×列）、建议间距
- 验收数值：与照度计算器对齐——80㎡、500 lux、36W@110lm/W → 21 盏；若光束角 36°、安装 3m → 光斑 `D=2×3×tan(18°)=1.95m`，建议间距 ≤1.95m → 10m 方向 6 排、8m 方向 5 列 ≈ 30 盏上限参考（网格法），与面积法（21 盏）取较大值或给出区间，**两种口径都要显示**，避免买家困惑。
- 排布图用简单 SVG 网格（复用光束角计算器的 SVG 风格），暗色模式可用。

**Schema**：`SoftwareApplication` + `FAQPage`（"How many recessed lights do I need?"）+ `BreadcrumbList`。
**内链**：入=照度计算器/产品页；出=照度计算器、光束角计算器、产品页 CTA。

---

### 4.3 P0-3 实时询盘表单（RFQ 组件 `QuoteForm.astro`）

**定位**：不是独立页面，是全局组件，嵌入产品页 + 工具页结果区。解决「contact 表单与产品页脱节」的最大转化漏斗缺口。

**SEO/UX 规范**
- 表单字段：姓名、邮箱、公司、电话（可选）、**自动携带**：产品系列/型号、功率、光束角、色温、数量、备注 → 提交到 `sales@encore-tech.com`（沿用现有 mailto 兜底逻辑，无后端）。
- **页面可见**说明文字：「Send your specs — our engineers reply within 24 hours with pricing.」
- 隐私声明：checkbox + 链接到 `/privacy`（可索引、可抓取）。
- Schema：页面级已有 `Organization`；RFQ 表单本身不需要额外 Schema（避免误标记 `Product` 需要报价信息）。产品页可补 `Product` + `Offer`（`priceCurrency` 缺失时可不写 `offers`，宁缺勿错）。
- 无 JS 降级：表单为纯静态 HTML，提交走 `mailto:`，禁用 JS 也可用。

**验收**：产品页/工具页内嵌后，买家从「算完」到「发询盘」不超过 1 次点击；表单在 375px 无溢出；暗色模式正常。

---

### 4.4 P0-4 色温指南 `/tools/color-temperature-guide`

**关键词**：主 `color temperature`、`2700k vs 3000k`、`what color temperature is best for`；次 `cct lighting`、`warm white vs cool white`、`kelvin color chart`。
**意图**：信息型 + 选型决策（B2B 买家最常纠结色温）。

**页面 SEO**
- Title：`Color Temperature Guide — 2700K vs 3000K vs 4000K | ENCORE`
- H1：`LED Color Temperature Guide (CCT)`；H2：`What Is Color Temperature?`、`Color Temperature Chart`、`Which Color Temperature Should I Choose?`
- 可见文本必须包含：开尔文定义（`2700K warm white / 3000K warm-neutral / 4000K neutral / 5000K cool / 6500K daylight`）；场景推荐表：餐厅/酒店 2700–3000K、零售 3000–4000K、办公 3500–4000K、超市 4000–5000K、工业 5000K+；色容差（SDCM < 3 高一致性）。
- 交互：色温色卡滑块/点击对比（纯 CSS/JS 渐变，**必须有静态文字兜底**——色卡颜色本身不算 SEO 文本）。

**Schema**：`Article`/`FAQPage`（"What is 2700K?" / "Warm white or cool white?"）+ `BreadcrumbList`。
**内链**：入=产品页（各系列 CCT 选项处互链）、博客；出=CRI 指南、产品页 CTA。

---

### 4.5 P1-1 光斑尺寸对照表（交互式，产品页内嵌 `#beam-spread-table`）

- 不建独立页（防与光束角计算器自吞噬）。放 `/products/track-lighting#beam-spread-table` 与 `/products/led-downlights#beam-spread-table`。
- 内容：角度 × 高度 二维表格（10/15/24/36/60/90° × 2/3/4/5/6m），值 = `2h·tan(θ/2)`，可 m/ft 切换。行内注明「对应光束角计算器」链接。
- 与现有「Standard Beam Angles and Typical Uses」表互补：**在光束角计算器页 + 产品页各保留一种**，不复制双份大表（防重复内容）。产品页放交互对照表（配锚点），计算器页保留静态用途表。
- Schema：产品页 `Product` + `BreadcrumbList`（已有）；不额外加表格 Schema。
- 验收：SSR 输出表格首行静态可见；JS 只负责 m/ft 切换。

---

### 4.6 P1-2 CRI 科普 `/tools/cri-guide`

**关键词**：主 `cri meaning`、`cri 90 vs 80`、`what is color rendering index`；次 `high cri led`、`cri 95`。
**意图**：信息型（教育买家为什么高 CRI 值钱，服务销售溢价）。

**页面 SEO**
- Title：`What Is CRI? — Color Rendering Index Guide for LED Lighting | ENCORE`
- 可见文本：CRI 定义（Ra 0–100，日光≈100）；对比表（Ra 80 一般 / 90 优秀 / 95+ 高端博物馆级）；说明高 CRI 与显色还原的关系；R9 红色还原提示（进阶）。
- 交互：滑块/同场景对比图（可选），文字兜底。
- Schema：`Article` + `FAQPage` + `BreadcrumbList`。
- 内链：出=色温指南、产品页（高 CRI 系列 VEGA/OVEGA）CTA。

---

### 4.7 P1-3 选型向导（Product Finder，3 步组件）

- 交互组件（首页 + 产品导航入口），**无独立 SEO URL**；但必须有 `noscript`/静态兜底文本指向产品页。
- 步骤：应用场景（零售/博物馆/办公/餐饮）→ 空间与高度 → 偏好（光束角/色温/CRI）→ 推荐系列。
- 与产品页互链：结果卡片链到对应产品页（`/products/track-lighting` 等），锚文本含系列名（VEGA/OVEGA/IMAX/FLEX）。
- 验收：结果不重复产品页大段描述（薄内容风险），每个推荐只给系列 + 一行理由 + 链接。

---

### 4.8 P2-1 单位换算器 `/tools/unit-converter`

- 主关键词：`m to ft converter`、`watt to lumen`（low 竞争，服务意识加分）。
- 页面：`/tools/unit-converter`，表单 + 静态说明 + FAQ（"How many feet in a meter?"）+ `FAQPage` + `BreadcrumbList`。
- 复用 `UNIT_M_PER_FT = 0.3048` 常量；进 Footer + 相关工具互链，不上 Header。

---

### 4.9 P2-2 配光/IP/IK/UGR 指南 `/tools/photometric-guide`

- 主关键词：`ugr meaning`、`ip rating chart`、`what is photometric data`、`ik rating`。
- 内容（全部 SSR 静态）：配光曲线怎么看（三步教程）、UGR 对照表（`<13` 制图 / `<16` 办公 / `<19` 公共 / `<22` 工业 / `<25` 交通区）、IP 对照（IP20 室内 / IP44 防溅 / IP65 防尘防喷）、IK 对照（IK07/IK08/IK10）、IES 文件是什么。
- 与博客 `why-is-track-lighting-hated...`（已讲 UGR）互链，**不复制**博客段落，只做「深入版」。
- Schema：`Article` + `FAQPage` + `BreadcrumbList`。

---

### 4.10 P2-3 产品对比表 `/products/compare`

- 主关键词：`track light comparison`、`vega vs ovega`（品牌词，量级 low）。
- 页面必须有一段**唯一介绍文本**（防薄内容）：「Compare ENCORE track lighting series by wattage, beam angle, CRI and dimming」+ 系列简介各一行（从产品页提炼，**不整段复制**）。
- 交互：勾选 2–4 个系列并排对比；移动端横向滚动容器（375px 无溢出）。
- Schema：`BreadcrumbList`；产品数据字段保持一致（同 `Product` 术语）。
- 内链：产品导航 + 各产品页「Compare series」入口。

---

## 5. 通用技术 SEO 清单（所有工具页强制执行）

| # | 项 | 要求 |
|---|---|---|
| 1 | robots | `index, follow`（默认即可） |
| 2 | canonical | 每页自指，`getCanonical(getPermalink(...))` |
| 3 | BreadcrumbList | 每页输出（Home > Tools > 工具名），item 用生产域名绝对 URL |
| 4 | sitemap | `@astrojs/sitemap` 自动；构建后确认新页在 `sitemap-index.xml` |
| 5 | Title/Meta | ≤ 60 字符 title、≤ 160 字符 description、含主关键词 |
| 6 | SSR 文本 | 公式 + 说明 + FAQ 全部静态输出；`curl` 能 grep 到关键词 |
| 7 | 移动端 | 375px 无横向溢出 |
| 8 | Core Web Vitals | 纯前端、无重型库；首屏无布局偏移；图片 lazy（除 hero） |
| 9 | 暗色模式 | `dark:` 全覆盖，SVG 对比度正常（与光束角计算器一致） |
| 10 | 无 console 错误 | build / check 通过 |
| 11 | hreflang | 单语言 en，**本轮不加**（避免错误 hreflang 反而有害） |

---

## 6. AI 搜索可见性（Google AI Overviews / Bing / Perplexity / ChatGPT Search）

- **复用基础 SEO**：AI 搜索主要引用可抓取、结构清晰的页面内容。工具页的「公式 + 解释 + FAQ」三件套就是最佳素材。
- 每个工具页的 FAQ 用 `FAQPage` 结构化数据 + **页面可见**的问答对，双保险（既能进 Rich Results，也能被 AI 搜索引用）。
- 问答写法贴近自然提问（谁/什么/多少/怎么），例如「How many lumens do I need for a 100 m² retail space?」。
- **不需要** llms.txt / 专门 AI 标记（Google 官方立场：AI Overviews 复用现有 SEO 信号）。

---

## 7. 遗留补强（已有页面，本轮顺带做）

| # | 项 | 位置 | 说明 |
|---|---|---|---|
| 1 | FAQPage Schema | `/beam-angle-calculator` | 页面已有 5 条 FAQ 可见问答，补 `FAQPage` JSON-LD（bob view 之前标记的遗留项） |
| 2 | 工具↔博客互链 | 博客 `why-is-track-lighting-hated...` | 博客已承诺「beam selection guide on the track lighting product page」：工具页/产品页加链接回博客，博客链接到工具页锚点，兑现承诺 |
| 3 | 首页 FAQ | `/`（已部分完成） | 已有一条指向 `/beam-angle-calculator`；新工具上线后追加对应 FAQ（lux / fixture count） |

> 需求文档入库（`docs/beam-angle-calculator-requirement.md`）属 bob idea 的交付，建议本轮一并补交留档。

---

## 8. 验收门禁（给 bob view 复用，每个工具一把尺）

```
[P0] 公式正确性（按第 4 章每工具给出的验收数值复算）
[P0] m/ft 换算正确（0.3048 常量、方向正确、切换不丢值、主结果/提示/图例口径统一）
[P0] 边界钳制（禁止 NaN/Infinity；输入区间合理）
[P0] SSR 静态文本（curl 页面 grep 公式关键词命中）
[P0] H1/H2 含主关键词簇；Title/Meta/canonical/Breadcrumb 齐全
[P0] 375px 无溢出、暗色模式正常、无 console 错误
[P0] npm run build / npm run check 通过
[P1] FAQPage/SoftwareApplication/Article Schema 输出且与可见文本一致
[P1] 相关工具互链 + 询盘 CTA 闭环
[P1] 新页出现在 sitemap
[P2] 与博客互链、产品页锚点内嵌、首页 FAQ 补充
```

---

*数据说明：所有关键词量级与排名数据标 `unknown`（无 Search Console/爬取权限）。上线后如需抓取验证（索引、SERP、结构化数据渲染），随时召唤 bob seo 复查。*

排名我优化，流量自然来。
