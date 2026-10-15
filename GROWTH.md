# Subly 获客作战计划

## 先认清一件事

产品上线 ≠ 有人用。Subly 现在是公网上一个真实、可访问、可用的产品。
问题不是"能不能用"，是"**没人知道它存在**"。

所以这一阶段唯一目标：**让第一批 50 个人知道并试用**。
不是加功能，是让知道它的人变多。

---

## 目标用户

- 手里有 5 个以上自动续费订阅的人
- 对"钱不知道花哪了"有痛感的人
- 隐私敏感、不想把账单交给第三方的人

---

## 渠道（按见效速度排序）

### 1. 你自己的社交圈 —— 今天就能做，最可能立刻有人用
- 微信朋友圈 / 微信群
- 给最可能感兴趣的朋友**私发**（点对点，转化率最高）

### 2. 中文社区
- **V2EX**（程序员、工具爱好者聚集，"分享创造"节点）
- **小红书**（搜索"订阅管理""省钱""自动续费"话题）
- **即刻 / 掘金 / 少数派**

### 3. 英文社区（想把目标扩到海外再发）
- **Hacker News**（Show HN）
- **Reddit**：r/SideProject、r/personalfinance、r/PrivacyTools

---

## 现成文案（直接复制）

### ① 朋友圈 / 微信群

> 做了个小工具 **Subly**：把手机里那些自动续费的订阅都记下来，
> 一眼看清每个月、每年到底被扣了多少，哪些快到期该砍了。
> 不用注册、不连银行，数据只存在你自己浏览器里。免费。
> 👉 https://hengpuren-code.github.io/subly/
> 用着顺手的话，帮我留句反馈～

### ② V2EX「分享创造」节点

标题：
`[分享] 做了个本地优先的订阅支出追踪器，数据不出浏览器`

正文：
> 痛点：手机里一堆自动续费，小额高频，没人盯着，一年下来悄悄溜走不少钱。
> 市面上的订阅管理要么连银行、要么要注册账号上传数据。
> 我做了个反着来的：纯前端、零后端，数据只存 localStorage，不注册、不联网。
> 功能：录入订阅 → 折算月均/年均 → 7 天内到期高亮 → 可调提前天数的提醒 → 导入导出。
> 技术：纯 HTML/CSS/ES Module，无框架无依赖，扔到 GitHub Pages 就能跑。
> 在线：https://hengpuren-code.github.io/subly/
> 源码：https://github.com/hengpuren-code/subly
> 求轻拍，更想知道：你会不会用？还缺什么？

### ③ Hacker News（Show HN）

标题：
`Show HN: Subly – A local-first subscription tracker with no signup`

正文：
> I built a subscription tracker that never touches your data.
> Everything lives in localStorage — no account, no server, no bank connection.
> Add subscriptions, and it computes monthly/yearly totals and flags renewals coming up.
> Pure static HTML/JS, no framework, no dependencies.
> Live: https://hengpuren-code.github.io/subly/
> Would love to know whether this is useful to you.

### ④ Reddit r/SideProject

标题：
`I built a no-signup, local-first subscription tracker`

正文：同 ③ 英文版。

---

## 发布节奏（重要，别一次全发）

先做**一次小范围测试**，别再盲目群发：

1. 先发**朋友圈 + 私发 3~5 个朋友**，观察：
   - 有没有人点开？
   - 点开后有没有真的录入订阅？
   - 有没有人回复 / 问问题？
2. 根据反馈**改一版文案**（到底哪个点最打动人：省钱？隐私？极简？）
3. 文案验证过了，再去公开社区发（V2EX / HN）—— 那时文案已经过实战

---

## 只问这四个问题（别问太多）

发出去后收集反馈，就问：
1. 你手机里有几个自动续费订阅？
2. 打开页面，你第一眼知道它是干嘛的吗？
3. 你会不会真的用它？为什么 / 为什么不会？
4. 哪里让你犹豫？（要注册？怕丢数据？觉得多余？）

---

## 诚实说明：我不能做的事

我（AI）**无法替你注册账号、无法替你发帖**。朋友圈 / 小红书 / V2EX / HN / Reddit
都绑定你的真人身份，也都有反机器人机制。**"发"这个动作只能你来做。**

我能做的是：把文案写好、把发帖页面打开到你面前、把链接整理好，
让你**复制粘贴就能发**，把成本降到最低。

---

## 下一步候选（产品级传播钩子，想清楚了再做）

- 应用内「**分享我的订阅账单**」按钮：生成一张年度订阅支出图，用户一键发出去（自传播）
- 「**年度回顾**」页：像 Spotify Wrapped 那样，把省钱成果做成可分享的卡片

> 前提：先拿到真实用户反馈，确认真有人愿意分享，再做。否则是为想象的需求写代码。
