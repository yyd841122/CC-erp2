-- CC-ERP 初始化管理员用户
-- 密码: admin123

-- 先插入角色
INSERT INTO sys_role (id, role_code, role_name, description, sort_order, status, created_at, updated_at)
VALUES (1, 'ROLE_ADMIN', '系统管理员', '拥有系统所有权限', 1, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 插入管理员用户 (密码: admin123, BCrypt哈希)
INSERT INTO sys_user (id, username, password_hash, real_name, status, created_at, updated_at)
VALUES (1, 'admin', '$2a$10$EnwIb5wRdnfJVoCV2FNP..ftPgmKXm1C4BYS.0gSgnIgKmDq6453S', '系统管理员', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 分配角色给用户
INSERT INTO sys_user_role (user_id, role_id)
VALUES (1, 1)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 验证用户创建成功
SELECT 'Admin user created successfully!' AS result;
SELECT id, username, real_name, status FROM sys_user WHERE username='admin';
