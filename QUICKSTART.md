# CC-ERP 快速启动指南

## 🚀 5分钟快速启动

### 前置条件检查

```bash
# 检查 Java 版本（需要 17+）
java -version

# 检查 Node.js 版本（需要 18+）
node -v

# 检查 PostgreSQL
psql --version
```

---

## 方式一：开发模式（推荐测试用）

### 1. 启动数据库

```bash
# Windows: 确保 PostgreSQL 服务正在运行
# Services -> PostgreSQL 14-x64 -> Start

# Linux
sudo systemctl start postgresql
```

### 2. 启动后端

```bash
cd e:\CC_ERP\cc-erp-backend

# 如果没有 Maven，使用 IDE（IntelliJ IDEA）打开项目
# 找到 CcErpApplication.java -> 右键 -> Run

# 或使用命令行（需要 Maven）
mvn spring-boot:run
```

等待看到：`Started CcErpApplication in X seconds`

### 3. 启动前端

```bash
cd e:\CC_ERP\cc-erp-frontend

# 首次运行需要安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问：http://localhost:5173

---

## 方式二：使用 IDE 启动（最简单）

### IntelliJ IDEA

1. **启动后端**
   - File -> Open -> 选择 `cc-erp-backend`
   - 等待 Maven 依赖下载完成
   - 找到 `src/main/java/com/cc/erp/CcErpApplication.java`
   - 点击绿色运行按钮 ▶️

2. **启动前端**
   - File -> Open -> 选择 `cc-erp-frontend`
   - 打开终端（Terminal）
   - 运行 `npm install`（首次）
   - 运行 `npm run dev`
   - 或点击 package.json 中的 dev 按钮 ▶️

---

## 默认登录信息

```
用户名: admin
密码: admin123
```

---

## 项目目录结构

```
CC_ERP/
├── cc-erp-backend/          # 后端项目
│   ├── src/main/
│   │   ├── java/com/cc/erp/
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/
│   └── pom.xml
│
├── cc-erp-frontend/         # 前端项目
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── components/     # 公共组件
│   │   ├── router/         # 路由配置
│   │   ├── store/          # 状态管理
│   │   ├── utils/          # 工具函数
│   │   └── views/          # 页面组件
│   ├── package.json
│   └── vite.config.js
│
├── PRD.md                   # 产品需求文档
├── ARCHITECTURE_SPEC.md     # 架构设计文档
├── DESIGN_SPEC.md           # UI 设计文档
└── DEPLOYMENT.md            # 部署文档
```

---

## 常用命令

### 后端

```bash
# 编译
mvn compile

# 运行
mvn spring-boot:run

# 打包
mvn clean package -DskipTests

# 跳过测试运行
mvn clean install -DskipTests
```

### 前端

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

---

## 端口说明

| 服务 | 端口 | 地址 |
|:---|:---|:---|
| 前端开发服务器 | 5173 | http://localhost:5173 |
| 后端 API 服务 | 8080 | http://localhost:8080 |
| PostgreSQL 数据库 | 5432 | jdbc:postgresql://localhost:5432/cc_erp_db |

---

## 首次使用流程

1. **登录系统**
   - 访问 http://localhost:5173
   - 输入 admin/admin123

2. **修改密码**
   - 点击右上角头像 -> 个人设置

3. **创建基础数据**
   - 商品管理 -> 新增商品
   - 客户管理 -> 新增客户
   - 供应商管理 -> 新增供应商

4. **业务操作**
   - 采购管理 -> 新增采购单
   - 销售管理 -> 新增销售单
   - 库存管理 -> 查看库存

---

## 问题排查

### 后端启动失败

```bash
# 检查 Java 版本
java -version
# 需要 17+，当前是 1.8 需要升级

# 检查数据库连接
psql -U cc_erp -d cc_erp_db -h localhost
```

### 前端启动失败

```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules
npm install
```

### 无法连接后端

检查 `vite.config.js` 中的代理配置：
```js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

---

## 下一步

- 📖 阅读完整部署文档：[DEPLOYMENT.md](./DEPLOYMENT.md)
- 🏗️ 查看架构设计：[ARCHITECTURE_SPEC.md](./ARCHITECTURE_SPEC.md)
- 🎨 查看UI设计：[DESIGN_SPEC.md](./DESIGN_SPEC.md)
- 📋 查看产品需求：[PRD.md](./PRD.md)
