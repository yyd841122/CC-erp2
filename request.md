# CC-ERP 开发需求记录

## 项目概述
CC-ERP 企业管理系统 - 一套面向中小企业的企业资源管理系统，采用前后端分离架构。

---

## 需求列表

### 1. 测试系统
**请求**: 测试
**状态**: ✅ 已完成
**详情**: 启动前端服务进行功能测试

---

### 2. 后端环境
**请求**: 后端
**状态**: ✅ 已完成
**详情**:
- 检查后端环境需求
- 创建部署文档 `DEPLOYMENT.md`
- 创建快速启动文档 `QUICKSTART.md`

---

### 3. 生成部署文档
**请求**: 生成
**状态**: ✅ 已完成
**详情**:
- 创建 `DEPLOYMENT.md` - 完整部署指南
- 创建 `QUICKSTART.md` - 快速启动指南

---

### 4. 后端开发完善
**请求**: 继续完成后端，待完成功能开发
**状态**: ✅ 已完成
**详情**: 创建以下后端文件
- `SalesService.java` - 销售服务
- `SalesController.java` - 销售控制器
- `InventoryController.java` - 库存控制器
- `FinanceController.java` - 财务控制器
- `ReportController.java` - 报表控制器
- `UserController.java` - 用户控制器
- 实体类修复（类型不一致问题）
- XML映射文件创建

---

### 5. 功能完善检查
**请求**: 从头到尾检查一下，还有哪些功能没有完善
**状态**: ✅ 已完成
**详情**:
- 修复前端API文件缺失（sales, inventory, finance, report, customer, supplier）
- 修复实体类型不一致（BigDecimal vs Long）
- 补充XML映射文件
- 修复InvStock实体继承

---

### 6. 启动测试
**请求**: 前后端启动来测试
**状态**: ✅ 已完成
**详情**: 启动前端服务进行测试

---

### 7. 登录请求失败问题
**请求**: 登录提示请求失败
**状态**: ✅ 已修复
**详情**:
- 后端未启动导致登录失败
- 添加模拟模式检测到 `auth.js`
- 修改用户store自动切换到模拟模式

---

### 8. 模拟模式优化
**请求**: 还是在请求失败
**状态**: ✅ 已修复
**详情**:
- 完善模拟模式检测
- 添加 `status >= 500` 错误检测
- 优化错误处理逻辑

---

### 9. 连接被拒绝问题
**请求**: 无法访问此网站 localhost 拒绝了我们的连接请求
**状态**: ✅ 已修复
**详情**: 前端服务停止，重新启动服务

---

### 10. 商品分类管理
**请求**: 商品分类添加窗口帮我实现
**状态**: ✅ 已完成
**详情**:
- 创建 `CategoryDialog.vue` - 分类管理对话框
- 添加"分类管理"按钮到 `ProductList.vue`
- 更新 `ProductDialog.vue` 使用动态分类
- 分类数据保存到 localStorage

---

### 11. 分类按钮无响应
**请求**: 点击「分类管理」按钮 没有任何反应
**状态**: ✅ 已修复
**详情**:
- 修复 `CategoryDialog.vue` 缺少 `computed` 导入
- 从 `import { ref, reactive, watch }` 改为 `import { ref, reactive, computed }`

---

### 12. 数据持久化
**请求**: 添加成功后，刷新后，数据消失
**状态**: ✅ 已修复
**详情**:
- 分类数据保存到 localStorage（键：`cc_erp_categories`）
- `CategoryDialog` 和 `ProductList` 都从 localStorage 加载数据

---

### 13. 测试数据管理
**请求**: 测试阶段所有数据都需要保存，方便做全功能测试。全部测试通过后，清空所有数据，发布
**状态**: ✅ 已完成
**详情**:
- 创建 `TestDataManager.vue` 组件
  - 数据统计显示
  - 一键清空所有测试数据
  - 导出/导入测试数据功能
  - 集中管理存储键
- 集成到 `Layout.vue`，模拟模式下显示"测试数据"按钮

---

### 14. 自动生成编号
**请求**: 新增商品，和客户时，编号自动生成累加
**状态**: ✅ 已完成
**详情**:
- 商品编码: P00001, P00002, P00003...
- 客户编码: C00001, C00002, C00003...
- 供应商编码: S00001, S00002, S00003...
- 编码字段为只读，支持"重新生成"按钮
- 添加 `generateProductCode()`, `generateCustomerCode()`, `generateSupplierCode()` 函数

---

### 15. 客户字段调整
**请求**: 新增客户界面，添加一项，物流信息。另外客户名称和联系人只需要一项，不需要2项，联系电话可以为空
**状态**: ✅ 已完成
**详情**:
- 添加"物流信息"字段
- 移除"联系人"字段
- "联系电话"改为非必填
- 更新搜索栏和表格列
- 更新 API 搜索过滤逻辑

---

### 16. Excel导入导出
**请求**: 商品管理和客户管理，供应商管理页面添加excel 导入导出操作
**状态**: ✅ 已完成
**详情**:
- 安装 `xlsx` 库
- 创建 `src/utils/excel.js` 工具文件
  - `exportToExcel()` - 导出数据
  - `importFromExcel()` - 导入数据
  - `downloadTemplate()` - 下载模板
- 为以下页面添加Excel操作按钮:
  - `ProductList.vue` - 商品管理
  - `CustomerList.vue` - 客户管理
  - `SupplierList.vue` - 供应商管理

**Excel操作功能**:
- 导出数据：将当前数据导出为Excel文件（带时间戳）
- 导入数据：从Excel批量导入，支持数据验证
- 下载模板：下载标准Excel导入模板

---

### 17. 商品单位设置
**请求**: 商品管理 单位默认选择套，添加KG选项
**状态**: ✅ 已完成
**详情**:
- 新增商品时，单位默认选择"套"
- 单位选项调整顺序：套、个、件、箱、kg、**KG**（新增）、米
- 导入数据时未指定单位的默认为"套"

---

### 18. 服务启动问题
**请求**: 无法打开网页
**状态**: ✅ 已修复
**详情**:
- 修复 vite 包安装问题
- 将 `vite` 和 `@vitejs/plugin-vue` 移至 dependencies
- 重新安装依赖并启动服务
- 服务运行在 http://localhost:5175/

---

### 19. 仓库管理功能开发
**请求**: 1-5 按顺序全部开发（第1项：仓库管理页面）
**状态**: ✅ 已完成
**详情**:
- 创建 `warehouse.js` - 仓库API（含模拟模式）
- 创建 `WarehouseList.vue` - 仓库列表页面
- 创建 `WarehouseDialog.vue` - 仓库编辑对话框
- 添加库存分布查看功能
- 更新路由和菜单配置
- 测试数据管理器添加仓库统计

---

### 20. 后端服务启动支持
**请求**: 1-5 按顺序全部开发（第2项：后端服务启动）
**状态**: ✅ 已完成
**详情**:
- 添加 H2 内存数据库支持（无需安装 PostgreSQL）
- 创建 Maven Wrapper 配置
- 创建 `install-maven.bat` - Maven 自动安装脚本
- 创建 `start.bat` / `start-dev.bat` - 后端启动脚本
- 创建 `STARTUP.md` - 后端启动指南
- 更新 `pom.xml` 添加 H2 依赖

---

### 21. 权限控制细化
**请求**: 1-5 按顺序全部开发（第3项：权限控制细化）
**状态**: ✅ 已完成
**详情**:
- 创建 `permission.js` - 权限API（角色、权限定义）
- 创建 `RoleList.vue` - 角色管理页面
- 创建 `RoleDialog.vue` - 角色编辑对话框（含权限配置）
- 创建 `directives/permission.js` - 权限指令
- 创建 `PermissionButton.vue` - 权限按钮组件
- 更新 `main.js` 注册权限指令
- 更新路由和菜单（添加系统管理）

**权限系统特性**:
- 预定义角色：管理员、经理、员工、访客
- 40+ 权限点覆盖所有模块
- `v-permission` 指令控制按钮显示
- `hasPermission()` 函数权限判断

---

### 22. 数据验证增强
**请求**: 1-5 按顺序全部开发（第4项：数据验证增强）
**状态**: ✅ 已完成
**详情**:
- 创建 `validate.js` - 通用表单验证规则
  - 手机号、邮箱、身份证验证
  - 金额、数字范围验证
  - 编码格式验证
- 创建 `format.js` - 数据格式化工具
  - 金额格式化（分转元）
  - 日期时间格式化
  - 文件大小、状态格式化
- 更新 `ProductDialog.vue` 增强验证示例

---

### 23. 错误处理优化
**请求**: 1-5 按顺序全部开发（第5项：错误处理优化）
**状态**: ✅ 已完成
**详情**:
- 创建 `error.js` - 错误码定义和错误类
  - BusinessError - 业务错误
  - NetworkError - 网络错误
  - ValidationError - 验证错误
- 更新 `request.js` 增强错误处理
  - 统一错误码管理
  - 友好的错误提示
  - 重复请求自动取消
  - 请求耗时统计
  - Token过期自动跳转

---

### 24. 报表统计查询功能完善
**请求**: 继续完善报表统计查询功能
**状态**: ✅ 已完成
**详情**:
- 更新 `report.js` API - 添加模拟数据生成和参数支持
- 更新 `Index.vue` - 报表查询主页
  - 添加快速时间选择（今天、本周、本月、上月、本季度、本年）
  - 添加各报表专属筛选条件
  - 支持客户、供应商、仓库、部门等维度筛选
  - 添加同比/环比对比功能
  - 实现报表导出功能
- 更新 `SalesReport.vue` - 支持动态数据和loading状态
- 更新 `PurchaseReport.vue` - 支持动态数据和loading状态

**新增功能**:
- 快速时间选择（6种预设）
- 销售报表：客户筛选、商品分类筛选
- 采购报表：供应商筛选、商品分类筛选
- 库存报表：仓库筛选、库存状态筛选
- 财务报表：类型筛选（应收/应付/收入/支出）
- 业绩报表：部门筛选
- 报表导出（Excel格式）

---

### 25. 报表菜单无响应问题
**请求**: 点击"报表统计"没反应
**状态**: ✅ 已修复
**详情**:
- 问题原因：`Bill` 图标在 Element Plus 中不存在，导致 FinanceReport 组件加载失败
- 修复内容：
  - 将 `Bill` 图标替换为 `Document`
  - 移除测试卡片，恢复完整报表显示
  - 启用页面自动加载本月数据
  - 清理调试用的 console.log

---

### 26. 报表查询功能完善
**请求**: 添加查询功能模块
**状态**: ✅ 已完成
**详情**:
- 恢复完整的报表内容展示区域
- 移除测试卡片，页面加载时自动查询本月数据
- 支持的查询功能：
  - 快速时间选择（今天、本周、本月、上月、本季度、本年）
  - 自定义时间范围
  - 各报表专属筛选条件（客户、供应商、仓库、部门等）
  - 对比周期选择（同比/环比）
  - 数据导出功能
  - 刷新和重置功能

---

### 27. 系统管理模块完善
**请求**: 继续完成系统管理模块的全部功能
**状态**: ✅ 已完成
**详情**:
- 创建 `UserList.vue` - 用户管理页面（搜索、新增、编辑、删除、分配角色、重置密码）
- 创建 `UserDialog.vue` - 用户新增/编辑对话框（含表单验证）
- 创建 `AssignRoleDialog.vue` - 角色分配对话框
- 创建 `PermissionList.vue` - 权限管理页面（树形结构显示）
- 创建 `PermissionDialog.vue` - 权限新增/编辑对话框
- 创建 `MenuList.vue` - 菜单管理页面（树形结构显示、启用/禁用切换）
- 创建 `MenuDialog.vue` - 菜单新增/编辑对话框（含图标预览）
- 创建 `SystemSettings.vue` - 系统设置页面（基本设置、安全设置、数据字典、操作日志）
- 更新 `router/index.js` - 添加5个系统管理路由
- 更新 `Layout.vue` - 系统管理菜单扩展为5个子菜单
- 增强 `permission.js` API - 添加用户管理和权限管理相关API

**系统管理菜单**:
- 用户管理 - 用户CRUD、角色分配、密码重置
- 角色管理 - 角色CRUD、权限配置
- 权限管理 - 权限CRUD、树形展示
- 菜单管理 - 菜单CRUD、树形展示、图标预览
- 系统设置 - 基本设置、安全设置、数据字典、操作日志

---

### 28. 采购销售单默认日期和打印功能
**请求**: 采购与销售，默认日期为当天，可以更改。采购与销售单，添加打印功能
**状态**: ✅ 已完成
**详情**:
- 更新 `PurchaseDialog.vue`
  - 添加 `getToday()` 函数获取当天日期
  - 采购日期和预计到货默认为当天（可修改）
  - 添加"打印"按钮（绿色，带打印机图标）
  - 打印内容：采购单标题、供应商、日期、明细表格、金额汇总、备注、签字栏
- 更新 `SalesDialog.vue`
  - 添加 `getToday()` 函数获取当天日期
  - 销售日期和交货日期默认为当天（可修改）
  - 添加"打印"按钮（绿色，带打印机图标）
  - 打印内容：销售单标题、客户、日期、明细表格、金额汇总、备注、签字栏

---

### 29. 需求自动记录功能
**请求**: 把我提的所有需求，没有添加到request.md中的，继续补充进去。把我以后的需求，全部自动加进去，不需要我再提醒。
**状态**: ✅ 已完成
**详情**:
- 补充了之前遗漏的需求（第27、28项）
- 今后所有用户需求将自动添加到 request.md
- AI助手会自动维护需求记录，包括：
  - 需求编号自动递增
  - 需求描述记录
  - 实现状态跟踪
  - 详细变更说明

---

### 30. 期初开账功能
**请求**: 添加期初开账功能
**状态**: ✅ 已完成
**详情**:
期初开账功能用于系统初始化，录入企业开始使用ERP系统时的基础数据。

**功能模块**:
- 期初库存录入 - 各商品在各仓库的初始库存数量和成本
- 期初应收账款 - 客户欠款
- 期初应付账款 - 供应商欠款
- 期初现金余额 - 银行账户现金
- 开账日期确认 - 正式启用系统日期

**功能特点**:
- 支持批量新增期初库存
- 期初应收应付录入
- 现金账户余额管理
- 期初数据审核确认
- 开账后不可修改期初数据
- 显示各模块汇总金额

**创建文件**:
- `src/api/initial.js` - 期初开账API（含模拟模式）
- `src/views/finance/InitialBalance.vue` - 期初开账页面
- 更新 `router/index.js` - 添加路由
- 更新 `Layout.vue` - 添加菜单项

**存储键**: `cc_erp_initial_balance`

---

### 31. 清除数据保留管理员功能
**请求**: 现在清除所有数据，我来试用所有功能。保留admin 操作员及最高权限
**状态**: ✅ 已完成
**详情**:
- 更新 `TestDataManager.vue` - 添加"清除所有数据（保留管理员）"按钮
- 清除所有业务数据（商品、客户、供应商、仓库、采购单、销售单、库存、财务等）
- 清除测试数据（用户、角色、权限）
- 保留 admin 用户及其最高权限设置
- 重置期初开账状态

---

### 32. 修复分类删除商品数量不同步问题
**请求**: 删除分类管理时，提示有商品无法删除，但我查询商品时未看到对应商品
**状态**: ✅ 已修复
**详情**:
问题原因：分类中的 `productCount` 是静态值，商品增删时没有同步更新

**修复内容**:
- 更新 `CategoryDialog.vue`
  - 添加 `updateCategoryProductCount()` 方法，从实际商品数据统计
  - 修改 `loadCategories()` 加载时自动更新商品数量
  - 修改 `handleDeleteCategory()` 删除前检查实际商品数据
  - 默认分类的 productCount 改为 0
- 更新 `ProductList.vue`
  - 添加 `updateCategoryCount()` 方法同步更新分类计数
  - `loadData()` 每次加载时更新分类计数
  - 商品删除后更新分类计数
  - 导入数据后更新分类计数
  - 打开分类管理时更新商品数量

**效果**: 分类商品数量实时同步，删除检查准确无误

---

### 33. 测试数据按钮无响应问题
**请求**: 点击右上角的"测试数据"按钮没有任何反应
**状态**: ✅ 已修复
**详情**:
**问题原因**:
1. 按钮点击事件处理方式不够明确
2. `TestDataManager.vue` 中函数初始化顺序错误：`handleRefresh()` 在初始化时被调用，但依赖的 `getData` 函数还未定义

**修复内容**:
- 更新 `Layout.vue`
  - 添加 `openTestDataManager()` 方法专门处理按钮点击
  - 添加控制台日志用于调试
  - 按钮点击事件改为调用该方法
- 更新 `TestDataManager.vue`
  - 将 `getData` 和 `saveData` 函数定义移到 `handleRefresh` 之前
  - 确保函数在被调用前已正确初始化

**调试方法**:
1. 按 F12 打开浏览器开发者工具
2. 在控制台输入 `localStorage.getItem('mockMode')` 检查是否为 'true'
3. 如果不是 'true'，在登录时勾选"模拟模式"复选框

---

### 34. 首页数据显示更新
**请求**: 首页已经清空所有数据，但还有今日销售，商品总数等相关信息，更新处理下
**状态**: ✅ 已完成
**详情**:
**问题原因**: 首页使用硬编码的静态数据，不会根据实际数据变化

**修复内容**:
- 更新 `Home.vue`
  - 从 localStorage 读取真实数据（商品、客户、销售订单、分类）
  - 计算今日销售金额（过滤作废订单）
  - 计算商品总数、客户总数
  - 计算库存预警数量（库存小于10的商品）
  - 销售趋势图显示近7天真实销售数据
  - 商品分类占比图显示真实分类数据
  - 无数据时显示"暂无数据"提示
  - 监听 localStorage 变化，实时更新数据

**效果**: 首页数据与实际存储数据保持同步

---

### 35. 销售订单允许负库存出库
**请求**: 销售订单，可以负数出库，我自己工厂，自己生产的产品，更改逻辑
**状态**: ✅ 已完成
**详情**:
**业务场景**: 工厂自产自销，允许负库存销售，生产可以补充库存

**修复内容**:
- 更新 `SalesDialog.vue`
  - 移除数量输入框的最小值限制 (`:min="1"`)
  - 允许任意数量的出库（包括负数库存）
  - 添加"当前库存"列显示参考库存（红色显示负库存）
  - 商品下拉框显示库存提示
  - 从 localStorage 加载真实商品和客户数据
  - 对话框打开时自动刷新库存数据

**效果**: 销售订单不再受库存限制，可以随时出库，当前库存仅作为参考信息显示

---

### 36. 清除销售和采购对话框硬编码数据
**请求**: 同样客户信息，和供应商信息也需要清除干净
**状态**: ✅ 已完成
**详情**:
**问题原因**: 销售和采购对话框有硬编码的模拟商品和客户/供应商数据

**修复内容**:
- 更新 `SalesDialog.vue`
  - 清除硬编码的商品和客户列表
  - 初始值设为空数组
  - 只从 localStorage 加载真实数据
- 更新 `PurchaseDialog.vue`
  - 清除硬编码的商品和供应商列表
  - 添加 `loadSupplierData()` 和 `loadProductData()` 函数
  - 添加 onMounted 和 watch 自动加载数据
  - 使用商品档案的采购价 (`purchasePrice`)

**效果**: 在添加真实商品和客户/供应商之前，下拉列表为空，不显示任何模拟数据

---

### 37. 清除财务模块和报表虚拟数据
**请求**: 应收，应付，财务中的虚拟信息也需要全部清除，同样的，报表功能中的虚拟数据也要删除
**状态**: ✅ 已完成
**详情**:
**问题原因**: 财务模块和报表功能中存在大量硬编码的模拟数据

**修复内容**:
- 更新 `finance.js` API
  - 所有 generateMock*List 函数改为从 localStorage 读取真实数据
  - `createReceivable/recordReceipt` 等函数保存数据到 localStorage
  - 收款/付款时自动更新应收/应付账款的已收/已付金额和状态
  - `getCustomerOptions/getSupplierOptions` 从真实数据加载
- 更新 `ReceivableList.vue` - 清除硬编码数据
- 更新 `PayableList.vue` - 清除硬编码数据
- 更新 `ReceiptList.vue` - 清除硬编码数据
- 更新 `PaymentList.vue` - 清除硬编码数据
- 更新 `InvoiceList.vue` - 清除硬编码数据
- 更新 `report/Index.vue`
  - 添加 `loadFilterData()` 从 localStorage 加载筛选选项
  - 清除硬编码的客户/供应商/分类/仓库列表
  - onMounted 时自动加载筛选数据

**效果**: 财务模块和报表功能现在完全使用真实数据，清空后列表为空

---

### 38. 清除报表统计虚拟数据
**请求**: 报表统计中的虚拟数据也清除干净
**状态**: ✅ 已完成
**详情**:
**问题原因**: `report.js` API 中有大量硬编码的模拟数据，导致报表显示虚假信息

**修复内容**:
- 更新 `report.js` API
  - 重写所有报表生成函数，从 localStorage 读取真实数据
  - `generateSalesReport()` - 从销售订单计算销售报表
  - `generatePurchaseReport()` - 从采购订单计算采购报表
  - `generateInventoryReport()` - 从商品数据计算库存报表
  - `generateFinanceReport()` - 从财务数据计算财务报表
  - `generatePerformanceReport()` - 从销售数据计算业绩报表
  - 添加 `getDateRange()` 辅助函数，支持快速时间选择
  - 报表数据基于真实业务数据动态计算

**效果**: 报表统计现在完全基于真实数据，清空业务数据后报表显示空状态

---

### 39. 清除系统管理虚拟用户数据
**请求**: 系统管理中的用户，也帮我清除虚拟数据，只留下admin
**状态**: ✅ 已完成
**详情**:
**问题原因**: `permission.js` 中有硬编码的 3 个虚拟用户（admin, manager, staff01）和 4 个虚拟角色

**修复内容**:
- 更新 `permission.js`
  - 移除硬编码的 mockUsers 和 mockRoles 数组
  - 所有函数改为从 localStorage 读取数据
  - 默认只保留 admin 用户和 ADMIN 角色
  - 添加数据保护：不允许删除/修改 admin 用户名和 ADMIN 角色
  - 添加 `getUsers()` 和 `getRoles()` 辅助函数
  - 角色和用户的增删改操作同步到 localStorage

**效果**: 系统管理只显示 admin 用户，其他用户需要手动添加

---

### 40. 清除商品分类虚拟数据
**请求**: 商品分类信息全部清空虚拟数据
**状态**: ✅ 已完成
**详情**:
**问题原因**: 多个文件中有硬编码的默认分类数据（五金件、电子元器件、塑料制品、包装材料、紧固件）

**修复内容**:
- 更新 `CategoryDialog.vue`
  - 将 `defaultCategories` 改为空数组
  - 不再自动加载预设分类
- 更新 `ProductList.vue`
  - 移除默认分类数据
  - 没有分类时显示空列表
- 更新 `TestDataManager.vue`
  - 清除数据时不再恢复默认分类
  - 用户需要手动添加自己需要的分类

**效果**: 商品分类完全为空，用户需要通过"分类管理"按钮手动添加分类

---

### 41. 全面清除所有硬编码虚拟数据
**请求**: 从头到尾，全部检查一遍看看还有没有硬编码的默认分类数据，有的话全部清除
**状态**: ✅ 已完成
**详情**:
**问题原因**: 多个文件中残留硬编码的虚拟数据，包括仓库、报表、工具文件等

**修复内容**:
- 更新 `warehouse.js`
  - `initMockData()` 改为初始化空数组
  - 移除默认仓库和库存数据
- 更新 `request.js`
  - 清空 `mockData` 对象中的所有硬编码模拟数据
  - 各模块使用 localStorage 机制替代
- 更新 `SalesReport.vue`
  - `defaultData` 改为空值/空数组
- 更新 `PurchaseReport.vue`
  - `defaultData` 改为空值/空数组
- 更新 `InventoryReport.vue`
  - `defaultData` 改为空值/空数组
- 更新 `FinanceReport.vue`
  - `defaultData` 改为空值/空数组
- 更新 `PerformanceReport.vue`
  - `defaultData` 改为空值/空数组（已在需求#40处理）

**清除的硬编码数据包括**:
- 默认商品数据（螺丝A、螺母B、垫片C、螺栓D等）
- 默认客户数据（AA客户、BB公司、CC实业等）
- 默认供应商数据（AA供应商、BB供应商、CC供应商等）
- 默认仓库数据（主仓库、二号仓库、冷藏仓库、临时仓库）
- 默认员工数据（张三、李四、王五、赵六、钱七）
- 默认报表数据（销售、采购、库存、财务、业绩统计）

**效果**: 所有模块初始化时均为空数据，完全依赖用户手动录入或从 localStorage 读取

---

### 42. 再次全面清除剩余硬编码虚拟数据
**请求**: 把所有文件从头到尾，再全部检查一遍看看还有没有虚拟数据，有的话全部清除
**状态**: ✅ 已完成
**详情**:
**问题原因**: 之前清除遗漏了部分文件中的硬编码数据

**修复内容**:
- 更新 `StockList.vue`
  - 清除硬编码的库存数据（螺丝A、螺母B、垫片C、螺栓D）
- 更新 `SalesDetailDialog.vue`
  - 清除模拟订单数据（XX贸易有限公司、主仓库等）
- 更新 `SalesList.vue`
  - 清除硬编码的销售订单数据
- 更新 `InventoryReport.vue`
  - 清除饼图中的分类数据（螺丝类、螺母类等）
  - 清除柱状图中的分类标签
- 更新 `FinanceReport.vue`
  - 清除趋势图中的收入支出数据
- 更新 `PerformanceReport.vue`
  - 清除趋势图中的销售和目标数据
  - 清除柱状图中的客户名称和销售数据

**效果**: 所有模块完全清空虚拟数据，系统初始化时所有数据为空

---

### 43. 销售和采购订单累计金额功能
**请求**: 在销售订单，和采购订单， 确定客户信息后，在打印时，显示之前累计金额，再计算累计金额
**状态**: ✅ 已完成
**详情**:
**业务场景**: 销售和采购业务需要跟踪每个客户/供应商的累计交易金额

**修复内容**:
- 更新 `SalesDialog.vue`
  - 添加 `getCumulativeAmount()` - 获取客户历史累计金额
  - 添加 `saveCumulativeAmount()` - 保存客户累计金额
  - 添加 `previousCumulativeAmount` - 历史累计金额（computed）
  - 添加 `totalCumulativeAmount` - 累计总额（computed）
  - 金额汇总区域新增"历史累计"和"累计总额"显示
  - 打印模板显示历史累计和累计总额
  - 提交时自动保存累计金额到 localStorage
- 更新 `PurchaseDialog.vue`
  - 添加 `getCumulativeAmount()` - 获取供应商历史累计金额
  - 添加 `saveCumulativeAmount()` - 保存供应商累计金额
  - 添加 `previousCumulativeAmount` - 历史累计金额（computed）
  - 添加 `totalCumulativeAmount` - 累计总额（computed）
  - 金额汇总区域新增"历史累计"和"累计总额"显示
  - 打印模板显示历史累计和累计总额
  - 提交时自动保存累计金额到 localStorage

**新增存储键**:
- `cc_erp_cumulative_amounts` - 累计金额数据
  - 结构: `{ sales: { customerId: amount }, purchase: { supplierId: amount } }`

**效果**:
- 选择客户/供应商后自动显示历史累计金额
- 表单和打印单显示：历史累计、本次金额、累计总额
- 每次保存订单后自动更新累计金额

---

### 44. 移除虚拟登录数据，实现真实数据测试
**请求**: 现在我打算正式试用，去除测试数据，同时去除虚拟登录信息。以真实数据要做测试
**状态**: ✅ 已完成
**详情**:
**业务场景**: 正式试用系统，移除所有虚拟/测试数据，使用真实数据进行测试

**修复内容**:
- 更新 `auth.js`
  - 移除硬编码的 `admin/admin123` 虚拟账号
  - `mockLogin()` 改为从 `cc_erp_test_users` 读取真实用户进行验证
  - `getCurrentUser()` 从 localStorage 读取当前用户信息
  - 无用户时提示"系统暂无用户，请先在系统管理中添加用户"
- 更新 `permission.js`
  - 移除 `defaultAdminRole` 和 `defaultAdminUser` 硬编码数据
  - `getRoles()` 和 `getUsers()` 返回空数组而不是默认数据
  - 完全依赖用户自己创建的用户数据
- 更新 `Login.vue`
  - 移除"默认账号: admin / admin123"提示文字
  - 移除登录表单的默认用户名和密码预填充
  - 添加系统未初始化检测和提示
  - 添加"初始化系统"按钮和对话框
  - 新用户创建流程：用户名、姓名、密码、邮箱、手机号
  - 初始化后自动创建管理员角色和第一个管理员用户
  - 登录按钮在无用户时禁用，提示"请先初始化系统"
- 更新 `Layout.vue`
  - 隐藏首页右上角的"测试数据"按钮
  - 移除 DataAnalysis 图标导入
  - 移除 TestDataManager 组件导入
  - 移除 `testDataVisible` ref 和 `isTestMode` computed
  - 移除 `openTestDataManager` 函数
  - 从模板中移除 TestDataManager 组件和按钮
- 修复 `PerformanceReport.vue`
  - 修复第 251 行语法错误（缺少逗号）

**效果**:
- 系统启动时检查是否有用户，无用户时显示初始化向导
- 用户首次使用需要创建管理员账号
- 所有登录验证使用真实的用户数据
- 登录表单不再显示默认账号信息
- 首页不再显示"测试数据"按钮，界面更加简洁

---

### 45. 年终关账功能
**请求**: 帮我再实现另一功能，年终关账，可以把之前的一段时间账目固定，不能更改，但可以查询。每年春节前，也就是腊月的时候，会把一年的账给关了。
**状态**: ✅ 已完成
**详情**:
**业务场景**: 每年春节前（腊月）进行年终关账，关账后锁定该年度所有财务数据，不可修改但可查询

**修复内容**:
- 创建 `src/api/annualClosing.js` - 年终关账API（含模拟模式）
  - `getClosingList()` - 获取关账记录列表
  - `getClosingDetail()` - 获取关账详情
  - `performClosing()` - 执行年终关账
  - `cancelClosing()` - 反结账（取消关账）
  - `getClosingSummary()` - 获取关账年度财务汇总
  - `checkOrderInClosedPeriod()` - 检查订单是否在已关账期间
- 创建 `src/views/finance/AnnualClosing.vue` - 年终关账页面
  - 显示已关账年度列表（含财务汇总：销售金额、采购金额、毛利）
  - 执行关账功能（选择年度、预览汇总、确认关账）
  - 查看关账详情（年度、关账日期、操作人、财务汇总）
  - 反结账功能（仅管理员可用）
  - 关账状态显示（已关账/已取消）
  - 年度选择时自动加载财务汇总预览
  - 对话框关闭时自动重置表单状态
- 更新 `router/index.js` - 添加年终关账路由
- 更新 `Layout.vue` - 添加年终关账菜单项

**新增存储键**:
- `cc_erp_annual_closing` - 年终关账记录
  - 结构: [{ id, year, closingDate, status, operator, operatorId, remark, summary }]

**功能特点**:
- 关账操作：选择年度 → 预览财务汇总 → 确认关账
- 数据锁定：已关账年度的销售、采购、财务数据被固定
- 反结账：管理员可取消关账，恢复数据修改权限
- 详情查询：查看每个关账年度的完整财务汇总

**效果**:
- 财务菜单下新增"年终关账"入口
- 支持多年度关账记录管理
- 关账后数据只读，可追溯历史财务状况

---

### 46. 期初开账日期限制优化
**请求**: 期初开账日期选择错误，选择成了2026-3-26，应为2026-2-26。同时更改逻辑，可以在当天日期之前开账，而不可能选择当天日期之后进行开账
**状态**: ✅ 已完成
**详情**:
**问题原因**: 期初开账日期选择器没有限制，用户可以选择未来日期

**修复内容**:
- 更新 `InitialBalance.vue`
  - 添加 `disabledDate` 函数，禁用当天日期之后的所有日期
  - 移除 `handleConfirmOpening()` 中的自动填充当前日期逻辑
  - 开账日期必须由用户手动选择
  - 日期验证：当前时间设置为 23:59:59.999，确保当天可选中但未来不可选
- 创建 `update-opening-date.html` - 开账日期修复脚本
  - 用于修复已保存的错误开账日期（2026-03-26 → 2026-02-26）
  - 可直接在浏览器打开执行 localStorage 修复

**效果**:
- 开账日期不能选择未来日期
- 只能选择当天或历史日期
- 防止用户误选开账日期

---

### 47. 年终关账后次年度开账功能
**请求**: 如果关账，第二年则需要重新开账，添加这个逻辑
**状态**: ✅ 已完成
**详情**:
**业务场景**: 年终关账后，下一年度需要重新开账，将上年度期末余额结转为新年度期初余额

**修复内容**:
- 更新 `src/api/annualClosing.js`
  - `performClosing()` 关账时自动生成下年度开账准备数据
  - 从期末数据计算：库存（期初=期末）、应收应付（未结清部分）、现金余额
  - 添加 `getNextYearOpening()` - 获取下年度开账准备数据
  - 添加 `confirmNextYearOpening()` - 确认下年度开账
  - 添加 `checkYearNeedsOpening()` - 检查某年度是否需要开账
- 更新 `src/views/finance/AnnualClosing.vue`
  - 关账成功后自动提示用户进行下年度开账
  - 提供"立即前往开账"快捷入口
- 更新 `src/views/finance/InitialBalance.vue`
  - 检测下年度开账准备数据
  - 显示次年度开账提示（含上年关账日期）
  - 开账对话框区分首次开账和次年度开账
  - 次年度开账时使用 `confirmNextYearOpening()` API

**新增存储键**:
- `cc_erp_next_year_opening` - 下年度开账准备数据
  - 结构: `{ year, prevClosedYear, needsOpening, openingInventory, openingReceivables, openingPayables, openingCash, closingDate }`

**功能特点**:
- 关账自动结转：关账后自动生成下年度开账准备数据
- 数据完整结转：库存、应收应付、现金余额自动结转
- 提示快捷操作：关账后提示并引导用户进行下年度开账
- 区分开账类型：首次开账 vs 次年度开账，显示不同提示信息

**业务流程**:
1. 年终关账（如 2025 年）→ 自动生成 2026 年开账准备数据
2. 系统提示用户进行 2026 年度开账
3. 用户进入期初开账页面，核对自动结转的数据
4. 确认开账日期，完成开账
5. 开账后可以正常录入 2026 年度的业务数据

**效果**:
- 关账后自动准备下年度开账数据
- 引导用户完成年度切换
- 保证财务数据连续性
- 期末余额自动转为期初余额

---

### 48. 单据录入前开账状态检查
**请求**: 录入单据时，如果没有开账，需要提示用户开账，才能正常录入信息
**状态**: ✅ 已完成
**详情**:
**业务场景**: 用户在未开账的情况下尝试录入销售单或采购单时，系统应提示用户先完成期初开账

**修复内容**:
- 更新 `src/views/sales/SalesDialog.vue`
  - 添加 `getInitialStatus` 导入和 `useRouter`
  - 对话框打开时检查开账状态
  - 未开账时显示警告对话框
  - 提供"前往开账"快捷按钮，跳转到期初开账页面
- 更新 `src/views/purchase/PurchaseDialog.vue`
  - 添加 `getInitialStatus` 导入和 `useRouter`
  - 对话框打开时检查开账状态
  - 未开账时显示警告对话框
  - 提供"前往开账"快捷按钮，跳转到期初开账页面

**功能特点**:
- 实时检查：打开对话框时自动检查开账状态
- 友好提示：未开账时显示清晰的警告信息
- 快捷操作：提供一键跳转到开账页面的按钮
- 阻止操作：未开账时关闭对话框，无法录入单据

**效果**:
- 确保用户必须先完成期初开账才能进行业务操作
- 引导新用户按正确流程使用系统
- 避免未开账导致的业务数据混乱

---

### 49. 系统设置添加联系方式及销售单打印优化
**请求**: 在系统设置里的基本设置添加联系方式，同时在打印销售清单时，公司名称和联系方式要在票据上显示，并在最后加上一行，备注:收货后如有异常请于7天内通知，否则我公司不予受理，谢谢理解.，要显示出来。
**状态**: ✅ 已完成
**详情**:
**业务场景**: 系统需要维护公司基本信息（公司名称、联系电话、联系地址），并在销售单打印时显示这些信息和免责声明

**修复内容**:
- 更新 `src/views/system/SystemSettings.vue`
  - 添加"联系电话"输入框
  - 添加"联系地址"输入框
  - 添加 `loadBasicSettings()` 从 localStorage 加载设置
  - 更新 `handleSaveBasic()` 保存设置到 localStorage
- 更新 `src/views/sales/SalesDialog.vue`
  - 更新 `handlePrint()` 打印函数
  - 从 localStorage 读取系统设置中的公司信息
  - 打印标题显示公司名称
  - 打印底部显示公司信息（公司名称、地址、电话）
  - 添加7天免责声明提示框

**新增存储键**:
- `cc_erp_system_settings` - 系统设置数据
  - 结构: `{ systemName, systemShortName, companyName, contactPhone, contactAddress, version }`

**打印效果**:
```
[公司名称] - 销售单
客户：XXX    销售日期：2026-03-03    交货日期：2026-03-05

+------------+------+------+-------+
| 商品明细表...                  |
+------------+------+------+-------+

---------------------------------
[公司名称]
地址：XXX
电话：XXX

┌──────────────────────────────────┐
│ 备注：收货后如有异常请于7天内   │
│ 通知，否则我公司不予受理，谢谢   │
│ 理解.                            │
└──────────────────────────────────┘

制单人：__________  审核人：__________  日期：2026-03-03
```

**效果**:
- 用户可以在系统设置中维护公司信息
- 销售单打印自动显示公司信息和联系方式
- 免责声明清晰标注7天异议期

---

### 50. 单据打印模板重新设计
**请求**: 参考清单模板.png，重新设计单据打印样式
**状态**: ✅ 已完成
**详情**:
**业务场景**: 优化销售单和采购单的打印模板，使其更符合实际业务单据的样式

**修复内容**:
- 更新 `src/views/sales/SalesDialog.vue` - `handlePrint()`
  - 公司名称作为大标题居中显示
  - "送货清单"作为主标题，带下划线
  - 客户信息、日期、单号在一行显示
  - 表格列：序号、产品名称、规格型号、单位、数量、备注、单价、金额
  - 表格自动补齐至8行（不足时显示空行）
  - 合计金额同时显示数字和中文大写
  - 备注信息带边框
  - 签字区域：制单人、仓管员、客户签收
  - 底部显示地址、电话、日期
- 更新 `src/views/purchase/PurchaseDialog.vue` - `handlePrint()`
  - 同样的模板样式，标题为"采购单"
  - 供应商信息替代客户信息
  - 签字区域：制单人、仓管员、供应商

**打印模板布局**:
```
┌─────────────────────────────────────┐
│         广东XXX智能装备有限公司        │
├─────────────────────────────────────┤
│            送货清单                   │
├─────────────────────────────────────┤
│ 客户名称：XXX    日期：2026-03-03    │
│ 单号：No.12345678                    │
├──┬──┬────┬──┬──┬──┬──┬──┬──┤
│序│产品│规格│单位│数量│备注│单价│金额│
│号│名称│型号│    │    │    │    │    │
├──┼──┼────┼──┼──┼──┼──┼──┼──┤
│  │... │... │.  │.  │    │.  │.  │
├──┴──┴────┴──┴──┴──┴──┴──┴──┤
│ 合计：¥1,000.00 (壹仟元整)      │
├─────────────────────────────────────┤
│ 备注：...                          │
├─────────────────────────────────────┤
│ 制单人：____  仓管员：____  客户：_ │
├─────────────────────────────────────┤
│ 地址：XXX    电话：XXX    日期：XXX │
└─────────────────────────────────────┘
```

**效果**:
- 打印模板更符合实际业务单据样式
- 表格自动补齐，便于手写填写
- 中文大写金额增加专业性
- 签字区域规范，便于责任确认

---

### 51. 商品选择支持规格区分和模糊查找
**请求**: 新增销售单和采购订单时，选择商品后，规格也需要可以选择，同时支持模糊查找功能，因为我同一名称商品，会有很多不同规格商品，需要对应选择
**状态**: ✅ 已完成
**详情**:
**业务场景**: 同一商品名称存在多种规格（如不同尺寸、型号等），用户需要精确选择具体的规格商品

**修复内容**:
- 更新 `src/views/sales/SalesDialog.vue`
  - 商品选择下拉框显示格式：`商品编码 - 商品名称 (规格)`
  - 已启用 `filterable` 属性支持模糊查找
  - 规格信息在商品名称后以灰色括号显示
  - 选择后自动填充规格、单位、价格等信息
- 更新 `src/views/purchase/PurchaseDialog.vue`
  - 商品选择下拉框显示格式：`商品编码 - 商品名称 (规格)`
  - 已启用 `filterable` 属性支持模糊查找
  - 规格信息在商品名称后以灰色括号显示
  - 选择后自动填充规格、单位、采购价等信息

**商品选择示例**:
```
下拉框选项：
- P00001 - 螺丝A (M6)
- P00001 - 螺丝A (M8)
- P00001 - 螺丝A (M10)
- P00002 - 螺母B (M6)
- P00002 - 螺母B (M8)
```

**效果**:
- 用户可以通过输入商品名称或编码进行模糊搜索
- 同一商品的不同规格可以清晰区分
- 选择后规格自动填充，无需手动输入
- 提高开单效率和准确性

---

### 52. 商品分类管理Excel导入导出功能
**请求**: 商品分类管理 添加excel 导入导出功能
**状态**: ✅ 已完成
**详情**:

**业务场景**: 用户需要批量导入商品分类数据，或将现有分类数据导出备份

**实现内容**:
- 更新 `src/views/product/CategoryDialog.vue`
  - 添加 Excel 操作下拉按钮（导出数据、导入数据、下载模板）
  - 添加隐藏的文件输入控件支持导入
  - 实现 `handleExport()` - 导出分类数据到 Excel
  - 实现 `handleImport()` - 触发文件选择对话框
  - 实现 `handleFileChange()` - 处理 Excel 文件导入
  - 实现 `handleDownloadTemplate()` - 下载导入模板

**Excel 列配置**:
| 列名 | 必填 | 说明 |
|:---|:---:|:---|
| 分类名称 | ✅ | 商品分类名称 |

**导入逻辑**:
- 自动跳过重复的分类名称
- 自动跳过空行或无效数据
- 导入完成后显示成功/跳过数量统计
- 导入的数据自动保存到 localStorage

**效果**:
- 支持批量导入分类，提高数据录入效率
- 支持导出分类数据，便于备份和迁移
- 提供标准模板，确保数据格式正确

---

### 53. Excel导入重复数据检查功能
**请求**: 商品分类，商品管理，客户管理，供应商管理，有Excel 导入的地方 ，导入的内容与原内容一致，不需要显示多次，只保存一次即可
**状态**: ✅ 已完成
**详情**:

**业务场景**: 用户多次导入同一 Excel 文件时，不应重复创建已存在的数据

**实现内容**:

**商品分类管理** (`src/views/product/CategoryDialog.vue`):
- 查重规则：按分类名称
- 导入前检查分类名称是否已存在
- 存在则跳过，不创建重复分类

**商品管理** (`src/views/product/ProductList.vue`):
- 查重规则：按商品编码 或 商品名称+规格组合
- 导入前获取现有商品列表进行比对
- 存在则跳过，不创建重复商品

**客户管理** (`src/views/customer/CustomerList.vue`):
- 查重规则：按客户编码 或 客户名称
- 导入前获取现有客户列表进行比对
- 存在则跳过，不创建重复客户

**供应商管理** (`src/views/supplier/SupplierList.vue`):
- 查重规则：按供应商编码 或 供应商名称
- 导入前获取现有供应商列表进行比对
- 存在则跳过，不创建重复供应商

**导入统计优化**:
```
导入完成：成功 X 条，跳过 X 条（重复），失败 X 条
```

**效果**:
- 避免数据重复，保证数据唯一性
- 同一文件多次导入不会产生重复数据
- 清晰的导入统计反馈

---

### 54. 正式环境配置
**请求**: 安装 PostgreSQL 配置正式环境，把需要的相关配置，全部配置完成，我需要直接进行正式测试，不需要任何模拟情况
**状态**: ✅ 已完成
**详情**:

**安装内容**:
- PostgreSQL 16.13 安装配置
- 数据库 `cc_erp` 创建
- 数据库迁移脚本执行（Flyway）
- 初始管理员用户创建

**环境配置**:
- 数据库：PostgreSQL 16.13
- 数据库名：cc_erp
- 用户名：postgres
- 密码：postgres
- 后端端口：8080
- 后端服务地址：http://localhost:8080/api

**初始化用户**:
- 用户名：admin
- 密码：admin123

**效果**:
- 系统可在正式环境下运行
- 数据持久化到 PostgreSQL 数据库
- 无需模拟模式

---

### 55. 后端编译错误修复
**请求**: 修复后端代码编译错误，使服务能正常启动
**状态**: ✅ 已完成
**详情**:

**修复内容**:

**BaseEntity** - 添加 `id` 字段：
- 添加 `private Long id;` 字段
- 解决所有实体类 getId() 方法缺失问题

**SysUser 实体** - 添加密码方法：
- 添加 `getPassword()` / `setPassword()` 方法映射到 `passwordHash`
- 添加 `getPasswordHash()` / `setPasswordHash()` 方法

**SysUserMapper** - 添加缺失方法：
- `int delete(Long id)` - 删除用户
- `List<SysUser> findList(String keyword, Boolean status)` - 查询用户列表

**FinPayable 实体** - 添加缺失字段：
- `orderType` (String)
- `orderId` (Long)
- `orderNo` (String)
- `balance` (Long)
- 添加对应 setter 方法

**InvStockMapper** - 添加缺失方法：
- `findByProductAndWarehouse(Long productId, Long warehouseId)`
- `findList(String productCode, String productName, Long warehouseId, String keyword)`
- `findAlertStocks()`

**BusinessException** - 添加静态方法：
- `badRequest()` - 返回 "请求参数错误"
- `notFound()` - 返回 "资源不存在"

**PurchaseService** - 修复类型转换：
- BigDecimal 转 Long（金额乘以100）
- 状态字段类型修正

**结果**:
- 所有 67 个 Java 源文件编译成功
- 后端服务正常启动

---

### 56. 移除前端模拟模式自动切换
**请求**: 移除前端自动切换到模拟模式的逻辑，使用正式后端服务
**状态**: ✅ 已完成
**详情**:

**业务场景**: 用户希望使用正式后端服务进行测试，不需要模拟模式自动切换

**修改内容**:

**src/store/user.js**:
- 移除登录失败时自动切换模拟模式的逻辑
- 移除网络错误检测和自动切换代码
- 登录失败时直接抛出错误，不再自动启用模拟模式

**src/utils/request.js**:
- 添加注释说明模拟模式已禁用
- 保留模拟模式功能（通过登录页面的模拟模式复选框手动启用）

**效果**:
- 前端默认连接正式后端服务
- 登录失败时显示真实错误信息
- 需要模拟模式时可在登录页面手动勾选

---

## 文件变更记录

### 新增文件
- `DEPLOYMENT.md` - 部署文档
- `QUICKSTART.md` - 快速启动指南
- `update-opening-date.html` - 开账日期修复脚本
- `init_user.sql` - 初始化用户脚本
- `create_database.sql` - 数据库创建脚本
- `src/utils/excel.js` - Excel工具
- `src/utils/validate.js` - 表单验证规则
- `src/utils/format.js` - 数据格式化工具
- `src/utils/error.js` - 错误处理
- `src/components/TestDataManager.vue` - 测试数据管理组件
- `src/components/PermissionButton.vue` - 权限按钮组件
- `src/views/customer/CustomerList.vue` - 客户列表
- `src/views/customer/CustomerDialog.vue` - 客户对话框
- `src/views/supplier/SupplierList.vue` - 供应商列表
- `src/views/supplier/SupplierDialog.vue` - 供应商对话框
- `src/views/warehouse/WarehouseList.vue` - 仓库列表
- `src/views/warehouse/WarehouseDialog.vue` - 仓库对话框
- `src/views/system/UserList.vue` - 用户管理
- `src/views/system/UserDialog.vue` - 用户编辑对话框
- `src/views/system/AssignRoleDialog.vue` - 角色分配对话框
- `src/views/system/PermissionList.vue` - 权限管理
- `src/views/system/PermissionDialog.vue` - 权限编辑对话框
- `src/views/system/MenuList.vue` - 菜单管理
- `src/views/system/MenuDialog.vue` - 菜单编辑对话框
- `src/views/system/SystemSettings.vue` - 系统设置
- `src/views/finance/InitialBalance.vue` - 期初开账
- `src/views/finance/AnnualClosing.vue` - 年终关账
- `src/directives/permission.js` - 权限指令
- `src/api/warehouse.js` - 仓库API
- `src/api/permission.js` - 权限API
- `src/api/initial.js` - 期初开账API
- `src/api/annualClosing.js` - 年终关账API

### 修改的主要文件
- `src/store/user.js` - 添加模拟模式自动切换
- `src/views/Login.vue` - 添加模拟模式复选框
- `src/api/auth.js` - 添加模拟模式支持
- `src/api/product.js` - 添加模拟模式和自动生成编码
- `src/api/customer.js` - 添加模拟模式和自动生成编码
- `src/api/supplier.js` - 添加模拟模式和自动生成编码
- `src/api/purchase.js` - 添加模拟模式支持
- `src/api/sales.js` - 添加模拟模式支持
- `src/views/product/ProductList.vue` - Excel导入导出
- `src/views/product/ProductDialog.vue` - 自动生成编码、单位默认值
- `src/views/product/CategoryDialog.vue` - 分类管理，**Excel导入导出功能**
- `src/views/customer/CustomerDialog.vue` - 字段调整
- `src/views/supplier/SupplierDialog.vue` - 自动生成编码
- `src/views/sales/SalesDialog.vue` - 允许负库存出库，显示当前库存，清除硬编码数据
- `src/views/purchase/PurchaseDialog.vue` - 清除硬编码数据，从 localStorage 加载真实数据
- `src/router/index.js` - 添加客户和供应商路由
- `src/views/Layout.vue` - 集成测试数据管理器、菜单更新、**隐藏测试数据按钮**、添加年终关账菜单
- `src/views/Home.vue` - 使用真实数据更新首页统计和图表
- `src/api/finance.js` - 使用 localStorage 存储财务数据，清除硬编码
- `src/views/finance/ReceivableList.vue` - 清除硬编码数据
- `src/views/finance/PayableList.vue` - 清除硬编码数据
- `src/views/finance/ReceiptList.vue` - 清除硬编码数据
- `src/views/finance/PaymentList.vue` - 清除硬编码数据
- `src/views/finance/InvoiceList.vue` - 清除硬编码数据
- `src/views/report/Index.vue` - 从 localStorage 加载筛选数据，清除硬编码
- `src/components/TestDataManager.vue` - 修复函数初始化顺序问题，添加财务数据统计
- `src/main.js` - 注册权限指令和组件
- `package.json` - 添加xlsx依赖，调整vite依赖位置
- `src/api/report.js` - 从真实业务数据计算报表，清除所有硬编码模拟数据
- `src/views/report/Index.vue` - 完善查询功能（快速时间选择、多维度筛选、自动加载）
- `src/views/report/reports/SalesReport.vue` - 支持动态数据和loading
- `src/views/report/reports/PurchaseReport.vue` - 支持动态数据和loading
- `src/views/report/reports/InventoryReport.vue` - 支持动态数据和loading
- `src/views/report/reports/FinanceReport.vue` - 支持动态数据和loading，修复图标
- `src/views/report/reports/PerformanceReport.vue` - 支持动态数据和loading
- `src/views/report/reports/InventoryReport.vue` - 支持动态数据和loading
- `src/views/report/reports/FinanceReport.vue` - 支持动态数据和loading
- `src/views/report/reports/PerformanceReport.vue` - 支持动态数据和loading
- `src/views/product/CategoryDialog.vue` - 清除默认分类虚拟数据
- `src/views/product/ProductList.vue` - 清除默认分类虚拟数据
- `src/components/TestDataManager.vue` - 清除恢复默认分类代码
- `src/utils/request.js` - 清空所有硬编码模拟数据
- `src/api/warehouse.js` - 清除默认仓库和库存虚拟数据
- `src/views/report/reports/SalesReport.vue` - 清除默认数据
- `src/views/report/reports/PurchaseReport.vue` - 清除默认数据
- `src/views/report/reports/InventoryReport.vue` - 清除默认数据
- `src/views/report/reports/FinanceReport.vue` - 清除默认数据
- `src/views/report/reports/PerformanceReport.vue` - 清除默认数据
- `src/views/inventory/StockList.vue` - 清除硬编码库存数据
- `src/views/sales/SalesDetailDialog.vue` - 清除模拟订单数据
- `src/views/sales/SalesList.vue` - 清除硬编码销售订单数据
- `src/views/report/reports/InventoryReport.vue` - 清除图表硬编码数据
- `src/views/report/reports/FinanceReport.vue` - 清除图表硬编码数据
- `src/views/report/reports/PerformanceReport.vue` - 清除图表硬编码数据
- `src/views/sales/SalesDialog.vue` - 添加客户累计金额功能（历史累计、累计总额、打印显示）
- `src/views/purchase/PurchaseDialog.vue` - 添加供应商累计金额功能（历史累计、累计总额、打印显示）
- `src/api/auth.js` - 移除硬编码admin/admin123，从localStorage读取真实用户验证
- `src/api/permission.js` - 移除默认管理员角色和用户硬编码数据
- `src/api/annualClosing.js` - 关账时生成下年度开账数据，添加次年度开账API
- `src/views/Login.vue` - 添加系统初始化流程，移除默认账号提示
- `src/views/finance/InitialBalance.vue` - 添加日期限制（禁用未来日期），移除自动填充，**支持次年度开账**
- `src/views/finance/AnnualClosing.vue` - 添加@change事件自动加载汇总，对话框关闭时重置表单，**关账后提示下年度开账**
- `src/views/sales/SalesDialog.vue` - 添加客户累计金额功能（历史累计、累计总额、打印显示），**添加开账状态检查，打印显示公司信息和免责声明，重新设计打印模板，商品选择支持规格区分和模糊查找**
- `src/views/purchase/PurchaseDialog.vue` - 添加供应商累计金额功能（历史累计、累计总额、打印显示），**添加开账状态检查，重新设计打印模板，商品选择支持规格区分和模糊查找**
- `src/views/system/SystemSettings.vue` - **添加联系电话和联系地址字段，支持保存到 localStorage**
- `src/views/customer/CustomerList.vue` - **Excel导入添加重复数据检查（按客户编码或名称）**
- `src/views/supplier/SupplierList.vue` - **Excel导入添加重复数据检查（按供应商编码或名称）**
- `src/views/product/ProductList.vue` - **Excel导入添加重复数据检查（按商品编码或名称+规格）**
- `src/store/user.js` - **移除模拟模式自动切换逻辑，使用正式后端服务**
- `src/utils/request.js` - **禁用模拟模式自动切换**
- `src/utils/excel.js` - **优化Excel导入解析，过滤说明行和无效数据**
- `cc-erp-backend/src/main/java/com/cc/erp/entity/BaseEntity.java` - **添加 id 字段**
- `cc-erp-backend/src/main/java/com/cc/erp/entity/SysUser.java` - **添加密码相关方法**
- `cc-erp-backend/src/main/java/com/cc/erp/mapper/SysUserMapper.java` - **添加缺失方法**
- `cc-erp-backend/src/main/java/com/cc/erp/entity/FinPayable.java` - **添加缺失字段和setter**
- `cc-erp-backend/src/main/java/com/cc/erp/mapper/InvStockMapper.java` - **添加缺失方法**
- `cc-erp-backend/src/main/java/com/cc/erp/exception/BusinessException.java` - **添加静态方法**
- `cc-erp-backend/src/main/java/com/cc/erp/service/PurchaseService.java` - **修复类型转换**

---

## 功能清单

### 已实现功能
- [x] 用户登录/登出（含模拟模式）
- [x] 商品管理（CRUD + 分类管理 + Excel导入导出 + **重复数据检查**）
- [x] 客户管理（CRUD + Excel导入导出 + **重复数据检查**）
- [x] 供应商管理（CRUD + Excel导入导出 + **重复数据检查**）
- [x] 仓库管理（CRUD + 库存分布查看）
- [x] 采购管理（列表、创建、审核、**默认当天日期**、**打印功能**、**累计金额**）
- [x] 销售管理（列表、创建、审核、作废、**默认当天日期**、**打印功能**、**累计金额**）
- [x] 库存管理（列表、调整、流水）
- [x] 财务管理（应收应付、收付款、发票、**期初开账**、**年终关账**）
- [x] 报表统计（销售、采购、库存、财务、业绩）
- [x] 用户管理（CRUD、角色分配、密码重置）
- [x] 角色权限管理（角色CRUD + 权限配置）
- [x] 菜单管理（CRUD、树形展示、图标预览）
- [x] 系统设置（基本设置、安全设置、数据字典、操作日志）
- [x] 期初开账（期初库存、应收应付、现金余额、开账确认）
- [x] 年终关账（年度关账、数据锁定、反结账）
- [x] 测试数据管理（统计、清空、导出导入）
- [x] 模拟数据模式（手动切换、数据持久化）
- [x] 数据验证增强（通用验证规则）
- [x] 错误处理优化（统一错误处理）
- [x] 累计金额管理（客户累计、供应商累计、打印显示）
- [x] **正式环境配置（PostgreSQL + 后端服务）**
- [x] **后端编译错误修复**
- [x] **前端正式模式（禁用自动切换模拟）**

### 待完善功能
- [ ] 后端 API 完善（部分接口待实现）

---

## 版本历史

### v1.2.0 (2026-03-04)
- ✅ 正式环境配置（PostgreSQL 16 + 后端服务）
- ✅ 后端编译错误修复
- ✅ 移除前端模拟模式自动切换
- ✅ Excel导入重复数据检查功能
- ✅ 商品分类Excel导入导出功能

### v1.1.0 (2025-xx-xx)
- 年终关账功能
- 期初开账日期限制优化
- 年终关账后次年度开账功能
- 单据录入前开账状态检查
- 系统设置添加联系方式及销售单打印优化
- 单据打印模板重新设计
- 商品选择支持规格区分和模糊查找

### v1.0.0 (2025-xx-xx)
- CC-ERP 企业管理系统初始版本
- 用户登录/登出
- 商品、客户、供应商管理
- 采购、销售、库存管理
- 财务管理和报表统计
- 用户权限和菜单管理

---

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

---

## 存储键说明

| 键名 | 用途 |
|:---|:---|
| `cc_erp_categories` | 商品分类 |
| `cc_erp_initial_balance` | 期初开账数据 |
| `cc_erp_cumulative_amounts` | 客户/供应商累计金额 |
| `cc_erp_annual_closing` | 年终关账记录 |
| `cc_erp_next_year_opening` | 下年度开账准备数据 |
| `cc_erp_system_settings` | 系统设置（公司信息） |
| `cc_erp_test_products` | 商品测试数据 |
| `cc_erp_test_customers` | 客户测试数据 |
| `cc_erp_test_suppliers` | 供应商测试数据 |
| `cc_erp_test_warehouses` | 仓库测试数据 |
| `cc_erp_test_warehouse_stocks` | 仓库库存测试数据 |
| `cc_erp_test_users` | 用户测试数据 |
| `cc_erp_test_roles` | 角色测试数据 |
| `cc_erp_test_permissions` | 权限测试数据 |
| `cc_erp_test_purchase_orders` | 采购订单测试数据 |
| `cc_erp_test_sales_orders` | 销售订单测试数据 |
| `cc_erp_test_inventory` | 库存测试数据 |
| `cc_erp_test_finance` | 财务测试数据 |
| `mockMode` | 模拟模式标记 |
| `token` | 用户令牌 |
| `userInfo` | 用户信息 |

---

## 访问地址
- **前端**: http://localhost:5176/
- **后端API**: http://localhost:8080/api
- **数据库**: PostgreSQL 16 @ localhost:5432/cc_erp
- **默认登录**: admin / admin123
