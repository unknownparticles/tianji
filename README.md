# 天机卦 — 传统周易卜卦

本项目为一个简洁的传统周易占卜前端应用，包含起卦、展示六爻、纯本地知识库解卦与可选 AI 深度解卦功能。

## 本地运行（快速开始）

先决条件：已安装 Node.js（推荐 16+）

1. 安装依赖：

   ```bash
   npm install
   ```

2. 本地知识库解卦无需任何配置；如需使用 AI 解卦，可在页面设置中填写对应 API Key。

3. 启动开发服务器：

   ```bash
   npm run dev
   ```

在浏览器打开 `http://localhost:5173`（vite 默认端口）查看应用。

## 本地知识库

本地解卦是默认方式，知识数据随应用打包，运行时不会请求外部接口。知识库覆盖 64 卦、384 爻、卦辞、爻辞、白话翻译和传统变爻取用规则。

经典原文参考 Wikisource 公版《周易》，结构化数据与白话翻译基于 MIT 授权的 `koriyoshi2041/zhouyi`。完整来源和许可证见 `data/iching/NOTICE.md`。

## AI 环境变量（可选）

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
- 摇一摇起卦：在 iPhone Safari 或 Android Chrome 中主动启用传感器后，可通过摇动手机触发抛币；权限不可用时仍可使用按钮。
- 抛币反馈：铜钱风暴动画包含本地合成音效与设备支持时的短震动，可通过抛币区音量按钮静音。
- 展示：显示本卦与变卦（若存在动爻）。
- 本地解卦：默认使用内置知识库，根据本卦、变卦、动爻和所问事项生成结构化解读。
- AI 解卦：可选择 `Gemini` / `GLM` / `DeepSeek`，在前台配置 API Key 后生成扩展解读。

## 移动端传感器说明

- iPhone Safari 首次启用摇一摇时会请求动作与方向访问权限；拒绝后仍可点击“重新启用摇一摇”再次尝试。
- Android Chrome 不需要单独的系统弹窗，但仍需在页面中主动点击启用。
- 设备传感器通常要求 HTTPS 安全上下文，本地开发可使用 `localhost`；通过局域网 HTTP 地址访问时可能无法启用。
- 页面只在尚可抛币且动画停止时监听摇动，卦象完成或页面进入后台后会暂停监听。
- 系统开启“减少动态效果”时，高速旋转、轨迹和火花会自动简化。

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
