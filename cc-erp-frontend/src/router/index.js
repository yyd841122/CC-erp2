import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/home',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/product/ProductList.vue'),
        meta: { title: '商品管理', icon: 'Goods', parent: '进销存' }
      },
      {
        path: 'purchase',
        name: 'Purchase',
        component: () => import('@/views/purchase/PurchaseList.vue'),
        meta: { title: '采购管理', icon: 'ShoppingCart', parent: '进销存' }
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('@/views/sales/SalesList.vue'),
        meta: { title: '销售管理', icon: 'Sell', parent: '进销存' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/inventory/StockList.vue'),
        meta: { title: '库存管理', icon: 'Box', parent: '进销存' }
      },
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('@/views/customer/CustomerList.vue'),
        meta: { title: '客户管理', icon: 'User', parent: '进销存' }
      },
      {
        path: 'supplier',
        name: 'Supplier',
        component: () => import('@/views/supplier/SupplierList.vue'),
        meta: { title: '供应商管理', icon: 'User', parent: '进销存' }
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('@/views/warehouse/WarehouseList.vue'),
        meta: { title: '仓库管理', icon: 'OfficeBuilding', parent: '进销存' }
      },
      {
        path: 'finance/receivable',
        name: 'FinanceReceivable',
        component: () => import('@/views/finance/ReceivableList.vue'),
        meta: { title: '应收账款', icon: 'Document' }
      },
      {
        path: 'finance/payable',
        name: 'FinancePayable',
        component: () => import('@/views/finance/PayableList.vue'),
        meta: { title: '应付账款', icon: 'CreditCard' }
      },
      {
        path: 'finance/receipt',
        name: 'FinanceReceipt',
        component: () => import('@/views/finance/ReceiptList.vue'),
        meta: { title: '收款记录', icon: 'Money' }
      },
      {
        path: 'finance/payment',
        name: 'FinancePayment',
        component: () => import('@/views/finance/PaymentList.vue'),
        meta: { title: '付款记录', icon: 'WalletFilled' }
      },
      {
        path: 'finance/invoice',
        name: 'FinanceInvoice',
        component: () => import('@/views/finance/InvoiceList.vue'),
        meta: { title: '发票管理', icon: 'Tickets' }
      },
      {
        path: 'finance/initial-balance',
        name: 'InitialBalance',
        component: () => import('@/views/finance/InitialBalance.vue'),
        meta: { title: '期初开账', icon: 'CircleCheck' }
      },
      {
        path: 'finance/annual-closing',
        name: 'AnnualClosing',
        component: () => import('@/views/finance/AnnualClosing.vue'),
        meta: { title: '年终关账', icon: 'Lock' }
      },
      {
        path: 'report/sales',
        name: 'ReportSales',
        component: () => import('@/views/report/SalesReportPage.vue'),
        meta: { title: '销售报表', icon: 'TrendCharts' }
      },
      {
        path: 'report/purchase',
        name: 'ReportPurchase',
        component: () => import('@/views/report/PurchaseReportPage.vue'),
        meta: { title: '采购报表', icon: 'ShoppingCart' }
      },
      {
        path: 'report/inventory',
        name: 'ReportInventory',
        component: () => import('@/views/report/InventoryReportPage.vue'),
        meta: { title: '库存报表', icon: 'Box' }
      },
      {
        path: 'report/finance',
        name: 'ReportFinance',
        component: () => import('@/views/report/FinanceReportPage.vue'),
        meta: { title: '财务报表', icon: 'Wallet' }
      },
      {
        path: 'report/performance',
        name: 'ReportPerformance',
        component: () => import('@/views/report/PerformanceReportPage.vue'),
        meta: { title: '业绩报表', icon: 'Trophy' }
      },
      {
        path: 'system/settings',
        name: 'SystemSettings',
        component: () => import('@/views/system/SystemSettings.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      },
      {
        path: 'system/user',
        name: 'SystemUser',
        component: () => import('@/views/system/UserList.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'system/role',
        name: 'Role',
        component: () => import('@/views/system/RoleList.vue'),
        meta: { title: '角色管理', icon: 'Key' }
      },
      {
        path: 'system/permission',
        name: 'SystemPermission',
        component: () => import('@/views/system/PermissionList.vue'),
        meta: { title: '权限管理', icon: 'Lock' }
      },
      {
        path: 'system/menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/MenuList.vue'),
        meta: { title: '菜单管理', icon: 'Menu' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
