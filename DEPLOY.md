# Subly 发布操作清单

给「一个人」的照做清单。三条路任选其一，**都不花钱**。

---

## 0. 上线前：把占位换成真实信息

站点里有几处 `subly.example.com` 和 `example.com` 占位，发布前替换成你的真实域名（用免费子域名也可以，见下方各方案给出的地址）：

| 文件 | 需要替换 |
|---|---|
| `site/index.html` | `canonical`、`og:url`、`og:image`、`twitter:image` 里的域名 |
| `site/sitemap.xml` | 两处 `<loc>` 域名 |
| `site/robots.txt` | `Sitemap:` 域名 |
| `site/privacy.html` | `privacy@example.com` 换成你的联系邮箱 |

> 一次性替换命令（把 `你的域名` 换成实际的）：
> ```bash
> cd subly/site
> grep -rl 'subly.example.com' . | xargs sed -i 's#subly.example.com#你的域名#g'
> ```

---

## 方案 A · Cloudflare Pages（推荐，免费子域名 `xxx.pages.dev`）

1. 注册/登录 https://dash.cloudflare.com
2. 左侧 **Workers & Pages → Create → Pages → Connect to Git**
3. 授权 GitHub，选中本项目仓库
4. 构建设置：
   - **Framework preset**：None
   - **Build command**：留空
   - **Build output directory**：`site`
5. 点 **Save and Deploy**。几十秒后拿到 `https://<项目名>.pages.dev`
6. （可选）绑定自定义域名，再回第 0 步替换域名占位

## 方案 B · Netlify（免费子域名 `xxx.netlify.app`）

仓库里已有 `netlify.toml`（`publish = "site"`），所以：

1. 登录 https://app.netlify.com
2. **Add new site → Import an existing project** → 选 GitHub 仓库
3. 构建命令留空、发布目录会自动读到 `site`，直接 Deploy
4. 或用**拖拽**：先 `python scripts/package.py`，把 `dist/subly-site.zip` 拖到 https://app.netlify.com/drop

## 方案 C · GitHub Pages（CI 已配好）

仓库里已有 `.github/workflows/deploy.yml`，推送到 `main` 即自动发布：

1. 在 GitHub 新建仓库，把本地仓库推上去：
   ```bash
   git remote add origin git@github.com:<你的用户名>/subly.git
   git push -u origin main
   ```
2. 仓库 **Settings → Pages → Source** 选 **GitHub Actions**
3. 推送后 Actions 自动部署，地址为 `https://<用户名>.github.io/subly/`

> 注意：GitHub Pages 部署在子路径 `/subly/` 下，站内绝对路径（如 `og.png`）需相应确认；若用自定义域名则无此问题。

---

## 上线后自检

- [ ] 首页、应用页、隐私页、404 页都能打开
- [ ] 手机浏览器访问，布局正常（响应式）
- [ ] 分享链接到微信/推特，能看到标题和 `og.png` 预览图
- [ ] `app.html` 添加一条订阅、刷新，数据仍在
- [ ] 隐私政策里的联系邮箱是真实可收信的
