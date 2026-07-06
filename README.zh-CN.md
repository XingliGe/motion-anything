# ✨ motion-anything

> **AI 时代的动效层。** 你描述*感觉*，AI 产出*动效*。
>
> 一个开源、以对话为核心的动效引擎，服务网页、slides 和视频。
> 浏览精选动效配方库，一键复用；也可以把任意配方**导出为 skill**，丢给你自己的 AI agent。
>
> 🧩 与 [Open Design](https://github.com/nexu-io/open-design) 深度咬合 ·
> 🔑 BYOK / 接你自己的本地 CLI · 🛡️ Apache-2.0 · 🚫 无按次渲染费

---

## 为什么做 motion-anything？

动效是数字产品里"杠杆最高、却最被低估"的一环。四个问题让好动效遥不可及：

1. **大家不知道能做成什么** —— 多数人根本不了解 AI 已经能做出什么动效。
2. **生态太散** —— GSAP、Framer Motion、Motion One、anime.js、Lottie…… 每个都有上手成本。
3. **动效难用语言描述** —— "想要丝滑 / 有弹性 / 有惊喜感"，很难翻译成代码。
4. **没人教克制** —— 动效不是越多越好，而且没有一套公认的规范。

motion-anything **不是又一个动效库**。它是一个**精选 + 标准化的动效库 + 一个"品味引擎" + 一条让你通过 AI 落地动效的通道**。

## 它怎么工作

```
你（在 agent 对话框里）：  "做一个动效好看的落地页"
                                    │
                        skills/motion-anything（路由）
                                    │
            ┌───────────────────────┼───────────────────────┐
        判断意图                  挑选配方                按规范应用
     (网页 / 视频 / app)      （从 recipes/ 库里）     (时长·克制·reduced-motion)
                                    │
                              ✨ 带动效的成品
```

所有产出都是**纯文件**（Markdown skill、YAML manifest、HTML/CSS/JS），放在 git 仓库里——
**不锁定任何工具**。同一套 skill 可用于 Claude Code、Cursor、Codex 等 17+ 种 agent。

## 快速开始

> v0 是 CLI + skills + 静态画廊。**无需安装包，无需桌面 app。**

```bash
# 打开"可能性画廊"（本地网页）
npx motion-anything gallery

# 列出所有动效配方
npx motion-anything list

# 把某个配方导出为 skill，丢给你的 AI
npx motion-anything add like-burst
```

然后，在你的 coding agent（Claude Code / Cursor……）对话框里直接说需求：

> *"给这个心形按钮加一个有惊喜感的点赞动效"*
> *"做一个转场丝滑的发布视频"*
> *"给这个 app 展示页加上丰富又得体的动效"*

## 仓库结构

| 路径 | 是什么 |
|------|--------|
| [`recipes/`](recipes/) | 精选动效库。每个配方 = 一个 Open Design 兼容的 `SKILL.md` + 实时预览 + 多种实现。 |
| [`skills/motion-anything/`](skills/motion-anything/) | **路由 meta-skill**：把一句话变成"匹配 + 产出"的动效。 |
| [`MOTION-SPEC.md`](MOTION-SPEC.md) | 动效规范——时长、缓动、克制预算、无障碍。即"品味引擎"。 |
| [`gallery/`](gallery/) | 可能性画廊——看每个配方在动。 |
| [`cli/`](cli/) | 最小 CLI：`list`、`add`、`gallery`。 |

## 路线图

- **v0** —— 动效配方库 + 路由 skill + 画廊 + "导出为 skill" ← *当前阶段*
- **v0.x** —— Open Design 风格本地 web app 外壳（对话式、BYOK、沙箱预览）
- **v1** —— 给已有 Open Design 作品自动加动效；丝滑 launch/release 视频；设计组件 → 动效自动分配

实时进度见 [`PROGRESS.md`](PROGRESS.md)。

## 许可

[Apache-2.0](LICENSE)。隶属 [nexu.io](https://github.com/nexu-io) / Open Design 产品家族。
