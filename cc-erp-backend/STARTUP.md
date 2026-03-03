# 后端服务启动指南

## 环境要求

| 组件 | 版本 | 状态 |
|:---|:---|:---|
| Java | 17+ | ✅ 已安装 (25.0.2) |
| Maven | 3.6+ | ❌ 未安装 |
| PostgreSQL | 12+ | ❌ 未安装 (开发模式可使用 H2) |

---

## 方案一：快速启动（开发模式，使用 H2 内存数据库）

此方案无需安装 Maven 和 PostgreSQL，适合快速测试。

### 步骤 1：安装 Maven

运行项目根目录的安装脚本：
```batch
e:\CC_ERP\install-maven.bat
```

### 步骤 2：启动后端服务

```batch
cd e:\CC_ERP\cc-erp-backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

或使用启动脚本：
```batch
cd e:\CC_ERP\cc-erp-backend
start-dev.bat
```

### 服务地址

- **API 地址**: http://localhost:8080/api
- **H2 控制台**: http://localhost:8080/api/h2-console
  - JDBC URL: `jdbc:h2:mem:cc_erp`
  - 用户名: `sa`
  - 密码: (留空)

---

## 方案二：生产模式（使用 PostgreSQL）

### 步骤 1：安装 PostgreSQL

1. 下载 PostgreSQL 16: https://www.postgresql.org/download/windows/
2. 安装时记住设置的密码（默认: postgres）
3. 创建数据库:
   ```sql
   CREATE DATABASE cc_erp;
   ```

### 步骤 2：配置数据库

编辑 `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cc_erp
    username: postgres
    password: 你的密码
```

### 步骤 3：启动服务

```batch
cd e:\CC_ERP\cc-erp-backend
mvnw.cmd spring-boot:run
```

或使用启动脚本：
```batch
cd e:\CC_ERP\cc-erp-backend
start.bat
```

---

## 常见问题

### Q: Maven 下载很慢？
A: 可以配置国内镜像源，编辑 `~/.m2/settings.xml`

### Q: 端口 8080 被占用？
A: 修改 `application.yml` 中的 `server.port`

### Q: 数据库连接失败？
A: 检查 PostgreSQL 服务是否启动，数据库是否创建

---

## 验证服务启动

访问 http://localhost:8080/api/doc.html 查看API文档

或使用 curl 测试:
```bash
curl http://localhost:8080/api/v1/auth/login -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```
