-- CC ERP 初始数据脚本
-- 版本: V1.0.1
-- 说明: 插入默认管理员、角色、权限等初始数据

-- =============================================
-- 初始化部门
-- =============================================
INSERT INTO sys_dept (id, dept_name, parent_id, sort_order, status) VALUES
(1, '总公司', 0, 1, 1),
(2, '技术部', 1, 1, 1),
(3, '销售部', 1, 2, 1),
(4, '财务部', 1, 3, 1)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 初始化角色
-- =============================================
INSERT INTO sys_role (id, role_code, role_name, description, sort_order, status) VALUES
(1, 'ROLE_ADMIN', '系统管理员', '拥有系统所有权限', 1, 1),
(2, 'ROLE_OWNER', '企业主', '拥有业务数据全部权限', 2, 1),
(3, 'ROLE_SALESMAN', '销售员', '仅销售相关权限', 3, 1),
(4, 'ROLE_WAREHOUSE', '仓库管理员', '仅库存相关权限', 4, 1),
(5, 'ROLE_ACCOUNTANT', '财务', '仅财务相关权限', 5, 1)
ON CONFLICT (role_code) DO NOTHING;

-- =============================================
-- 初始化权限
-- =============================================
INSERT INTO sys_permission (perm_code, perm_name, resource_type, resource_path, method, parent_id, sort_order) VALUES
-- 系统管理
('system:user', '用户管理', 'menu', '/system/user', 'GET', 0, 101),
('system:role', '角色管理', 'menu', '/system/role', 'GET', 0, 102),
('system:dept', '部门管理', 'menu', '/system/dept', 'GET', 0, 103),
('system:permission', '权限管理', 'menu', '/system/permission', 'GET', 0, 104),

-- 基础数据
('base:product', '商品管理', 'menu', '/base/product', 'GET', 0, 201),
('base:product:create', '新增商品', 'button', '/api/v1/products', 'POST', 201, 2011),
('base:product:update', '编辑商品', 'button', '/api/v1/products/*', 'PUT', 201, 2012),
('base:product:delete', '删除商品', 'button', '/api/v1/products/*', 'DELETE', 201, 2013),
('base:customer', '客户管理', 'menu', '/base/customer', 'GET', 0, 202),
('base:supplier', '供应商管理', 'menu', '/base/supplier', 'GET', 0, 203),
('base:warehouse', '仓库管理', 'menu', '/base/warehouse', 'GET', 0, 204),

-- 采购管理
('purchase:order', '采购单管理', 'menu', '/purchase/order', 'GET', 0, 301),
('purchase:order:create', '新增采购单', 'button', '/api/v1/purchase-orders', 'POST', 301, 3011),
('purchase:order:approve', '审核采购单', 'button', '/api/v1/purchase-orders/*/approve', 'PUT', 301, 3012),
('purchase:receipt', '采购入库', 'menu', '/purchase/receipt', 'GET', 0, 302),

-- 销售管理
('sales:order', '销售单管理', 'menu', '/sales/order', 'GET', 0, 401),
('sales:order:create', '新增销售单', 'button', '/api/v1/sales-orders', 'POST', 401, 4011),
('sales:order:approve', '审核销售单', 'button', '/api/v1/sales-orders/*/approve', 'PUT', 401, 4012),
('sales:shipment', '销售出库', 'menu', '/sales/shipment', 'GET', 0, 402),

-- 库存管理
('inventory:stock', '库存查询', 'menu', '/inventory/stock', 'GET', 0, 501),
('inventory:movement', '库存流水', 'menu', '/inventory/movement', 'GET', 0, 502),
('inventory:alert', '库存预警', 'menu', '/inventory/alert', 'GET', 0, 503),
('inventory:check', '库存盘点', 'menu', '/inventory/check', 'GET', 0, 504),

-- 财务管理
('finance:receivable', '应收账款', 'menu', '/finance/receivable', 'GET', 0, 601),
('finance:payable', '应付账款', 'menu', '/finance/payable', 'GET', 0, 602),
('finance:receipt', '收款管理', 'menu', '/finance/receipt', 'GET', 0, 603),
('finance:payment', '付款管理', 'menu', '/finance/payment', 'GET', 0, 604),
('finance:invoice', '发票管理', 'menu', '/finance/invoice', 'GET', 0, 605),

-- 报表统计
('report:sales', '销售报表', 'menu', '/report/sales', 'GET', 0, 701),
('report:purchase', '采购报表', 'menu', '/report/purchase', 'GET', 0, 702),
('report:inventory', '库存报表', 'menu', '/report/inventory', 'GET', 0, 703),
('report:finance', '财务报表', 'menu', '/report/finance', 'GET', 0, 704)
ON CONFLICT (perm_code) DO NOTHING;

-- 为管理员角色分配所有权限
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 1, id FROM sys_permission
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================
-- 初始化管理员用户 (密码: admin123)
-- =============================================
INSERT INTO sys_user (id, username, password_hash, real_name, dept_id, status) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 1, 1)
ON CONFLICT (username) DO NOTHING;

-- 为管理员分配角色
INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1)
ON CONFLICT (user_id, role_id) DO NOTHING;
