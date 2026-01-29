# 天机卦 — 传统周易卜卦

本项目为一个简洁的传统周易占卜前端应用，包含起卦、展示六爻与调用 AI 解卦的基础功能。

## 本地运行（快速开始）

先决条件：已安装 Node.js（推荐 16+）

1. 安装依赖：

   ```bash
   npm install
   ```

2. 可选：在项目根目录创建 `.env.local` 并配置需要的环境变量（示例见下）。

3. 启动开发服务器：

   ```bash
   npm run dev
   ```

在浏览器打开 `http://localhost:5173`（vite 默认端口）查看应用。

## 环境变量（可选）

如果需要使用外部 AI 提供者，请在 `.env.local` 中添加相应变量：

- `API_KEY` 或 `GEMINI_API_KEY`：用于 Google Gemini（当使用 Gemini provider 时）。
- `GLM_API_URL`：当选择 `glm` provider 时的 HTTP 接口地址。
- `GLM_API_KEY`：`glm` 接口的可选授权密钥（如果服务需要）。
- `DEEPSEEK_API_URL`：当选择 `deepseek` provider 时的 HTTP 接口地址。
- `DEEPSEEK_API_KEY`：`deepseek` 的可选授权密钥（如果服务需要）。

示例 `.env.local`：

```
API_KEY=sk-xxxx
GLM_API_URL=https://your-glm.example/v1/generate
GLM_API_KEY=glmk-xxxx
DEEPSEEK_API_URL=https://api.deepseek.example/generate
DEEPSEEK_API_KEY=ds-xxxx
```

注意：前端内直接调用第三方服务会暴露密钥，生产环境建议把 AI 调用放到后端代理或 serverless 函数中。

## 功能说明

- 起卦：点击“掷三枚铜钱”生成六爻卦象。
- 展示：显示本卦与变卦（若存在动爻）。
- 解卦：可选择 AI 提供者（`Gemini` / `GLM` / `Deepseek`）并在前台输入附加说明，调用对应服务生成卦辞。

## 可选改进

- 将 AI 请求移至后端以保护密钥。
- 根据目标 provider 调整请求格式与速率限制处理。

## 部署说明

若部署到 GitHub Pages 等非根目录环境（例如 `https://username.github.io/repo/`），需在 `vite.config.js` 中配置 `base` 路径，否则会出现白屏：

```js
export default defineConfig({
  base: '/tianji/', // 替换为你的仓库名称
  // ...
})
```

## 贡献与联系

如需贡献或反馈，请打开 issue 或 PR。欢迎邮件联系维护者（在项目仓库中补充联系方式）。

---

祝起卦平安，问事端详。`
