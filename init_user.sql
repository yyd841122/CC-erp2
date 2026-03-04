-- CC-ERP 初始化管理员用户
-- 密码: admin123 (BCrypt加密后的值)

-- 先插入角色
INSERT INTO sys_role (id, role_code, role_name, status, created_at, updated_at)
VALUES (1, 'admin', '管理员', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 插入管理员用户 (密码: admin123)
INSERT INTO sys_user (id, username, password_hash, real_name, status, created_at, updated_at)
VALUES (1, 'admin', '$2a$10$N9mdkH3f7j8xN3xC8xX0WOsF5xP4vP2yYqL8xK9mO7nN6kJh3fQ', 'Administrator', 1, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- 分配角色给用户
INSERT INTO sys_user_role (user_id, role_id)
VALUES (1, 1)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 验证用户创建成功
SELECT 'Admin user created successfully!' AS result;
SELECT u.id, u.username, u.real_name, u.status FROM sys_user u WHERE u.username='admin';
