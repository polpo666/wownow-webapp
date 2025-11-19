<template>
  <van-popup
    v-model:show="showModal"
    position="bottom"
    :close-on-click-overlay="true"
    :style="{ background: 'transparent' }"
    :z-index="99999"
    @close="onClose"
  >
    <div class="login-modal">
      <!-- 顶部装饰图 -->
      <div class="login-header">
        <img src="@/assets/bg-login.png" alt="bg" class="header-bg" />
        <div class="header-content">
          <div class="login-title">开启你的AI创作之旅</div>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="login-content">
        <div class="login-desc">
          欢迎加入WOWNOW，我们为创作者提供智能工具，释放你的无限灵感，轻松开启创意旅程
        </div>

        <!-- 微信登录二维码显示 -->
        <div v-if="showQRCode" class="qrcode-section">
          <div class="qrcode-container">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="微信登录二维码" class="qrcode-image" />
          </div>
          <van-button type="primary" block class="qrcode-button" @click="handleSaveQRCode">
            长按二维码保存到微信扫码绑定
          </van-button>
          <button type="button" class="back-button" @click="cancelPoll">返回其他登录方式</button>
        </div>

        <!-- 非二维码状态下显示的内容 -->
        <template v-else>
          <!-- 手机号登录 -->
          <template v-if="authMode === 'phone'">
            <!-- 手机号输入框 -->
            <div class="input-wrapper">
              <div class="phone-input">
                <span class="phone-prefix">+86</span>
                <div class="divider" />
                <van-field
                  v-model="phoneNumber"
                  type="tel"
                  placeholder="请输入手机号"
                  :maxlength="11"
                  class="phone-field"
                />
              </div>
            </div>

            <!-- 验证码输入框 -->
            <div class="input-wrapper">
              <div class="code-input">
                <van-field
                  v-model="verificationCode"
                  type="text"
                  placeholder="请输入验证码"
                  :maxlength="6"
                  class="code-field"
                />
                <button
                  type="button"
                  class="code-button"
                  :disabled="isSendingCode || countdown > 0"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </button>
              </div>
            </div>
          </template>

          <!-- 邮箱密码登录 -->
          <template v-if="authMode === 'password'">
            <div class="label-text">邮箱</div>
            <div class="input-wrapper">
              <van-field
                v-model="email"
                type="email"
                placeholder="请输入邮箱"
                class="custom-field"
              />
            </div>

            <div class="label-text">输入密码</div>
            <div class="input-wrapper">
              <van-field
                v-model="password"
                type="password"
                placeholder="请输入密码"
                class="custom-field"
              />
            </div>
          </template>

          <!-- 注册 -->
          <template v-if="authMode === 'register'">
            <div class="label-text">邮箱</div>
            <div class="input-wrapper">
              <van-field
                v-model="email"
                type="email"
                placeholder="请输入邮箱"
                class="custom-field"
              />
            </div>

            <div class="label-text">设置密码</div>
            <div class="input-wrapper">
              <van-field
                v-model="password"
                type="password"
                placeholder="请输入密码"
                class="custom-field"
              />
            </div>

            <div class="label-text">再次输入密码</div>
            <div class="input-wrapper">
              <van-field
                v-model="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                class="custom-field"
              />
            </div>
          </template>

          <!-- 切换登录方式 -->
          <div class="switch-mode">
            <template v-if="authMode === 'password'">
              <button type="button" class="switch-button" @click="setAuthMode('phone')">
                验证码登录
              </button>
            </template>
            <template v-if="authMode === 'register'">
              <button type="button" class="switch-button" @click="setAuthMode('password')">
                已有账号，去登录
              </button>
            </template>
          </div>

          <!-- 登录/注册按钮 -->
          <van-button
            type="primary"
            block
            :disabled="!isButtonEnabled"
            :class="{ 'disabled-button': !isButtonEnabled }"
            class="submit-button"
            @click="handleAuth"
          >
            {{ getButtonText }}
          </van-button>

          <!-- 用户协议提示文字 -->
          <div class="agreement-text">
            登录即代表您已阅读并同意
            <span class="agreement-link" @click="onClickUserAgreement">《用户协议》</span>与
            <span class="agreement-link" @click="onClickPrivacyPolicy">《隐私政策》</span>
          </div>
        </template>
      </div>

      <!-- 关闭按钮 -->
      <!-- <div class="close-button" @click="onClose">
        <van-icon name="cross" />
      </div> -->
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  smsLogin,
  sendSMSCode,
  getWeChatQRCode,
  getWeChatLoginStatus,
  getUserInfo,
  wechatLogin,
} from '@/api/auth'
import type { SMSLoginRequest } from '@/api/auth'
import { showLoadingToast, closeToast, showFailToast, showSuccessToast } from 'vant'

type AuthMode = 'phone' | 'password' | 'register' | 'wechat'

const router = useRouter()
const authStore = useAuthStore()

const authMode = ref<AuthMode>('phone')
const phoneNumber = ref('')
const verificationCode = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const countdown = ref(0)
const showQRCode = ref(false)
const qrCodeUrl = ref('')
const isSendingCode = ref(false)
const pollIntervalRef = ref<number | null>(null)

const showModal = computed({
  get: () => authStore.showLoginModal,
  set: (value) => authStore.setShowLoginModal(value),
})

// 监听 showModal 变化，重置状态
watch(showModal, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  authMode.value = 'phone'
  phoneNumber.value = ''
  verificationCode.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  countdown.value = 0
  showQRCode.value = false
  qrCodeUrl.value = ''
  isSendingCode.value = false
  cancelPoll()
}

// 设置登录模式
const setAuthMode = (mode: AuthMode) => {
  authMode.value = mode
  // 清空表单
  phoneNumber.value = ''
  verificationCode.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

// 按钮是否启用
const isButtonEnabled = computed(() => {
  if (authMode.value === 'phone') {
    return phoneNumber.value.length === 11 && verificationCode.value.length >= 6
  } else if (authMode.value === 'password') {
    return email.value.trim() !== '' && password.value.trim() !== ''
  } else if (authMode.value === 'register') {
    return (
      email.value.trim() !== '' &&
      password.value.trim() !== '' &&
      confirmPassword.value.trim() !== ''
    )
  }
  return false
})

// 按钮文字
const getButtonText = computed(() => {
  if (authMode.value === 'register') return '注册'
  return '登录'
})

// 发送验证码
const handleSendCode = async () => {
  if (!phoneNumber.value || phoneNumber.value.length !== 11) {
    showFailToast('请输入正确的手机号')
    return
  }

  if (isSendingCode.value || countdown.value > 0) {
    return
  }

  isSendingCode.value = true

  try {
    const res = await sendSMSCode(phoneNumber.value, 'login')
    console.log('res: ', res)
    if (res.code === 0 && res.data?.success) {
      countdown.value = 60
      showSuccessToast('验证码发送成功')

      // 开始倒计时
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      showFailToast('验证码发送失败')
    }
  } catch (error) {
    console.error('Send SMS error:', error)
    showFailToast('发送验证码失败')
  } finally {
    isSendingCode.value = false
  }
}

// 手机号验证码登录
const handleSMSLogin = async () => {
  if (!phoneNumber.value || !verificationCode.value) {
    showFailToast('请输入手机号和验证码')
    return
  }

  showLoadingToast({
    message: '登录中...',
    forbidClick: true,
  })

  try {
    const loginData: SMSLoginRequest = {
      phone: phoneNumber.value,
      code: verificationCode.value,
    }
    const res = await smsLogin(loginData)

    if (res.code === 0 && res.data) {
      const { token, user } = res.data

      const userInfo = {
        id: user.id,
        nickname: user.nickname || '微信用户',
        avatar: user.avatar || '',
        phone: user.phone || '',
      }

      authStore.login({
        user: userInfo,
        token: token,
        expiresIn: 7200, // 默认 2 小时
      })

      closeToast()
      showSuccessToast('登录成功')

      // 获取是否绑定微信
      const userRes = await getUserInfo()
      if (userRes.code === 0) {
        const userId = userRes.data?.id
        if (userId) {
          await getWeChatQRCode(userId.toString())
        }
      }

      onSuccess()
    } else {
      closeToast()
      if (res.message?.includes('尚未注册')) {
        showFailToast('该手机号尚未注册，请先注册')
      } else {
        showFailToast(res.message || '登录失败，请检查验证码')
      }
    }
  } catch (error) {
    closeToast()
    const errorMessage = error instanceof Error ? error.message : '登录失败'
    showFailToast(errorMessage)
    console.error('SMS login error:', error)
  }
}

// 邮箱密码登录（暂未实现）
const handlePasswordLogin = async () => {
  showFailToast('邮箱密码登录功能暂未开放')
}

// 注册（暂未实现）
const handleRegister = async () => {
  showFailToast('注册功能暂未开放')
}

// 微信登录
const handleWechatLogin = async () => {
  try {
    const res = await getWeChatQRCode()
    const qrcodeUrl = res.data?.qrcode_url
    const sceneStr = res.data?.scene_str || ''

    if (qrcodeUrl) {
      qrCodeUrl.value = qrcodeUrl
      showQRCode.value = true

      // 先清理之前的轮询
      cancelPoll()

      // 开始轮询检查扫码状态
      pollIntervalRef.value = window.setInterval(async () => {
        try {
          const stateRes = await getWeChatLoginStatus(sceneStr)
          const state = stateRes.data?.state
          const token = stateRes.data?.token
          const userInfo = stateRes.data?.userInfo

          if (state === 2 && userInfo && token) {
            cancelPoll()

            // 使用 wechatLogin API 完成登录
            try {
              const loginRes = await wechatLogin(token, JSON.stringify(userInfo))

              if (loginRes.code === 0 && loginRes.data) {
                const { token: finalToken, user: finalUser } = loginRes.data

                const userInfoData = {
                  id: finalUser.id,
                  nickname: finalUser.nickname || '微信用户',
                  avatar: finalUser.avatar || '',
                  phone: finalUser.phone || '',
                }

                authStore.login({
                  user: userInfoData,
                  token: finalToken,
                  expiresIn: 7200,
                })

                if (finalUser.phone) {
                  showSuccessToast('微信登录成功')
                  onSuccess()
                } else {
                  // 需要绑定手机号
                  showFailToast('请先绑定手机号')
                }
              } else {
                showFailToast('微信登录失败')
              }
            } catch (error) {
              console.error('Wechat login error:', error)
              showFailToast('微信登录失败')
            }
          } else if (state === 3) {
            cancelPoll()
            showFailToast('二维码已过期，请重新获取')
          }
        } catch (error) {
          console.error('Poll status error:', error)
        }
      }, 2000)

      // 5分钟后停止轮询
      setTimeout(() => {
        cancelPoll()
      }, 300000)
    } else {
      showFailToast('获取二维码失败')
    }
  } catch (error) {
    console.error('Wechat login error:', error)
    showFailToast('微信登录失败')
  }
}

// 取消轮询
const cancelPoll = () => {
  if (pollIntervalRef.value !== null) {
    clearInterval(pollIntervalRef.value)
    pollIntervalRef.value = null
    showQRCode.value = false
  }
}

// 保存二维码
const handleSaveQRCode = () => {
  // 在 Web 环境中，可以提示用户右键保存
  showSuccessToast('请右键保存二维码')
}

// 处理登录/注册
const handleAuth = () => {
  if (authMode.value === 'phone') {
    handleSMSLogin()
  } else if (authMode.value === 'password') {
    handlePasswordLogin()
  } else if (authMode.value === 'register') {
    handleRegister()
  } else if (authMode.value === 'wechat') {
    handleWechatLogin()
  }
}

const onClose = () => {
  authStore.setShowLoginModal(false)
  resetForm()
}

const onSuccess = () => {
  authStore.setShowLoginModal(false)
  resetForm()
}

const onClickUserAgreement = () => {
  router.push('/agreement/user')
}

const onClickPrivacyPolicy = () => {
  router.push('/agreement/privacy')
}

// 组件卸载时清理
onUnmounted(() => {
  cancelPoll()
})
</script>

<style scoped>
.login-modal {
  position: relative;
  border-radius: 16px 16px 0 0;
  margin: 0 16px;
  margin-top: 40px;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

/* 顶部装饰图 */
.login-header {
  width: 100%;
  height: 80px;
  position: relative;
  overflow: hidden;
}

.header-bg {
  width: 100%;
  height: 80px;
  object-fit: cover;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
  padding: 40px 12px 0;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  text-align: left;
}

/* 主体内容 */
.login-content {
  background: #fefbee;
  border-radius: 0 0 16px 16px;
  padding: 12px;
  padding-bottom: 40px;
  margin-bottom: 32px;
}

.login-desc {
  font-size: 14px;
  color: #000;
  text-align: left;
  margin-bottom: 16px;
  padding-top: 8px;
}

/* 二维码区域 */
.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.qrcode-container {
  width: 256px;
  height: 256px;
  background: #fff;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.qrcode-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qrcode-button {
  width: 100%;
  height: 48px;
  background: #000;
  color: #fff;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 500;
}

.back-button {
  background: transparent;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
}

/* 输入框样式 */
.input-wrapper {
  margin-bottom: 16px;
}

.label-text {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  margin-bottom: 8px;
}

.phone-input {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  border: 2px solid #000;
  overflow: hidden;
  height: 56px;
}

.phone-prefix {
  padding: 0 16px;
  color: #374151;
  font-size: 16px;
}

.divider {
  width: 1px;
  height: 24px;
  background: #d1d5db;
  margin: 0 8px;
}

.phone-field {
  flex: 1;
  padding: 0;
}

.code-input {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  border: 2px solid #000;
  overflow: hidden;
  height: 56px;
}

.code-field {
  flex: 1;
  padding: 0 16px;
}

.code-button {
  height: 100%;
  padding: 0 16px;
  background: transparent;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.code-button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.custom-field {
  background: #fff;
  border-radius: 16px;
  border: 2px solid #000;
  height: 56px;
  padding: 0 16px;
}

/* 切换登录方式 */
.switch-mode {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.switch-button {
  background: transparent;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-left: auto;
}

.switch-button:hover {
  color: #000;
}

/* 提交按钮 */
.submit-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  margin-top: 32px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.submit-button:not(.disabled-button) {
  background: #facc15;
  color: #000;
  border: none;
}

.submit-button.disabled-button {
  background: #e5e7eb;
  color: #9ca3af;
  border: none;
}

/* 协议提示 */
.agreement-text {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding-top: 12px;
}

.agreement-link {
  color: #e09c14;
  cursor: pointer;
  margin: 0 2px;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* 关闭按钮 */
.close-button {
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.3s;
}

.close-button:active {
  opacity: 0.8;
}

:deep(.van-popup) {
  background: transparent;
}

:deep(.van-field__control) {
  font-size: 16px;
  color: #000;
}

:deep(.van-field__placeholder) {
  color: #9ca3af;
}
</style>
