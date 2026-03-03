# CC ERP 前端项目

## 项目介绍

CC ERP 前端项目，基于 Vue.js 3 + Element Plus 构建。

## 技术栈

- **框架**: Vue.js 3 (Composition API)
- **UI 组件库**: Element Plus
- **构建工具**: Vite 5.x
- **状态管理**: Pinia
- **路由**: Vue Router 4.x
- **HTTP 请求**: Axios
- **图表库**: ECharts 5.x

## 项目结构

```
cc-erp-frontend/
├── src/
│   ├── api/                    # API 接口
│   │   ├── auth.js            # 认证接口
│   │   ├── product.js         # 商品接口
│   │   └── purchase.js        # 采购接口
│   ├── assets/                # 静态资源
│   │   └── styles/
│   │       └── variables.scss # CSS 变量
│   ├── components/            # 公共组件
│   ├── router/                # 路由配置
│   │   └── index.js
│   ├── store/                 # 状态管理
│   │   └── user.js            # 用户状态
│   ├── utils/                 # 工具类
│   │   └── request.js         # Axios 封装
│   ├── views/                 # 页面视图
│   │   ├── Login.vue          # 登录页
│   │   ├── Layout.vue         # 主布局
│   │   ├── Home.vue           # 首页
│   │   ├── product/           # 商品管理
│   │   ├── purchase/          # 采购管理
│   │   ├── sales/             # 销售管理
│   │   ├── inventory/         # 库存管理
│   │   ├── finance/           # 财务管理
│   │   └── report/            # 报表统计
│   ├── App.vue                # 根组件
│   └── main.js                # 入口文件
├── public/                    # 公共资源
├── index.html                 # HTML 模板
├── vite.config.js             # Vite 配置
└── package.json               # 项目配置
```

## 安装依赖

```bash
cd cc-erp-frontend
npm install
```

## 启动项目

```bash
npm run dev
```

访问地址: http://localhost:5173

## 默认账号

```
用户名: admin
密码: admin123
```

## 构建生产版本

```bash
npm run build
```

## 功能清单

- [x] 登录页面
- [x] 主界面布局
- [x] 首页（数据概览 + 图表）
- [x] 商品管理列表
- [x] 采购管理列表
- [ ] 销售管理
- [ ] 库存管理
- [ ] 财务管理
- [ ] 报表统计

## 待完成功能

1. **新增/编辑商品弹窗**
2. **新增采购单弹窗**
3. **采购单详情查看**
4. **销售管理完整功能**
5. **库存管理完整功能**
6. **应收应付管理**
7. **各类报表页面**
