# Subly · 发布与增长手册

一个人做、一个人发、一个人涨。这份文件就是我的作战计划。

## 0. 一句话定位

> **Subly —— 看清每一笔订阅，别再为忘掉的东西付钱。**
> 本地优先、无需注册、数据不出浏览器。

## 1. 发布清单

- [x] MVP 可运行（添加/统计/排序/导入导出/本地持久化）
- [x] 单元测试通过（`node --test test/smoke.mjs`）
- [x] 落地页 + 定价
- [x] favicon / robots.txt / sitemap.xml / 安全头
- [x] 打包脚本（`python scripts/package.py` → `dist/subly-site.zip`）
- [ ] 绑定正式域名（把 sitemap.xml 里的 `subly.example.com` 换成真实域名）
- [ ] 提交到搜索引擎（Google Search Console / Bing）

## 2. 上线步骤

**方案 A · Cloudflare Pages（首选：免费、全球 CDN、零配置）**
1. 把 `subly/site/` 推到一个 Git 仓库
2. Cloudflare Dashboard → Pages → 连接仓库
3. 构建命令留空，输出目录填 `site`
4. 部署。绑定自定义域名

**方案 B · 拖拽部署（最快）**
1. `python scripts/package.py`
2. 打开 Netlify Drop，把 `dist/subly-site.zip` 拖进去
3. 完成

**方案 C · GitHub Pages**
1. 把 `site/` 内容推到 `gh-pages` 分支
2. 仓库 Settings → Pages → 选择该分支

## 3. 冷启动（零预算）

按「先找第一批 100 个用户」的优先级排：

1. **Reddit / Hacker News**：r/personalfinance、r/frugal、Show HN。
   标题模板：「I built a local-first subscription tracker — no account, no server, your data never leaves the browser.」
2. **Product Hunt**：主打「privacy-first + no signup」的差异点。
3. **相关社区**：r/selfhosted、r/privacy、r/PersonalFinanceCanada 等对隐私敏感的版块。
4. **内容 SEO**：写「How much do you spend on subscriptions?」「cancel forgotten subscriptions」这类长尾。

**文案钩子（试 3 版做 A/B）**
- 隐私角度：「我们连银行都不连，因为根本不需要。」
- 省钱角度：「平均每个人每年为忘掉的订阅花掉约 X 百元。」
- 极简角度：「2 分钟，一个页面，看清你所有的订阅。」

## 4. 定价与转化

| | 免费 | Pro |
|---|---|---|
| 订阅数 | ≤ 8 | 无限 |
| 统计 | ✓ | ✓ |
| 续费提醒 | — | ✓ |
| 多币种 | — | ✓ |
| CSV 导出 | — | ✓ |
| 价格 | $0 | $19 一次性 |

- **付费点**：免费额度（8 个）是转化钩子——真实用户往往超过 8 个
- **一次性买断**：独立开发者产品，买断比订阅更易成交、口碑更好
- **转化路径**：免费用到第 8 个 → 触顶提示升级

## 5. 北极星指标

- 主指标：**周活跃用户中「录入了 ≥ 5 个订阅」的比例**（代表真的用起来了）
- 次要：落地页 → app 的点击率、免费 → Pro 转化率

## 6. 下一步路线（M5+）

- [x] 续费提醒（到期面板 + 浏览器本地通知）
- [ ] 续费提醒（邮件 / 本地定时通知，需极轻后端或 Service Worker）
- [ ] 多币种与汇率
- [ ] 分类预算与图表
- [ ] 「一键取消」指引（跳转到各服务的取消页）
- [ ] 可选的端到端加密云同步（仍不碰明文）

---

*一个人创业的纪律：先发布，再优化。没有用户，就没有可优化的问题。*
