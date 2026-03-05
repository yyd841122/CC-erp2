# CC-ERP 企业管理系统

## 项目简介

CC-ERP 是一套面向中小企业的企业资源管理系统，采用前后端分离架构。

## 技术栈

### 前端
- Vue 3.4 + Vite 5.4
- Element Plus 2.4
- Pinia 2.1
- Vue Router 4.2
- Axios 1.6
- ECharts 5.4
- XLSX 0.18.5

### 后端
- Java 17
- Spring Boot 3.2
- MyBatis 3.0
- PostgreSQL 16
- JWT
- Spring Security

## 功能模块

- [x] 用户登录/登出
- [x] 商品管理（CRUD + 分类管理 + Excel导入导出 + 批量操作 + 表头排序 + 智能去重）
- [x] 客户管理（CRUD + Excel导入导出）
- [x] 供应商管理（CRUD + Excel导入导出）
- [x] 仓库管理（CRUD + 库存分布查看）
- [x] 采购管理（列表、创建、审核、打印功能）
- [x] 销售管理（列表、创建、审核、作废、打印功能）
- [x] 库存管理（列表、调整、流水）
- [x] 财务管理（应收应付、收付款、发票、期初开账）
- [x] 报表统计（销售、采购、库存、财务、业绩）
- [x] 用户管理（CRUD、角色分配、密码重置）
- [x] 角色权限管理（角色CRUD + 权限配置）
- [x] 菜单管理（CRUD、树形展示、图标预览）
- [x] 系统设置（基本设置、安全设置、数据字典、操作日志）
- [x] 期初开账（期初库存、应收应付、现金余额、开账确认）
- [x] 数据验证增强（通用验证规则）
- [x] 错误处理优化（统一错误处理）

## 新增功能 (v1.4.2)

### 商品管理增强
- **批量操作**：支持批量删除和批量更改分类
- **表头排序**：所有列支持点击排序，价格字段使用数字比较
- **智能去重**：Excel导入时自动检查重复（商品名称+分类+规格）
- **列宽自适应**：使用 min-width 实现响应式列宽，商品名称支持悬浮显示完整内容

## 快速开始

### 前端启动

```bash
cd cc-erp-frontend
npm install
npm run dev
```

前端服务运行在 http://localhost:5175/

### 后端启动

```bash
cd cc-erp-backend
.\mvnw.cmd spring-boot:run
```

后端服务运行在 http://localhost:8080/

### 默认登录

- 用户名: admin
- 密码: admin123

## 项目结构

```
CC_ERP/
├── cc-erp-frontend/          # 前端项目
│   ├── src/
│   │   ├── api/              # API 接口
│   │   ├── components/       # 公共组件
│   │   ├── views/            # 页面组件
│   │   ├── router/           # 路由配置
│   │   ├── store/            # 状态管理
│   │   └── utils/           # 工具函数
│   ├── package.json
│   └── vite.config.js
├── cc-erp-backend/          # 后端项目
│   ├── src/main/java/com/cc/erp/
│   │   ├── controller/      # 控制器
│   │   ├── service/         # 业务逻辑
│   │   ├── mapper/          # 数据访问
│   │   ├── entity/          # 实体类
│   │   ├── config/          # 配置类
│   │   ├── security/        # 安全相关
│   │   └── vo/              # 视图对象
│   ├── src/main/resources/
│   │   ├── mapper/          # MyBatis映射
│   │   └── db/migration/    # 数据库脚本
│   └── pom.xml
├── request.md                 # 需求记录
├── DEPLOYMENT.md             # 部署文档
└── QUICKSTART.md             # 快速启动指南
```

## 版本历史

### v1.4.2 (2025-03-05)
- 商品管理批量操作功能
- 表头排序功能
- Excel导入智能去重（商品名称+分类+规格）
- 列宽自适应优化

### v1.4.1 (2025-03-05)
- 修复商品分类Excel导入问题
- 修复商品分类前端显示问题
- 优化Excel模板生成格式

### v1.4.0 (2025-03-05)
- 后端API模式切换
- 清理所有虚拟/模拟数据
- 系统完全使用PostgreSQL数据库
- 移除前端模拟模式

### v1.3.0 (2024-12-XX)
- 权限加载修复
- 登录功能优化

### v1.2.0 (2024-XX-XX)
- 正式环境配置与优化

### v1.1.0 (2024-XX-XX)
- 功能增强与优化

### v1.0.0 (2024-03-03)
- 初始版本发布
- 完整的前端功能实现
- 模拟数据模式支持

## 许可证

MIT License

## 作者

CC-ERP Team
