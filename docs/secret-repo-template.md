# 密钥仓库 `vercel.yml` 规范模板（自动部署 Vercel 用）

> 本文档给出 CNB 密钥仓库 `beamangle-secrets` 中 `vercel.yml` 的**唯一标准格式**。
> 按此模板在 Web 界面**一次性粘贴**即可，不要再额外加任何内容。

## 一、最终要达成的文件内容（就这 1 段）

在密钥仓库 `beamangle-secrets` 里新建/清空文件 `vercel.yml`，内容**只有下面这 3 行**（可含注释，但值必须用英文双引号包住）：

```yaml
VERCEL_TOKEN: "vcp_你的VercelToken"
allow_slugs: "Beamanglespace/Beamangle"
allow_branches: "main"
```

> 注释（**不要**写进文件里）：
> - 第 1 行 `VERCEL_TOKEN`：Vercel 个人访问令牌，`vcp_` 开头，用**英文双引号**包住，后面**不允许**有尾随空格/换行外的任何字符。
> - 第 2、3 行 `allow_*`：声明授权范围，让 `Beamanglespace/Beamangle` 仓库的 `main` 分支流水线能引用本文件（这是 CNB 官方文档要求的声明式授权）。
> - 不要加 `---` 分隔符、不要加空行注释、不要把其他变量塞进来。

## 二、验收标准（保存后一定不会报错）

1. 文件是 **UTF-8 无 BOM** 编码（用 CNB Web 编辑器默认保存即可）。
2. 全文**没有** `---`、没有多余空行、没有中文标点、没有 `#` 开头的行。
3. `VERCEL_TOKEN:` 冒号后**有一个英文空格**，然后是双引号包裹的 token。
4. 保存后，`vercel.yml` 在 Web 界面应显示为**纯文本 3 行**，没有 YAML 语法高亮报错。

## 三、保存后要做的两件事

1. 把密钥仓库里 `vercel.yml` 的引用权限/内容确认无误。
2. 回来 @ CodeBuddy（本 Issue）说一声「模板已贴好」，我会：
   - 在 `.cnb.yml` 中启用 `imports` 引用该文件；
   - 触发一次构建验证 `VERCEL_TOKEN` 正确注入；
   - 之后每次 push main 即自动构建并部署到 Vercel production。

## 四、如果仍然报 YAML 错（兜底排查）

| 现象 | 原因 | 处理 |
|---|---|---|
| `end of the stream or a document separator is expected (N:M)` | 文件里有多余的 `---` 或空行/多段内容 | 清空后只保留上述 3 行 |
| `Invalid YAML content` | 值没加引号 / 有特殊字符（`:` `#` `{` 空格） | 用双引号包住值 |
| token 注入后部署到错误项目 | token 与项目不匹配 | 确保 token 是 `lightoem` 所在账号/团队下创建 |
