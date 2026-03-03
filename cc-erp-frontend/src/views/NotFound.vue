<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <el-result icon="warning" title="页面不存在" sub-title="抱歉，您访问的页面不存在">
        <template #extra>
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F0F2F5;
}
</style>
