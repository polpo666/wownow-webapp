import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getToken,
  setToken,
  getUserInfo,
  setUserInfo,
  getLoggedIn,
  setLoggedIn,
  clearAuth,
} from '@/utils/storage'

export interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone?: string
  // 添加其他用户信息字段
}

export const useAuthStore = defineStore('auth', () => {
  // 从 localStorage 恢复初始状态
  const storedToken = getToken()
  const storedUserInfo = getUserInfo()
  const storedIsLoggedIn = getLoggedIn()

  const isLoggedIn = ref(storedIsLoggedIn)
  const user = ref<UserInfo | null>(storedUserInfo)
  const showLoginModal = ref(false)
  const token = ref<string | null>(storedToken)

  function login(payload: { user: UserInfo; token: string; expiresIn?: number }) {
    isLoggedIn.value = true
    user.value = payload.user
    token.value = payload.token

    // 保存到 localStorage
    setToken(payload.token)
    setUserInfo({
      id: payload.user.id,
      nickname: payload.user.nickname,
      avatar: payload.user.avatar,
      phone: payload.user.phone,
    })
    setLoggedIn(true)
  }

  function logout() {
    isLoggedIn.value = false
    user.value = null
    token.value = null

    // 清除 localStorage
    clearAuth()
  }

  function updateUserInfo(userInfo: Partial<UserInfo>) {
    if (user.value) {
      user.value = { ...user.value, ...userInfo }
      // 同步更新 localStorage
      setUserInfo({
        id: user.value.id,
        nickname: user.value.nickname,
        avatar: user.value.avatar,
        phone: user.value.phone,
      })
    }
  }

  function setShowLoginModal(show: boolean) {
    showLoginModal.value = show
  }

  return {
    isLoggedIn,
    user,
    showLoginModal,
    token,
    login,
    logout,
    updateUserInfo,
    setShowLoginModal,
  }
})
