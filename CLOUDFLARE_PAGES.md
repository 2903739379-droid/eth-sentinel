# Cloudflare Pages 部署

GLOBAL SENTINEL 已加入 Cloudflare Pages 配置，可直接从 GitHub 仓库部署。

## 推荐部署方式：Cloudflare Dashboard

1. 登录 https://dash.cloudflare.com/
2. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**。
3. 选择 `2903739379-droid/eth-sentinel`。
4. Production branch 选择 `main`。
5. Framework preset 选择 **None**。
6. Build command 留空。
7. Build output directory 填 `.`。
8. 点击 **Save and Deploy**。

部署后会得到 `*.pages.dev` 地址，也可以在 Cloudflare Pages 中绑定自己的域名。

## Cloudflare 部署后的能力

- 静态网站全球 CDN
- Cloudflare Pages Functions：`/api/okx?instId=ETH-USDT`
- OKX 行情 API 代理，浏览器无需直接请求 OKX
- 安全响应头 `_headers`
- 保留现有 K 线、实时行情、新闻、情绪、多空建议、风险指标和价格预警界面

## 邮件预警说明

当前仓库仍保留 GitHub Actions 的 SMTP 邮件预警方案，因此迁移网站托管不会丢失现有邮件预警能力。

如果希望完全脱离 GitHub Actions，可以下一步把邮件预警迁移到 Cloudflare Worker/Queues + 邮件服务（例如 Resend、MailChannels 或 SMTP 中转），SMTP/API 密钥只放在 Cloudflare Secrets 中，绝不放进前端代码。

## 本地 Wrangler 部署

安装 Wrangler 后可使用：

```bash
npx wrangler pages deploy . --project-name global-sentinel
```

首次部署时 Wrangler 会提示登录 Cloudflare 并选择/创建 Pages 项目。
