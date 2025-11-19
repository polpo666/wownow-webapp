<template>
  <div class="agreement-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <!-- 导航栏 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" size="20" color="#fff" @click="goBack" />
      <span class="nav-title">隐私协议</span>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 协议内容 -->
    <div class="agreement-content">
      <p class="agreement-text">{{ agreement }}</p>
      <img src="@/assets/agreement/privacy-agree.png" alt="privacy" class="agreement-image" />
      <p class="agreement-text">{{ agreement2 }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const agreement = `广州轻变量信息科技有限公司
版本生效日期：2025年9月9日
导言

广州轻变量信息科技有限公司（以下简称"我们"或"本平台"）深知个人信息对您的重要性。我们致力于保护您的个人信息安全。本隐私政策旨在向您说明，当您使用我们的服务时，我们如何收集、使用、存储、共享、转让、公开披露您的个人信息，以及我们为您提供管理个人信息的方式。

一、我们如何收集和使用您的个人信息

我们严格遵循合法、正当、必要原则，基于本政策所述目的，收集和使用您的个人信息。以下将通过表格形式详细说明：

表格2：个人信息收集与使用明细`

const agreement2 = `二、我们如何存储和保护您的个人信息

2.1 存储地点：除非法律法规另有规定，我们在中华人民共和国境内收集的个人信息，将存储在中华人民共和国境内。

2.2 存储期限：我们将在实现本政策所述目的所必需的最短时间内存储您的个人信息，除非法律法规对数据保存有强制要求。

2.3 保护措施：我们已采用符合行业标准的安全技术和组织管理措施，以保护您的个人信息，防止数据遭到未经授权的访问、公开披露、使用、修改、损坏或丢失。例如，我们对个人信息进行加密存储，并实施严格的访问控制机制。

2.4 安全事件处理：若发生个人信息泄露等安全事件，我们将立即启动应急预案，采取补救措施，并按照法律法规要求向您告知事件基本情况、可能的影响以及我们已采取或将要采取的处置措施。

三、我们如何对外提供您的个人信息

我们不会与本平台以外的任何公司、组织和个人分享、转让或公开披露您的个人信息，但以下情况除外：

3.1 获得您的明确同意：事先获得您的明确授权同意后，我们才会对外分享、转让或公开披露您的个人信息。

3.2 法律法规规定：根据法律法规规定，或应政府部门的强制性要求，我们可能会对外共享您的个人信息。

3.3 在涉及合并、收购或破产清算时：如涉及到个人信息转让，我们将要求新的持有您个人信息的公司、组织继续受本政策的约束。

四、您的权利

按照中国法律法规、国家标准及行业惯例，我们保障您对自己的个人信息行使以下权利：

4.1 访问和更正您的个人信息：您有权访问、更正您的个人信息，法律法规规定的例外情况除外。

4.2 删除您的个人信息：在特定情形下，如我们处理个人信息的目的已实现、您撤回同意、我们不再向您提供产品或服务，您可以向我们提出删除个人信息的请求。

4.3 撤回您的授权同意：对于非必要个人信息的收集，您可以改变授权范围或撤回您的授权。

4.4 注销账户：您有权通过本平台提供的渠道注销您的账户。账户注销后，我们将停止为您提供服务，并根据法律法规要求删除或匿名化您的个人信息。

五、如何处理儿童的个人信息

我们的产品主要面向成人。如果没有父母或监护人的同意，未满十四周岁的儿童不应创建自己的用户账户。对于经父母同意而收集儿童个人信息的情况，我们只会在法律允许、父母或监护人明确同意或保护儿童所必要的情况下使用或公开披露此信息。`

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.agreement-page {
  min-height: 100vh;
  position: relative;
  overflow-y: auto;
}

/* 背景 */
.bg-cover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/bg.jpg');
  background-size: cover;
  background-position: center;
  z-index: -1;
}

/* 导航栏 */
.nav-bar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.nav-title {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  flex: 1;
  text-align: center;
}

.nav-placeholder {
  width: 20px;
}

/* 协议内容 */
.agreement-content {
  padding: 10px;
  padding-bottom: 40px;
}

.agreement-text {
  font-size: 14px;
  line-height: 1.8;
  color: #fff;
  white-space: pre-line;
  text-align: justify;
  margin: 0 0 16px 0;
}

.agreement-image {
  width: 100%;
  display: block;
  margin: 20px 0;
}
</style>
