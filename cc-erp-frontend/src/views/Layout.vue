<template>
  <div class="layout-container">
    <!-- 顶部栏 -->
    <el-header class="layout-header">
      <div class="header-left">
        <h1 class="logo">CC ERP</h1>
      </div>

      <div class="header-right">
        <el-icon class="header-icon" :size="20">
          <Bell />
        </el-icon>
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" class="avatar">
              {{ userInfo.realName?.substring(0, 1) || 'U' }}
            </el-avatar>
            <span class="username">{{ userInfo.realName || '管理员' }}</span>
            <el-icon :size="14">
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>
                <el-icon><User /></el-icon>
                个人信息
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="layout-main">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '240px'" class="layout-aside">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          background-color="#001529"
          text-color="#FFFFFF"
          active-text-color="#FFFFFF"
          class="layout-menu"
          router
        >
          <el-menu-item index="/home">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <el-sub-menu index="purchase">
            <template #title>
              <el-icon><ShoppingCart /></el-icon>
              <span>进销存</span>
            </template>
            <el-menu-item index="/product">
              <el-icon><Goods /></el-icon>
              <template #title>商品管理</template>
            </el-menu-item>
            <el-menu-item index="/purchase">
              <el-icon><ShoppingCart /></el-icon>
              <template #title>采购管理</template>
            </el-menu-item>
            <el-menu-item index="/sales">
              <el-icon><Sell /></el-icon>
              <template #title>销售管理</template>
            </el-menu-item>
            <el-menu-item index="/inventory">
              <el-icon><Box /></el-icon>
              <template #title>库存管理</template>
            </el-menu-item>
            <el-menu-item index="/customer">
              <el-icon><User /></el-icon>
              <template #title>客户管理</template>
            </el-menu-item>
            <el-menu-item index="/supplier">
              <el-icon><User /></el-icon>
              <template #title>供应商管理</template>
            </el-menu-item>
            <el-menu-item index="/warehouse">
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>仓库管理</template>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="finance">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>财务</span>
            </template>
            <el-menu-item index="/finance/initial-balance">
              <el-icon><CircleCheck /></el-icon>
              <template #title>期初开账</template>
            </el-menu-item>
            <el-menu-item index="/finance/annual-closing">
              <el-icon><Lock /></el-icon>
              <template #title>年终关账</template>
            </el-menu-item>
            <el-menu-item index="/finance/receivable">
              <el-icon><Document /></el-icon>
              <template #title>应收账款</template>
            </el-menu-item>
            <el-menu-item index="/finance/payable">
              <el-icon><CreditCard /></el-icon>
              <template #title>应付账款</template>
            </el-menu-item>
            <el-menu-item index="/finance/receipt">
              <el-icon><Money /></el-icon>
              <template #title>收款记录</template>
            </el-menu-item>
            <el-menu-item index="/finance/payment">
              <el-icon><WalletFilled /></el-icon>
              <template #title>付款记录</template>
            </el-menu-item>
            <el-menu-item index="/finance/invoice">
              <el-icon><Tickets /></el-icon>
              <template #title>发票管理</template>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="report">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>报表统计</span>
            </template>
            <el-menu-item index="/report/sales">
              <el-icon><TrendCharts /></el-icon>
              <template #title>销售报表</template>
            </el-menu-item>
            <el-menu-item index="/report/purchase">
              <el-icon><ShoppingCart /></el-icon>
              <template #title>采购报表</template>
            </el-menu-item>
            <el-menu-item index="/report/inventory">
              <el-icon><Box /></el-icon>
              <template #title>库存报表</template>
            </el-menu-item>
            <el-menu-item index="/report/finance">
              <el-icon><Wallet /></el-icon>
              <template #title>财务报表</template>
            </el-menu-item>
            <el-menu-item index="/report/performance">
              <el-icon><Trophy /></el-icon>
              <template #title>业绩报表</template>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/user">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="/system/role">
              <el-icon><Key /></el-icon>
              <template #title>角色管理</template>
            </el-menu-item>
            <el-menu-item index="/system/permission">
              <el-icon><Lock /></el-icon>
              <template #title>权限管理</template>
            </el-menu-item>
            <el-menu-item index="/system/menu">
              <el-icon><Fold /></el-icon>
              <template #title>菜单管理</template>
            </el-menu-item>
            <el-menu-item index="/system/settings">
              <el-icon><Setting /></el-icon>
              <template #title>系统设置</template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 内容区 -->
      <el-main class="layout-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  HomeFilled,
  ShoppingCart,
  Goods,
  Sell,
  Box,
  OfficeBuilding,
  Money,
  Coin,
  TrendCharts,
  Wallet,
  Trophy,
  Document,
  CreditCard,
  Tickets,
  Bell,
  User,
  ArrowDown,
  SwitchButton,
  Key,
  Lock,
  Fold,
  Setting,
  CircleCheck,
  WalletFilled
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = computed(() => route.path)
const userInfo = computed(() => userStore.userInfo)

const handleCommand = () => {
  // 可以添加其他下拉菜单命令处理
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await userStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border-bottom: 1px solid #F0F0F0;
  padding: 0 24px;

  .header-left {
    .logo {
      font-size: 20px;
      font-weight: 600;
      color: #1890FF;
      margin: 0;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-icon {
      cursor: pointer;
      color: #595959;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .avatar {
        background: #1890FF;
        color: #FFFFFF;
      }

      .username {
        font-size: 14px;
        color: #262626;
      }
    }
  }
}

.layout-main {
  flex: 1;
  overflow: hidden;
}

.layout-aside {
  background: #001529;
  overflow-x: hidden;
  overflow-y: auto;

  .layout-menu {
    border-right: none;
    height: 100%;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      &:hover {
        background: rgba(24, 144, 255, 0.1) !important;
      }
    }

    :deep(.el-menu-item.is-active) {
      background: #1890FF !important;
    }
  }
}

.layout-content {
  background: #F0F2F5;
  padding: 24px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
