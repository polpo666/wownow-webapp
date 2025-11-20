# wownow-webapp

一个基于 Vue 3 + Vite + TypeScript 的现代化 Web 应用，内置移动端适配方案。

## ✨ 特性

- ⚡️ Vue 3 + Vite - 快速的开发体验
- 🎯 TypeScript - 类型安全
- 📱 移动端适配 - postcss-pxtorem + flexible 方案
- 🎨 现代化 UI - 渐变配色、圆角设计
- 🔥 热更新 - 开发时即时预览
- 📦 优化打包 - 生产环境代码优化

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## 📱 移动端适配

本项目采用 **postcss-pxtorem + flexible** 的移动端适配方案：

- 设计稿基准：375px
- 自动 px 转 rem
- 支持多种屏幕尺寸
- 完美适配 iPhone、Android 设备

详细说明请查看 [移动端适配文档](./MOBILE_ADAPTATION.md)

### 快速开始

开发时直接使用 px 单位，无需手动计算：

```vue
<style scoped>
.container {
  width: 375px; /* 自动转换为 10rem */
  padding: 20px; /* 自动转换为 0.53333rem */
}
</style>
```

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

开发服务器会自动在 `http://localhost:5173` 启动，并支持局域网访问（方便移动端调试）。

### 移动端调试

1. 确保手机和电脑在同一局域网
2. 启动开发服务器：`pnpm dev`
3. 在手机浏览器中访问终端显示的局域网地址

或使用 Chrome DevTools 的设备模拟器（Ctrl/Cmd + Shift + M）

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
