# 语音输入组件 (Voice Input Component)

## 功能特性

- 🎤 语音转文字识别
- 📱 全屏语音输入界面
- 🌊 动态波形动画
- 📳 触觉反馈
- 🌐 网络状态检测
- ⚡ 实时录音时长显示
- 🎯 精确的触摸交互

## 使用方法

### 1. 在页面中引入组件

```json
{
  "usingComponents": {
    "voice-input": "/components/agent-ui/voice-input/index"
  }
}
```

### 2. 在WXML中使用

```xml
<voice-input 
  show="{{showVoiceInput}}"
  language="zh_CN"
  max-duration="{{30000}}"
  min-duration="{{500}}"
  enable-haptic="{{true}}"
  bind:close="onVoiceInputClose"
  bind:recordingStart="onRecordingStart"
  bind:recognitionComplete="onRecognitionComplete"
  bind:recordingError="onRecordingError"
/>
```

### 3. 在JS中处理事件

```javascript
Page({
  data: {
    showVoiceInput: false
  },

  // 显示语音输入
  showVoiceInput() {
    this.setData({ showVoiceInput: true });
  },

  // 关闭语音输入
  onVoiceInputClose() {
    this.setData({ showVoiceInput: false });
  },

  // 录音开始
  onRecordingStart() {
    console.log('录音开始');
  },

  // 识别完成
  onRecognitionComplete(e) {
    const { text, duration } = e.detail;
    console.log('识别结果:', text);
    console.log('录音时长:', duration);
    
    // 处理识别结果
    if (text) {
      // 发送消息或处理文本
      this.sendMessage(text);
    }
    
    // 关闭语音输入
    this.setData({ showVoiceInput: false });
  },

  // 录音错误
  onRecordingError(e) {
    const { code, message } = e.detail;
    console.error('录音错误:', code, message);
    
    // 显示错误提示
    wx.showToast({
      title: message,
      icon: 'none'
    });
  }
});
```

## 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| show | Boolean | false | 是否显示组件 |
| language | String | "zh_CN" | 录音语言设置 |
| maxDuration | Number | 30000 | 最大录音时长（毫秒） |
| minDuration | Number | 500 | 最小录音时长（毫秒） |
| enableHaptic | Boolean | true | 是否启用触觉反馈 |

### 支持的语言

- `zh_CN`: 中文（普通话）
- `en_US`: 英语
- `zh_HK`: 粤语
- `sichuanhua`: 四川话

## 组件事件

| 事件名 | 说明 | 事件对象 |
|--------|------|----------|
| close | 关闭组件 | - |
| recordingStart | 录音开始 | - |
| recognitionComplete | 识别完成 | `{text: string, duration: number}` |
| recordingError | 录音错误 | `{code: number, message: string}` |

## 交互说明

### 录音操作
1. **开始录音**: 长按"按住说话"按钮
2. **结束录音**: 松开"按住说话"按钮
3. **取消录音**: 
   - 点击"取消"按钮
   - 录音时手指移动到"取消"按钮区域

### 触觉反馈
- **开始录音**: 轻微震动
- **识别成功**: 轻微震动
- **录音时间太短**: 轻震动
- **取消操作**: 中等震动
- **识别错误**: 重震动

### 错误处理
组件会自动处理以下错误情况：
- 网络连接异常
- 录音权限不足
- 识别服务异常
- 录音时间过短

## 注意事项

1. **插件配置**: 确保在 `app.json` 中正确配置了微信同声传译插件
2. **网络要求**: 语音识别需要网络连接
3. **权限要求**: 需要录音权限
4. **性能优化**: 组件会自动清理计时器，避免内存泄漏

## 样式自定义

组件使用固定样式，如需自定义，可以修改 `index.wxss` 文件中的样式定义。

## 更新日志

- v1.0.0: 初始版本，支持基础语音识别功能
- v1.1.0: 添加触觉反馈和错误处理
- v1.2.0: 优化交互体验和性能
