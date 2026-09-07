# 价格预警邮件推送

GLOBAL SENTINEL 已加入 GitHub Actions + OKX 的价格邮件预警。检查频率为每 5 分钟；邮件只在价格首次穿越阈值时发送，价格回到阈值另一侧后自动重新武装。

## 1. 设置预警

进入仓库：Settings → Secrets and variables → Actions → Variables，新增：

- `ALERT_SYMBOL`：例如 `ETH-USDT`、`BTC-USDT`、`SOL-USDT`、`XAUT-USDT`
- `ALERT_PRICE`：目标价格，例如 `4500`
- `ALERT_DIRECTION`：`above` 表示突破上方；`below` 表示跌破下方

## 2. 设置邮箱 SMTP

同一页面的 Secrets 中新增：

- `SMTP_HOST`：SMTP 服务器，例如 Gmail 为 `smtp.gmail.com`
- `SMTP_PORT`：通常 `587`
- `SMTP_USER`：SMTP 登录邮箱
- `SMTP_PASS`：SMTP 密码或应用专用密码
- `ALERT_TO`：接收预警的邮箱
- `ALERT_FROM`：可选；不设置时使用 `SMTP_USER`

不要把 SMTP 密码写进代码或提交到仓库。

## Gmail 示例

使用 Gmail 时建议开启两步验证并创建 App Password，然后：

`SMTP_HOST=smtp.gmail.com`

`SMTP_PORT=587`

`SMTP_USER=你的Gmail`

`SMTP_PASS=Gmail应用专用密码`

## 3. 手动测试

进入 Actions → `Refresh market news + price email alerts` → `Run workflow`。

如果预警条件已经满足，且尚未发送过，会立即发出邮件；否则等待下一次 5 分钟轮询。

> GitHub Pages 本身是静态网站，不能安全保存 SMTP 密码。因此邮件发送由 GitHub Actions 在服务器端完成，行情仍直接来自 OKX 公共 API。
