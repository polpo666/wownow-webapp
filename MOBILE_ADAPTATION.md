# 移动端适配方案说明

## 📱 方案概述

本项目采用 **postcss-pxtorem + flexible.ts + viewport** 的移动端适配方案，能够实现在不同屏幕尺寸的移动设备上的完美适配。

## 🛠️ 技术方案

### 1. 核心依赖

- **postcss-pxtorem**: 自动将 CSS 中的 `px` 单位转换为 `rem`
- **autoprefixer**: 自动添加 CSS 浏览器前缀
- **flexible.ts**: 动态设置根元素字体大小

### 2. 设计规范

- **设计稿基准**: 375px（iPhone 6/7/8标准宽度）
- **根字体大小**: 37.5px（设计稿宽度的 1/10）
- **转换比例**: 1rem = 37.5px（在375px宽度屏幕上）

### 3. 工作原理

```
设计稿尺寸 (375px)
    ↓
flexible.ts 动态设置 html 的 font-size
    ↓
postcss-pxtorem 自动将 CSS 中的 px 转换为 rem
    ↓
浏览器根据当前屏幕宽度计算最终显示尺寸
```

## 📝 使用说明

### 基本用法

在开发时，直接按照设计稿的 px 值编写样式，无需手动计算 rem：

```vue
<template>
  <div class="container">
    <h1>标题</h1>
    <p>内容</p>
  </div>
</template>

<style scoped>
.container {
  width: 375px; /* 会自动转换为 10rem */
  padding: 20px; /* 会自动转换为 0.53333rem */
  background: #fff;
}

h1 {
  font-size: 32px; /* 会自动转换为 0.85333rem */
  margin-bottom: 16px; /* 会自动转换为 0.42667rem */
}

p {
  font-size: 14px; /* 会自动转换为 0.37333rem */
  line-height: 1.5;
}
</style>
```

### 禁用转换

如果某些元素不希望被转换，可以使用 `.no-rem` 类名：

```vue
<style scoped>
/* 不会被转换为rem */
.no-rem {
  width: 100px;
  height: 100px;
}
</style>
```

或者使用大写的 `PX` 单位（不推荐，postcss-pxtorem默认配置）：

```css
.element {
  border: 1px solid #000; /* 大写PX不会被转换 */
}
```

### 内联样式

注意：内联样式中的 px 不会被自动转换，建议使用 class 或 style 标签：

```vue
<!-- ❌ 不推荐：内联样式不会被转换 -->
<div style="width: 100px; height: 100px;"></div>

<!-- ✅ 推荐：使用class -->
<div class="box"></div>

<style scoped>
.box {
  width: 100px; /* 会被自动转换 */
  height: 100px;
}
</style>
```

## ⚙️ 配置说明

### PostCSS 配置 (`postcss.config.js`)

```javascript
{
  'postcss-pxtorem': {
    rootValue: 37.5,              // 根字体大小（设计稿宽度 / 10）
    propList: ['*'],              // 需要转换的属性，* 表示所有
    unitPrecision: 5,             // 转换后保留的小数位数
    selectorBlackList: ['.no-rem'], // 不转换的类名
    minPixelValue: 2,             // 小于2px的不转换
    exclude: /node_modules/i      // 排除 node_modules
  }
}
```

### Flexible 配置 (`src/utils/flexible.ts`)

```typescript
const DESIGN_WIDTH = 375 // 设计稿宽度
const BASE_FONT_SIZE = 37.5 // 基准字体大小
```

### Viewport 配置 (`index.html`)

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
/>
```

## 🎨 设计稿转换示例

| 设计稿尺寸 | CSS代码         | 转换后     | 实际显示（375px屏幕） |
| ---------- | --------------- | ---------- | --------------------- |
| 375px      | width: 375px    | 10rem      | 375px                 |
| 200px      | width: 200px    | 5.33333rem | 200px                 |
| 100px      | width: 100px    | 2.66667rem | 100px                 |
| 50px       | padding: 50px   | 1.33333rem | 50px                  |
| 32px       | font-size: 32px | 0.85333rem | 32px                  |
| 16px       | margin: 16px    | 0.42667rem | 16px                  |

## 📱 适配效果

在不同屏幕宽度下的适配效果：

| 设备          | 屏幕宽度 | html font-size | 1rem实际大小 |
| ------------- | -------- | -------------- | ------------ |
| iPhone SE     | 320px    | 32px           | 32px         |
| iPhone 6/7/8  | 375px    | 37.5px         | 37.5px       |
| iPhone Plus   | 414px    | 41.4px         | 41.4px       |
| iPhone 12 Pro | 390px    | 39px           | 39px         |
| iPad          | 768px    | 75px (限制2倍) | 75px         |

## 🔧 开发调试

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（支持局域网访问）
pnpm dev

# 访问地址
# 本地：http://localhost:5173
# 局域网：http://[你的IP]:5173
```

### 移动端调试

1. 确保手机和电脑在同一局域网内
2. 启动开发服务器：`pnpm dev`
3. 查看终端输出的局域网地址（如：http://192.168.1.100:5173）
4. 在手机浏览器中访问该地址

### Chrome DevTools 调试

1. 打开 Chrome 浏览器开发者工具（F12）
2. 点击 Toggle Device Toolbar（Ctrl/Cmd + Shift + M）
3. 选择不同的设备进行预览和调试

## 💡 最佳实践

### 1. 字体大小建议

```css
/* ✅ 推荐：常用字体大小 */
.text-xs {
  font-size: 12px;
} /* 小号文字 */
.text-sm {
  font-size: 14px;
} /* 正文 */
.text-base {
  font-size: 16px;
} /* 基础 */
.text-lg {
  font-size: 18px;
} /* 大号 */
.text-xl {
  font-size: 20px;
} /* 特大 */
.text-2xl {
  font-size: 24px;
} /* 标题 */
.text-3xl {
  font-size: 32px;
} /* 大标题 */
```

### 2. 间距规范

```css
/* ✅ 推荐：统一的间距体系 */
.p-4 {
  padding: 4px;
}
.p-8 {
  padding: 8px;
}
.p-12 {
  padding: 12px;
}
.p-16 {
  padding: 16px;
}
.p-20 {
  padding: 20px;
}
.p-24 {
  padding: 24px;
}
.p-32 {
  padding: 32px;
}
```

### 3. 1px 边框问题

在高清屏（Retina）上，1px 的边框可能显得过粗。解决方案：

```css
/* 方案1：使用 transform scale */
.border-1px {
  position: relative;
}

.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  transform: scaleY(0.5);
}

/* 方案2：直接使用1px（设置minPixelValue为2，1px不会被转换） */
.border {
  border-bottom: 1px solid #e5e5e5;
}
```

### 4. 安全区域适配（iPhone X 等刘海屏）

```css
/* 适配顶部安全区域 */
.header {
  padding-top: env(safe-area-inset-top);
}

/* 适配底部安全区域 */
.footer {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 5. 横屏适配

```css
/* 横屏时的特殊处理 */
@media screen and (orientation: landscape) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}
```

## ⚠️ 注意事项

1. **第三方组件库**: 如使用 Vant、Element Plus 等组件库，它们通常已经做了移动端适配，可能与本方案冲突，需要在 `postcss.config.js` 中排除
2. **小于2px的值**: 默认配置下，小于2px的值不会被转换，这是为了避免1px边框被转换

3. **图片资源**: 建议使用 @2x、@3x 高清图片，或使用 SVG 矢量图

4. **性能优化**: flexible.ts 监听了 resize 和 pageshow 事件，在性能敏感的场景可以考虑使用防抖

5. **单位统一**: 团队开发时，建议统一使用 px 单位，由工具自动转换，不要混用 rem

## 🔍 常见问题

### Q1: 为什么我的样式没有被转换？

A: 检查以下几点：

- 是否在 `node_modules` 中（会被排除）
- 是否使用了 `.no-rem` 类名
- 是否是内联样式（不会被转换）
- 值是否小于2px（会被排除）

### Q2: 如何适配超大屏幕（iPad、PC）？

A: flexible.ts 中已经限制了最大缩放比例为2倍，避免在大屏上字体过大。如需更精细的控制：

```typescript
// 在 flexible.ts 中修改
const scale = Math.min(clientWidth / DESIGN_WIDTH, 2) // 改为你需要的倍数
```

### Q3: 能否修改设计稿基准宽度？

A: 可以，需要同时修改两处：

1. `postcss.config.js` 中的 `rootValue`
2. `src/utils/flexible.ts` 中的 `DESIGN_WIDTH` 和 `BASE_FONT_SIZE`

例如，改为750px设计稿：

```javascript
// postcss.config.js
rootValue: 75 // 750 / 10

// flexible.ts
const DESIGN_WIDTH = 750
const BASE_FONT_SIZE = 75
```

## 📚 参考资料

- [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)
- [flexible.js](https://github.com/amfe/lib-flexible)
- [移动端适配方案对比](https://juejin.cn/post/6844903951012200456)
- [Viewport单位适配方案](https://www.w3cplus.com/css/vw-for-layout.html)

## 📄 License

MIT
