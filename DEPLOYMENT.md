# CC-ERP 部署文档

## 📋 目录

1. [系统要求](#系统要求)
2. [环境安装](#环境安装)
3. [数据库配置](#数据库配置)
4. [后端部署](#后端部署)
5. [前端部署](#前端部署)
6. [生产环境部署](#生产环境部署)
7. [常见问题](#常见问题)

---

## 系统要求

### 硬件要求

| 配置项 | 最低要求 | 推荐配置 |
|:---|:---|:---|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 硬盘 | 20GB | 50GB+ SSD |
| 操作系统 | Windows 10/11, Linux, macOS | Windows 11, Ubuntu 20.04+ |

### 软件要求

| 软件 | 版本要求 | 说明 |
|:---|:---|:---|
| JDK | 17+ | 必须使用 JDK 17 |
| Maven | 3.8+ | 构建工具 |
| PostgreSQL | 14+ | 数据库 |
| Node.js | 18+ | 前端构建 |
| npm | 9+ | 包管理器 |

---

## 环境安装

### 1. JDK 17 安装

#### Windows
```bash
# 下载 JDK 17
# Oracle: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
# 或 OpenJDK: https://adoptium.net/

# 安装后配置环境变量
JAVA_HOME=C:\Program Files\Java\jdk-17
Path=%JAVA_HOME%\bin

# 验证安装
java -version
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk

# 验证安装
java -version
```

### 2. Maven 安装

#### Windows
```bash
# 下载 Maven: https://maven.apache.org/download.cgi
# 解压到 C:\Program Files\Apache\maven

# 配置环境变量
MAVEN_HOME=C:\Program Files\Apache\maven
Path=%MAVEN_HOME%\bin

# 验证安装
mvn -version
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt install maven

# 验证安装
mvn -version
```

### 3. PostgreSQL 安装

#### Windows
```bash
# 下载安装程序: https://www.postgresql.org/download/windows/
# 安装时记住设置的密码

# 默认配置
Host: localhost
Port: 5432
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库和用户
CREATE USER cc_erp WITH PASSWORD 'cc_erp123';
CREATE DATABASE cc_erp_db OWNER cc_erp;
GRANT ALL PRIVILEGES ON DATABASE cc_erp_db TO cc_erp;
\q
```

### 4. Node.js 安装

#### Windows
```bash
# 下载安装程序: https://nodejs.org/

# 验证安装
node -v
npm -v
```

#### Linux
```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

---

## 数据库配置

### 1. 创建数据库

```sql
-- 方式一：使用 psql 命令
psql -U postgres

CREATE USER cc_erp WITH PASSWORD 'cc_erp123';
CREATE DATABASE cc_erp_db OWNER cc_erp;
GRANT ALL PRIVILEGES ON DATABASE cc_erp_db TO cc_erp;
\q

-- 方式二：使用 createdb 命令
createdb -U postgres cc_erp_db -O cc_erp
```

### 2. 验证连接

```bash
# 测试数据库连接
psql -U cc_erp -d cc_erp_db -h localhost -W

# 输入密码后，进入 PostgreSQL 命令行
\conninfo    # 查看连接信息
\l           # 列出所有数据库
\q           # 退出
```

---

## 后端部署

### 1. 配置应用文件

编辑 `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cc_erp_db
    username: cc_erp
    password: cc_erp123
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

jwt:
  secret: Y2NlcnAtc2VjcmV0LWtleS0yMDI0LWZvci1qd3QtdG9rZW4tZ2VuZXJhdGlvbg==
  expiration: 86400000    # 24小时 (毫秒)
```

### 2. 构建项目

```bash
# 进入后端目录
cd cc-erp-backend

# 清理并编译
mvn clean compile

# 打包（跳过测试）
mvn clean package -DskipTests

# 生成的 JAR 文件位置: target/cc-erp-1.0.0.jar
```

### 3. 启动服务

#### 开发模式
```bash
cd cc-erp-backend
mvn spring-boot:run
```

#### 生产模式
```bash
# 使用 java 命令运行
java -jar target/cc-erp-1.0.0.jar

# 指定配置文件
java -jar target/cc-erp-1.0.0.jar --spring.profiles.active=prod

# 指定 JVM 参数
java -Xms512m -Xmx1024m -jar target/cc-erp-1.0.0.jar
```

#### 后台运行（Linux）
```bash
# 使用 nohup
nohup java -jar target/cc-erp-1.0.0.jar > app.log 2>&1 &

# 使用 systemd（推荐）
sudo vi /etc/systemd/system/cc-erp.service
```

```ini
[Unit]
Description=CC-ERP Backend Service
After=network.target

[Service]
Type=simple
User=ccerp
WorkingDirectory=/opt/cc-erp/backend
ExecStart=/usr/bin/java -jar /opt/cc-erp/backend/cc-erp-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable cc-erp
sudo systemctl start cc-erp

# 查看状态
sudo systemctl status cc-erp

# 查看日志
sudo journalctl -u cc-erp -f
```

### 4. 验证后端服务

```bash
# 检查服务状态
curl http://localhost:8080/api/health

# 或浏览器访问
# http://localhost:8080/api/health
```

### 5. API 接口文档

后端启动后，Swagger 文档地址:
- http://localhost:8080/swagger-ui.html
- http://localhost:8080/api-docs

---

## 前端部署

### 1. 安装依赖

```bash
cd cc-erp-frontend

# 安装依赖
npm install

# 或使用国内镜像加速
npm install --registry=https://registry.npmmirror.com
```

### 2. 配置 API 地址

编辑 `.env.production`:

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:8080/api

# 或使用生产环境地址
# VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 3. 构建生产版本

```bash
# 构建
npm run build

# 生成的文件在 dist 目录
```

### 4. 部署到 Web 服务器

#### 使用 Nginx（推荐）

安装 Nginx:
```bash
# Ubuntu/Debian
sudo apt install nginx

# Windows: 下载 http://nginx.org/en/download.html
```

配置 Nginx (`/etc/nginx/sites-available/cc-erp`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /opt/cc-erp/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置:
```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/cc-erp /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 使用 Apache

配置文件 (`/etc/apache2/sites-available/cc-erp.conf`):

```apache
<VirtualHost *:80>
    ServerName your-domain.com

    # 前端静态文件
    DocumentRoot /opt/cc-erp/frontend/dist

    <Directory /opt/cc-erp/frontend/dist>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # API 代理
    ProxyPass /api/ http://localhost:8080/api/
    ProxyPassReverse /api/ http://localhost:8080/api/

    # 日志
    ErrorLog ${APACHE_LOG_DIR}/cc-erp-error.log
    CustomLog ${APACHE_LOG_DIR}/cc-erp-access.log combined
</VirtualHost>
```

### 5. 开发模式运行

```bash
cd cc-erp-frontend
npm run dev

# 访问: http://localhost:5173
```

---

## 生产环境部署

### 1. 目录结构

```
/opt/cc-erp/
├── backend/
│   ├── cc-erp-1.0.0.jar
│   └── application-prod.yml
├── frontend/
│   └── dist/
│       ├── index.html
│       ├── assets/
│       └── ...
├── logs/
│   ├── backend.log
│   └── nginx-access.log
└── backups/
    └── database/
```

### 2. 系统服务配置

#### 后端服务 (`/etc/systemd/system/cc-erp-backend.service`)

```ini
[Unit]
Description=CC-ERP Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=ccerp
Group=ccerp
WorkingDirectory=/opt/cc-erp/backend
Environment="JAVA_OPTS=-Xms512m -Xmx1024m"
ExecStart=/usr/bin/java $JAVA_OPTS -jar /opt/cc-erp/backend/cc-erp-1.0.0.jar --spring.profiles.active=prod
ExecStop=/bin/kill -15 $MAINPID
Restart=always
RestartSec=10
StandardOutput=append:/opt/cc-erp/logs/backend.log
StandardError=append:/opt/cc-erp/logs/backend-error.log

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable cc-erp-backend
sudo systemctl start cc-erp-backend
sudo systemctl status cc-erp-backend
```

#### 数据库备份服务

创建备份脚本 `/opt/cc-erp/scripts/backup-db.sh`:

```bash
#!/bin/bash

# 配置
DB_NAME="cc_erp_db"
DB_USER="cc_erp"
BACKUP_DIR="/opt/cc-erp/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cc_erp_db_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump -U $DB_USER -h localhost -d $DB_NAME -F c -f $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

```bash
# 添加到 crontab（每天凌晨2点备份）
crontab -e

# 添加以下行
0 2 * * * /opt/cc-erp/scripts/backup-db.sh
```

### 3. HTTPS 配置（使用 Let's Encrypt）

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

Nginx 配置更新:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置同上...
}
```

### 4. 防火墙配置

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 常见问题

### 1. 端口冲突

**问题**: `Address already in use: 8080`

**解决**:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux
lsof -i :8080
kill -9 <PID>
```

### 2. 数据库连接失败

**问题**: `Connection refused`

**检查**:
```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 检查防火墙
sudo ufw status

# 检查连接
psql -U cc_erp -d cc_erp_db -h localhost
```

### 3. 前端构建失败

**问题**: `npm install` 失败

**解决**:
```bash
# 清除缓存
npm cache clean --force

# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

### 4. 跨域问题

**问题**: 前端访问 API 报 CORS 错误

**解决**: 后端添加 CORS 配置

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "https://your-domain.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true);
    }
}
```

### 5. 内存不足

**问题**: `Java heap space`

**解决**:
```bash
# 增加 JVM 内存
java -Xms1024m -Xmx2048m -jar target/cc-erp-1.0.0.jar
```

---

## 默认账号信息

| 角色 | 用户名 | 密码 |
|:---|:---|:---|
| 系统管理员 | admin | admin123 |
| 数据库用户 | cc_erp | cc_erp123 |

**⚠️ 部署后请立即修改默认密码！**

---

## 联系支持

如遇到部署问题，请检查：
1. 系统日志: `/opt/cc-erp/logs/`
2. Nginx 日志: `/var/log/nginx/`
3. PostgreSQL 日志: `/var/log/postgresql/`
