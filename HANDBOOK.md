# Subly 维护手册

自己看的：日常怎么更新、怎么排错、怎么回滚。

## 站点信息

| | |
|---|---|
| 线上地址 | https://hengpuren-code.github.io/subly/ |
| 代码仓库 | https://github.com/hengpuren-code/subly |
| 发布账号 | hengpuren-code（`gh` 命令行已认证） |
| 部署方式 | GitHub Pages，推送 `main` 自动发布（`.github/workflows/deploy.yml`） |

---

## 日常：改完代码怎么上线

```bash
cd F:/vscode/my/28dg/subly
git add -A
git commit -m "说明这次改了什么"
git -c http.proxy= -c https.proxy= -c credential.helper= -c 'credential.helper=!gh auth git-credential' push origin main
```

推送后约 20 秒自动上线。

### 为什么 push 要带那一长串参数？

两个本地环境的坑，各对应一段：

1. **`-c http.proxy= -c https.proxy=`**
   你的 git 全局配置写死了代理 `127.0.0.1:7897`（Clash / 机场软件）。代理软件**没开**时推送会报
   `Failed to connect to github.com port 443 via 127.0.0.1`。这两段临时**禁用代理**、走直连。
   → 如果代理软件是开着的，这两段可以去掉。

2. **`-c credential.helper= -c 'credential.helper=!gh auth git-credential'`**
   Windows 凭据管理器里缓存的是**另一个账号 `jue-2022`** 的凭据，直接推会报
   `Permission to hengpuren-code/subly.git denied to jue-2022`。这段让 git 改用 `gh` 里已认证的 hengpuren-code。

> 嫌这串太长？可以让 Claude 帮你配一个 git 别名，比如 `git ship`。

---

## 查看部署状态

```bash
gh run list -R hengpuren-code/subly --limit 3
```

- `completed  success` → 上线成功
- `in_progress` → 还在跑
- `failure` → 失败，看日志：

```bash
gh run view <run-id> -R hengpuren-code/subly --log-failed
```

---

## 回滚到上一个版本

```bash
cd F:/vscode/my/28dg/subly
git revert HEAD
git -c http.proxy= -c https.proxy= -c credential.helper= -c 'credential.helper=!gh auth git-credential' push origin main
```

---

## 脚本速查

| 命令 | 作用 |
|---|---|
| `node --test test/smoke.mjs` | 跑测试（改了 `logic.js` 必跑） |
| `python scripts/preflight.py` | 上线前体检（失效资源 / 漏替换的占位符） |
| `python scripts/package.py` | 打包 `dist/subly-site.zip`（拖拽部署用） |
| `python scripts/make_og.py` | 重新生成分享卡 `site/og.png` |
| `python scripts/set_domain.py <域名>` | 换绑域名（同步改 canonical / sitemap / robots） |

---

## 本地预览

```bash
cd F:/vscode/my/28dg/subly/site
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

必须用 http 访问：应用是 ES Module，直接双击 `file://` 会被浏览器拦截（页面能看，但功能不动）。

---

## 以后想换个好域名

1. 买域名（约 $10/年），在域名商把 DNS 指向 GitHub Pages
2. 仓库 **Settings → Pages → Custom domain** 填域名
3. 运行 `python scripts/set_domain.py <你的域名>`，然后提交推送

---

## 常见坑速查

| 症状 | 原因 | 解法 |
|---|---|---|
| `Could not connect ... 127.0.0.1` | 全局代理没开 | 开代理，或照上面带 `-c http.proxy=` |
| `denied to jue-2022` | 凭据串了另一个账号 | 照上面带 `credential.helper` 那两段 |
| 改动没生效 | 部署失败或浏览器缓存 | 看 Actions 是否 success；Ctrl+F5 强刷 |
