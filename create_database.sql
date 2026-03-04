-- CC-ERP 数据库初始化脚本
-- 请在 PowerShell 中运行以下命令执行此脚本：
-- & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -f create_database.sql

CREATE DATABASE cc_erp;

\c cc_erp

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 显示数据库信息
SELECT 'Database cc_erp created successfully!' AS result;
