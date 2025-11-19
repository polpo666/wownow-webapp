<script setup lang="ts">
import { ref } from 'vue'
import { showToast, showDialog, showNotify } from 'vant'

// 按钮演示
const handleButtonClick = (type: string) => {
  showToast(`点击了${type}按钮`)
}

// 对话框演示
const showDialogDemo = () => {
  showDialog({
    title: '标题',
    message: '这是一个对话框示例',
  })
}

// 通知演示
const showNotifyDemo = () => {
  showNotify({
    type: 'success',
    message: '通知内容',
  })
}

// 表单数据
const username = ref('')
const password = ref('')
const checked = ref(false)
const radio = ref('1')
const rate = ref(3)
const slider = ref(50)
const stepper = ref(1)

// Switch 状态
const switchChecked = ref(true)

// 选择器
const showPicker = ref(false)
const selectedValue = ref('')
const columns = ['杭州', '宁波', '温州', '绍兴', '湖州', '嘉兴', '金华']

const onConfirm = (value: string) => {
  selectedValue.value = value
  showPicker.value = false
  showToast(`选择了: ${value}`)
}

// Tab 标签
const active = ref(0)

// 折叠面板
const activeNames = ref(['1'])

// 步骤条
const stepActive = ref(1)
</script>

<template>
  <div class="vant-demo">
    <!-- 顶部导航 -->
    <van-nav-bar title="Vant 组件示例" left-text="返回" left-arrow fixed />

    <div class="demo-content">
      <!-- 基础组件 -->
      <van-cell-group title="基础组件" inset>
        <van-cell title="单元格" value="内容" />
        <van-cell title="带图标" icon="location-o" value="内容" />
        <van-cell title="可点击" is-link @click="showToast('点击了单元格')" />
      </van-cell-group>

      <!-- 按钮组件 -->
      <van-cell-group title="按钮组件" inset>
        <van-cell>
          <div class="button-group">
            <van-button type="primary" @click="handleButtonClick('主要')">主要按钮</van-button>
            <van-button type="success" @click="handleButtonClick('成功')">成功按钮</van-button>
            <van-button type="warning" @click="handleButtonClick('警告')">警告按钮</van-button>
            <van-button type="danger" @click="handleButtonClick('危险')">危险按钮</van-button>
          </div>
        </van-cell>
        <van-cell>
          <div class="button-group">
            <van-button plain type="primary">朴素按钮</van-button>
            <van-button round type="primary">圆角按钮</van-button>
            <van-button icon="plus" type="primary">图标按钮</van-button>
          </div>
        </van-cell>
      </van-cell-group>

      <!-- 表单组件 -->
      <van-cell-group title="表单组件" inset>
        <van-field v-model="username" label="用户名" placeholder="请输入用户名" />
        <van-field v-model="password" type="password" label="密码" placeholder="请输入密码" />
        <van-cell title="复选框">
          <template #right-icon>
            <van-checkbox v-model="checked">复选框</van-checkbox>
          </template>
        </van-cell>
        <van-cell title="单选框">
          <template #right-icon>
            <van-radio-group v-model="radio" direction="horizontal">
              <van-radio name="1">选项1</van-radio>
              <van-radio name="2">选项2</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
        <van-cell title="开关">
          <template #right-icon>
            <van-switch v-model="switchChecked" />
          </template>
        </van-cell>
        <van-cell title="评分">
          <template #right-icon>
            <van-rate v-model="rate" />
          </template>
        </van-cell>
        <van-cell title="步进器">
          <template #right-icon>
            <van-stepper v-model="stepper" />
          </template>
        </van-cell>
        <van-cell title="滑块">
          <van-slider v-model="slider" />
        </van-cell>
      </van-cell-group>

      <!-- 反馈组件 -->
      <van-cell-group title="反馈组件" inset>
        <van-cell title="轻提示" is-link @click="showToast('这是一个轻提示')" />
        <van-cell title="对话框" is-link @click="showDialogDemo" />
        <van-cell title="通知" is-link @click="showNotifyDemo" />
        <van-cell title="选择器" is-link @click="showPicker = true">
          <template #value>
            {{ selectedValue || '请选择' }}
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 标签页 -->
      <van-cell-group title="标签页组件" inset>
        <van-tabs v-model:active="active">
          <van-tab title="标签1">
            <div class="tab-content">标签页1的内容</div>
          </van-tab>
          <van-tab title="标签2">
            <div class="tab-content">标签页2的内容</div>
          </van-tab>
          <van-tab title="标签3">
            <div class="tab-content">标签页3的内容</div>
          </van-tab>
        </van-tabs>
      </van-cell-group>

      <!-- 折叠面板 -->
      <van-cell-group title="折叠面板" inset>
        <van-collapse v-model="activeNames">
          <van-collapse-item title="标题1" name="1">
            这是第一个面板的内容，可以放置任意元素。
          </van-collapse-item>
          <van-collapse-item title="标题2" name="2">
            这是第二个面板的内容，点击标题可以展开或收起。
          </van-collapse-item>
          <van-collapse-item title="标题3" name="3">
            Vant 组件使用起来非常简单方便。
          </van-collapse-item>
        </van-collapse>
      </van-cell-group>

      <!-- 步骤条 -->
      <van-cell-group title="步骤条" inset>
        <div class="steps-wrapper">
          <van-steps :active="stepActive">
            <van-step>买家下单</van-step>
            <van-step>商家接单</van-step>
            <van-step>买家提货</van-step>
            <van-step>交易完成</van-step>
          </van-steps>
          <div class="steps-buttons">
            <van-button size="small" @click="stepActive = Math.max(0, stepActive - 1)">
              上一步
            </van-button>
            <van-button size="small" type="primary" @click="stepActive = Math.min(3, stepActive + 1)">
              下一步
            </van-button>
          </div>
        </div>
      </van-cell-group>

      <!-- 徽标 -->
      <van-cell-group title="徽标组件" inset>
        <van-cell>
          <div class="badge-group">
            <van-badge :content="5">
              <div class="badge-item">徽标</div>
            </van-badge>
            <van-badge dot>
              <div class="badge-item">小红点</div>
            </van-badge>
            <van-badge content="NEW">
              <div class="badge-item">文字</div>
            </van-badge>
          </div>
        </van-cell>
      </van-cell-group>

      <!-- 标签 -->
      <van-cell-group title="标签组件" inset>
        <van-cell>
          <div class="tag-group">
            <van-tag type="primary">主要标签</van-tag>
            <van-tag type="success">成功标签</van-tag>
            <van-tag type="warning">警告标签</van-tag>
            <van-tag type="danger">危险标签</van-tag>
          </div>
        </van-cell>
        <van-cell>
          <div class="tag-group">
            <van-tag plain type="primary">朴素标签</van-tag>
            <van-tag round type="success">圆角标签</van-tag>
            <van-tag mark type="warning">标记标签</van-tag>
            <van-tag closeable type="danger">可关闭</van-tag>
          </div>
        </van-cell>
      </van-cell-group>

      <!-- 图片 -->
      <van-cell-group title="图片组件" inset>
        <van-cell>
          <div class="image-group">
            <van-image
              width="100"
              height="100"
              src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
            />
            <van-image
              width="100"
              height="100"
              fit="contain"
              src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
            />
            <van-image
              width="100"
              height="100"
              round
              src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
            />
          </div>
        </van-cell>
      </van-cell-group>

      <!-- 加载中 -->
      <van-cell-group title="加载组件" inset>
        <van-cell>
          <div class="loading-group">
            <van-loading size="24px">加载中...</van-loading>
            <van-loading type="spinner" size="24px" />
            <van-loading type="spinner" size="24px" color="#1989fa" />
          </div>
        </van-cell>
      </van-cell-group>

      <!-- 空状态 -->
      <van-cell-group title="空状态" inset>
        <van-empty description="暂无数据" />
      </van-cell-group>

      <!-- 底部占位 -->
      <div class="bottom-placeholder"></div>
    </div>

    <!-- 选择器弹出层 -->
    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker :columns="columns" @confirm="onConfirm" @cancel="showPicker = false" />
    </van-popup>
  </div>
</template>

<style scoped>
.vant-demo {
  min-height: 100vh;
  background: #f7f8fa;
  padding-top: 46px;
}

.demo-content {
  padding: 16px 0;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.tab-content {
  padding: 20px;
  text-align: center;
  color: #666;
}

.steps-wrapper {
  padding: 20px;
}

.steps-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.badge-group {
  display: flex;
  gap: 24px;
  width: 100%;
}

.badge-item {
  width: 60px;
  height: 60px;
  background: #f2f3f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.image-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.loading-group {
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.bottom-placeholder {
  height: 20px;
}
</style>

