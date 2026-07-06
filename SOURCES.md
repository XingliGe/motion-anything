# SOURCES.md — 动效来源盘点 & 收录路线图

> 这份文档回答两件事：(1) 外面有哪些可作"原料"的开源/主流动效来源；(2) 我们按什么原则、
> 什么优先级把它们纳入 motion-anything。
> 配合阅读：产品定位见 `README.md`；动效标准见 `MOTION-SPEC.md`；manifest 字段见 `AGENTS.md`。
>
> _状态：v0 草案（2026-06-25）。第 5 节的建库 schema 拍板后再落到 AGENTS.md。_

## 0. 一句话定位

我们不是"又一个素材站"。我们建的是一个 **可被 AI 检索 / 选择 / 参数化 / 导出 / 注入的 motion
system（motion intelligence layer）**。所以：**来源只是原料，统一的 manifest 才是产品。**
收录的价值 ≠ 收了多少个站，而 = 把多少异构来源**归一化**成了我们的标准。

## 1. 收录三原则

1. **意图驱动，不按来源分类。** 来源（Lottie / Remotion…）只作元数据，用于许可与溯源，不作分类轴。
2. **克制优先。** 每条 recipe 必带 `restraint` / `avoid_when`（MOTION-SPEC）。宁缺毋滥——知道"何时不加"是产品的灵魂。
3. **许可证先行。** 逐一核实 license。注意：**素材文件的版权 ≠ 库本身的开源许可**（Lottie 库是 MIT，但 LottieFiles 上的素材版权归作者）。

## 2. 来源盘点（按产物形态；许可证需在集成前逐一复核）

### ① 声明式 / JSON 动效格式 —— 与 motion-as-JSON 最对口
| 名称 | 形态 | 许可（待核实） | 梯队 | 备注 |
|------|------|----------------|------|------|
| Lottie (lottie-web / dotLottie) | JSON | 库 MIT；素材归作者 | **T1** | AE 导出 JSON，跨端。最契合 motion-JSON 桥接 |
| Rive (.riv) | JSON+状态机 | 运行时开源；文件归作者 | **T1** | 带交互/状态机，比 Lottie 强 |
| Theatre.js | JSON+可视化编辑 | Apache-2.0 | **T1** | 几乎就是我们想做的"motion-as-JSON 编辑器" |
| SVG (SMIL / SVGator) | 标记/JSON | 视来源 | T2 | 轻量矢量动画 |

### ② Web 代码动效引擎 / 库 —— 运行时层
| 名称 | 形态 | 许可（待核实） | 梯队 | 备注 |
|------|------|----------------|------|------|
| GSAP | JS | 2025 起全部免费 | **T1** | 最强；Webflow 收购后含所有插件 |
| Framer Motion / Motion (motion.dev) | JS/React | MIT | **T1** | 声明式，React + vanilla |
| Motion One | JS | MIT | **T1** | WAAPI 封装，轻量 |
| Anime.js / React Spring / AutoAnimate | JS | MIT | T1 | 通用补间 / 物理 / 自动过渡 |
| Lenis · Locomotive · AOS · ScrollReveal | JS | MIT | T2 | 滚动驱动 |
| Splitting.js · SplitType · Typed.js | JS | MIT | T2 | 文字动效 |
| Animate.css · Animista · Hover.css · UIverse | CSS | MIT 等 | T2 | 纯 CSS 类/生成器 |

### ③ UI 动效组件库 —— 组件级，与"组件级编辑"最对口
| 名称 | 形态 | 许可（待核实） | 梯队 | 备注 |
|------|------|----------------|------|------|
| Aceternity UI | React+FM+Tailwind | 免费+Pro 混合 | **T1** | 注意区分免费/付费组件 |
| Magic UI | React+FM | MIT | **T1** | shadcn 风格动效组件 |
| Motion Primitives | React+FM | MIT | **T1** | 专做 Framer Motion 基元 |
| Animata | React/HTML | MIT | **T1** | 开源动效组件集合 |
| React Bits · Cult UI · Syntax UI | React | 多为 MIT | T2 | 社区动效组件 |

### ④ 程序化 / 代码视频模板 —— 代码即视频
| 名称 | 形态 | 许可（待核实） | 梯队 | 备注 |
|------|------|----------------|------|------|
| Remotion | React→视频 | **公司需商业许可**（个人/小团队免费） | **T2** | 许可有坑，务必先读条款 |
| Motion Canvas | TS→视频 | MIT | T2 | 程序化动画视频 |
| Revideo | TS→视频 | 基于 Motion Canvas | T3 | 关注即可 |

### ⑤ AI 视频生成 —— 多为闭源 SaaS（你提到的 HeyGen 在这）
| 名称 | 形态 | 许可 | 梯队 | 备注 |
|------|------|------|------|------|
| HeyGen | 数字人视频 | 闭源 SaaS | **T3** | "生成视频"≠"可复用动效配方" |
| Runway · Pika · 可灵 · Veo · Sora | AI 视频 | 闭源 SaaS | T3 | 同上，作为"导出/生成目标"而非配方 |

### ⑥ 设计工具内动效 —— 上游 / 导入源
| 名称 | 形态 | 许可 | 梯队 | 备注 |
|------|------|------|------|------|
| Figma (Smart Animate / Figma Motion) | 设计文件 | SaaS | T2 | 重要导入源；无 JSON 互通（我们的机会） |
| After Effects | 设计文件 | SaaS | T2 | Lottie 的源头 |
| Jitter · Cavalry · Spline(3D) | 设计文件 | SaaS/混合 | T3 | 关注 |

## 3. 三梯队总览

- **T1 必收**（能归一成 motion-JSON / 能导出为 skill）：代码型 web 动效（GSAP/Framer/Motion One/CSS）、Lottie、Rive、Theatre.js、UI 动效组件。
- **T2 桥接**（当作导入/导出目标，不是配方本身）：Remotion / Motion Canvas（视频）、Figma / AE（设计源）、滚动/文字类库。
- **T3 只索引、不纳入标准库**（放链接指针即可）：LottieFiles 海量站、HeyGen/Runway 等闭源 SaaS。

## 4. 归一化映射（来源 → 我们的 manifest）

每条收录项最终都要落成 `recipes/<surface>/<id>/recipe.motion.yaml` + motion-JSON：
- 代码型（GSAP/Framer/CSS）→ 直接抽成 recipe 的实现文件 + motion-JSON 参数。
- Lottie/Rive → 作为 `tech: lottie/rive` 的实现，motion-JSON 记录 timing/触发，文件本体作资产引用。
- 组件库 → 拆出"动效部分"归一化；UI 外壳不收。
- 视频（Remotion）→ 不进配方库，进"导出目标"（export-as-video 管线）。

## 5. 建库 schema 提案（⚠️ 待拍板，再落到 AGENTS.md）

不按单一树状分类，而是给每条 recipe 打**三层标签**：

```
检索层（agent 怎么找到它）   ：场景 canvas × 对象 target × 意图 intent
能力层（这条 recipe 能干什么）：runtime × 格式 format × 可导出 export × 可参数化 params
品味层（何时该用 / 不该用）   ：restraint × avoid_when            ← 差异化灵魂
元数据（溯源/合规，不作分类轴）：来源 source × 许可 license
```

- **场景 canvas**：web 页面 / slides / launch·release 视频 / app UI（首页 chips 已有）
- **对象 target**：标题·文字 / 按钮·CTA / 卡片 / 列表 / 图片·媒体 / 整页·区块 / 转场
- **意图 intent**：入场 / 强调 / 反馈·delight / 引导注意 / 过渡 / 加载 / 叙事节奏
- **能力**：runtime（css/js/framer/gsap/lottie/rive）、format（code/json/video）、export（skill/json/lottie/html/video）、params（可调的 duration/easing/distance/stagger…）
- **品味**：`restraint.max_per_view`、`avoid_when`

## 6. 下一步

1. **先对齐第 5 节的 schema**（这是"建库思路 + 分类思路"的核心，需要你拍板）。
2. 确认后：把三层标签写进 `AGENTS.md` 的 manifest schema，并升级现有 6 条 recipe 做样板。
3. 再从 **T1** 选 1–2 个来源（建议：代码型 web 动效 + Lottie）做归一化试点，验证 schema 跑得通。
4. 全程遵守原则 2/3：克制 + 许可证核实。
