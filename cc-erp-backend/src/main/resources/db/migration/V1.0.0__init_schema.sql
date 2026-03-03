-- CC ERP 数据库初始化脚本
-- 版本: V1.0.0
-- 作者: CC ERP Team
-- 日期: 2024-03-01

-- =============================================
-- 系统权限模块
-- =============================================

-- 部门表
CREATE TABLE IF NOT EXISTS sys_dept (
    id BIGSERIAL PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    parent_id BIGINT DEFAULT 0,
    sort_order INT DEFAULT 0,
    leader VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(50),
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE sys_dept IS '部门表';
COMMENT ON COLUMN sys_dept.id IS '部门ID';
COMMENT ON COLUMN sys_dept.dept_name IS '部门名称';
COMMENT ON COLUMN sys_dept.parent_id IS '父部门ID';
COMMENT ON COLUMN sys_dept.sort_order IS '排序';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    sort_order INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE sys_role IS '角色表';
COMMENT ON COLUMN sys_role.role_code IS '角色编码';
COMMENT ON COLUMN sys_role.role_name IS '角色名称';

-- 权限表
CREATE TABLE IF NOT EXISTS sys_permission (
    id BIGSERIAL PRIMARY KEY,
    perm_code VARCHAR(100) UNIQUE NOT NULL,
    perm_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(20) NOT NULL,
    resource_path VARCHAR(200),
    method VARCHAR(10),
    parent_id BIGINT DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE sys_permission IS '权限表';
COMMENT ON COLUMN sys_permission.perm_code IS '权限编码';
COMMENT ON COLUMN sys_permission.perm_name IS '权限名称';
COMMENT ON COLUMN sys_permission.resource_type IS '资源类型: menu-菜单, button-按钮, api-接口';

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    real_name VARCHAR(50),
    nick_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    gender SMALLINT DEFAULT 0,
    dept_id BIGINT REFERENCES sys_dept(id),
    avatar VARCHAR(500),
    status SMALLINT DEFAULT 1,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE sys_user IS '用户表';
COMMENT ON COLUMN sys_user.username IS '用户名';
COMMENT ON COLUMN sys_user.password_hash IS '密码哈希';
COMMENT ON COLUMN sys_user.real_name IS '真实姓名';
COMMENT ON COLUMN sys_user.status IS '状态: 1-正常, 0-禁用';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user(id),
    role_id BIGINT NOT NULL REFERENCES sys_role(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);
COMMENT ON TABLE sys_user_role IS '用户角色关联表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS sys_role_permission (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES sys_role(id),
    permission_id BIGINT NOT NULL REFERENCES sys_permission(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);
COMMENT ON TABLE sys_role_permission IS '角色权限关联表';

-- =============================================
-- 基础数据模块
-- =============================================

-- 仓库表
CREATE TABLE IF NOT EXISTS biz_warehouse (
    id BIGSERIAL PRIMARY KEY,
    warehouse_code VARCHAR(50) UNIQUE NOT NULL,
    warehouse_name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    manager_id BIGINT REFERENCES sys_user(id),
    manager_name VARCHAR(50),
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    status SMALLINT DEFAULT 1,
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES sys_user(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE biz_warehouse IS '仓库表';
COMMENT ON COLUMN biz_warehouse.warehouse_code IS '仓库编码';
COMMENT ON COLUMN biz_warehouse.is_default IS '是否默认仓库';

-- 商品分类表
CREATE TABLE IF NOT EXISTS biz_product_category (
    id BIGSERIAL PRIMARY KEY,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    parent_id BIGINT DEFAULT 0,
    level SMALLINT DEFAULT 1,
    sort_order INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES sys_user(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE biz_product_category IS '商品分类表';

-- 商品表
CREATE TABLE IF NOT EXISTS biz_product (
    id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category_id BIGINT REFERENCES biz_product_category(id),
    category_name VARCHAR(100),
    spec VARCHAR(100),
    unit VARCHAR(20),
    cost_price DECIMAL(10,2) DEFAULT 0,
    sale_price DECIMAL(10,2) DEFAULT 0,
    min_stock INT DEFAULT 0,
    max_stock INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    remark VARCHAR(500),
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES sys_user(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE biz_product IS '商品表';
COMMENT ON COLUMN biz_product.product_code IS '商品编码';
COMMENT ON COLUMN biz_product.min_stock IS '最低库存预警';

-- 客户表
CREATE TABLE IF NOT EXISTS biz_customer (
    id BIGSERIAL PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(200),
    credit_limit DECIMAL(12,2) DEFAULT 0,
    sales_id BIGINT REFERENCES sys_user(id),
    sales_name VARCHAR(50),
    level SMALLINT DEFAULT 1,
    source VARCHAR(50),
    status SMALLINT DEFAULT 1,
    remark VARCHAR(500),
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES sys_user(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE biz_customer IS '客户表';
COMMENT ON COLUMN biz_customer.customer_code IS '客户编码';
COMMENT ON COLUMN biz_customer.credit_limit IS '信用额度';

-- 供应商表
CREATE TABLE IF NOT EXISTS biz_supplier (
    id BIGSERIAL PRIMARY KEY,
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(200),
    credit_period INT DEFAULT 0,
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    tax_number VARCHAR(50),
    status SMALLINT DEFAULT 1,
    remark VARCHAR(500),
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES sys_user(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE biz_supplier IS '供应商表';
COMMENT ON COLUMN biz_supplier.supplier_code IS '供应商编码';
COMMENT ON COLUMN biz_supplier.credit_period IS '账期(天)';

-- =============================================
-- 采购模块
-- =============================================

-- 采购单状态枚举: 0-草稿, 1-待审核, 2-已审核, 3-已入库, 9-已作废
CREATE TABLE IF NOT EXISTS pur_order (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    supplier_id BIGINT NOT NULL REFERENCES biz_supplier(id),
    supplier_name VARCHAR(100),
    warehouse_id BIGINT REFERENCES biz_warehouse(id),
    warehouse_name VARCHAR(100),
    total_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) DEFAULT 0,
    payment_amount DECIMAL(12,2) DEFAULT 0,
    order_date DATE NOT NULL,
    expected_date DATE,
    status SMALLINT DEFAULT 0,
    remark VARCHAR(500),
    approved_by BIGINT REFERENCES sys_user(id),
    approved_at TIMESTAMP,
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES sys_user(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    version INT DEFAULT 0
);
COMMENT ON TABLE pur_order IS '采购单主表';
COMMENT ON COLUMN pur_order.status IS '状态: 0-草稿, 1-待审核, 2-已审核, 3-已入库, 9-已作废';

CREATE TABLE IF NOT EXISTS pur_order_item (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES pur_order(id),
    product_id BIGINT REFERENCES biz_product(id),
    product_code VARCHAR(50),
    product_name VARCHAR(200),
    spec VARCHAR(100),
    unit VARCHAR(20),
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    received_qty INT DEFAULT 0,
    remark VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE pur_order_item IS '采购单明细';

-- 采购入库单
CREATE TABLE IF NOT EXISTS pur_receipt (
    id BIGSERIAL PRIMARY KEY,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT REFERENCES pur_order(id),
    order_no VARCHAR(50),
    warehouse_id BIGINT REFERENCES biz_warehouse(id),
    warehouse_name VARCHAR(100),
    receipt_date DATE NOT NULL,
    total_qty INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    remark VARCHAR(500),
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE pur_receipt IS '采购入库单';

-- =============================================
-- 销售模块
-- =============================================

-- 销售单状态枚举: 0-草稿, 1-待审核, 2-已审核, 3-已出库, 9-已作废
CREATE TABLE IF NOT EXISTS sal_order (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES biz_customer(id),
    customer_name VARCHAR(100),
    warehouse_id BIGINT REFERENCES biz_warehouse(id),
    warehouse_name VARCHAR(100),
    total_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) DEFAULT 0,
    payment_amount DECIMAL(12,2) DEFAULT 0,
    order_date DATE NOT NULL,
    delivery_date DATE,
    status SMALLINT DEFAULT 0,
    remark VARCHAR(500),
    approved_by BIGINT REFERENCES sys_user(id),
    approved_at TIMESTAMP,
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES sys_user(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    version INT DEFAULT 0
);
COMMENT ON TABLE sal_order IS '销售单主表';
COMMENT ON COLUMN sal_order.status IS '状态: 0-草稿, 1-待审核, 2-已审核, 3-已出库, 9-已作废';

CREATE TABLE IF NOT EXISTS sal_order_item (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES sal_order(id),
    product_id BIGINT REFERENCES biz_product(id),
    product_code VARCHAR(50),
    product_name VARCHAR(200),
    spec VARCHAR(100),
    unit VARCHAR(20),
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    shipped_qty INT DEFAULT 0,
    remark VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE sal_order_item IS '销售单明细';

-- 销售出库单
CREATE TABLE IF NOT EXISTS sal_shipment (
    id BIGSERIAL PRIMARY KEY,
    shipment_no VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT REFERENCES sal_order(id),
    order_no VARCHAR(50),
    warehouse_id BIGINT REFERENCES biz_warehouse(id),
    warehouse_name VARCHAR(100),
    shipment_date DATE NOT NULL,
    total_qty INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    remark VARCHAR(500),
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE sal_shipment IS '销售出库单';

-- =============================================
-- 库存模块
-- =============================================

-- 库存表
CREATE TABLE IF NOT EXISTS inv_stock (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL REFERENCES biz_warehouse(id),
    product_id BIGINT NOT NULL REFERENCES biz_product(id),
    product_code VARCHAR(50),
    product_name VARCHAR(200),
    quantity INT DEFAULT 0,
    locked_qty INT DEFAULT 0,
    available_qty INT DEFAULT 0,
    avg_cost DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, product_id)
);
COMMENT ON TABLE inv_stock IS '库存表';
COMMENT ON COLUMN inv_stock.quantity IS '库存数量';
COMMENT ON COLUMN inv_stock.locked_qty IS '锁定数量(预占)';
COMMENT ON COLUMN inv_stock.available_qty IS '可用数量';

-- 库存变动流水
CREATE TABLE IF NOT EXISTS inv_movement (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    warehouse_name VARCHAR(100),
    product_id BIGINT NOT NULL,
    product_code VARCHAR(50),
    product_name VARCHAR(200),
    movement_type VARCHAR(20) NOT NULL,
    before_qty INT DEFAULT 0,
    change_qty INT NOT NULL,
    after_qty INT NOT NULL,
    order_no VARCHAR(50),
    order_type VARCHAR(20),
    cost_price DECIMAL(10,2),
    remark VARCHAR(200),
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE inv_movement IS '库存变动流水';
COMMENT ON COLUMN inv_movement.movement_type IS '变动类型: purchase-采购入库, sale-销售出库, transfer-调拨, check-盘点, adjust-调整';

-- 库存预警表
CREATE TABLE IF NOT EXISTS inv_alert (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT REFERENCES biz_warehouse(id),
    warehouse_name VARCHAR(100),
    product_id BIGINT NOT NULL REFERENCES biz_product(id),
    product_code VARCHAR(50),
    product_name VARCHAR(200),
    alert_type VARCHAR(20) NOT NULL,
    current_qty INT DEFAULT 0,
    alert_qty INT DEFAULT 0,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE inv_alert IS '库存预警表';
COMMENT ON COLUMN inv_alert.alert_type IS '预警类型: low-低库存, high-高库存, zero-零库存';

-- =============================================
-- 财务模块
-- =============================================

-- 应收账款
CREATE TABLE IF NOT EXISTS fin_receivable (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES biz_customer(id),
    customer_name VARCHAR(100),
    order_id BIGINT,
    order_type VARCHAR(20),
    order_no VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    balance DECIMAL(12,2) NOT NULL,
    due_date DATE,
    status SMALLINT DEFAULT 0,
    remark VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE fin_receivable IS '应收账款';
COMMENT ON COLUMN fin_receivable.status IS '状态: 0-未结清, 1-部分结清, 2-已结清';

-- 应付账款
CREATE TABLE IF NOT EXISTS fin_payable (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL REFERENCES biz_supplier(id),
    supplier_name VARCHAR(100),
    order_id BIGINT,
    order_type VARCHAR(20),
    order_no VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    balance DECIMAL(12,2) NOT NULL,
    due_date DATE,
    status SMALLINT DEFAULT 0,
    remark VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE fin_payable IS '应付账款';
COMMENT ON COLUMN fin_payable.status IS '状态: 0-未结清, 1-部分结清, 2-已结清';

-- 收款单
CREATE TABLE IF NOT EXISTS fin_receipt (
    id BIGSERIAL PRIMARY KEY,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT REFERENCES biz_customer(id),
    customer_name VARCHAR(100),
    receivable_id BIGINT REFERENCES fin_receivable(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(20),
    receipt_date DATE NOT NULL,
    status SMALLINT DEFAULT 1,
    remark VARCHAR(200),
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE fin_receipt IS '收款单';

-- 付款单
CREATE TABLE IF NOT EXISTS fin_payment (
    id BIGSERIAL PRIMARY KEY,
    payment_no VARCHAR(50) UNIQUE NOT NULL,
    supplier_id BIGINT REFERENCES biz_supplier(id),
    supplier_name VARCHAR(100),
    payable_id BIGINT REFERENCES fin_payable(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(20),
    payment_date DATE NOT NULL,
    status SMALLINT DEFAULT 1,
    remark VARCHAR(200),
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
COMMENT ON TABLE fin_payment IS '付款单';

-- 发票管理
CREATE TABLE IF NOT EXISTS fin_invoice (
    id BIGSERIAL PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(20) NOT NULL,
    invoice_date DATE NOT NULL,
    order_id BIGINT,
    order_type VARCHAR(20),
    order_no VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    status SMALLINT DEFAULT 0,
    remark VARCHAR(200),
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES sys_user(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE fin_invoice IS '发票管理';
COMMENT ON COLUMN fin_invoice.invoice_type IS '发票类型: in-进项, out-销项';

-- 会计期间
CREATE TABLE IF NOT EXISTS fin_period (
    id BIGSERIAL PRIMARY KEY,
    period_code VARCHAR(20) UNIQUE NOT NULL,
    period_name VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    closed_by BIGINT REFERENCES sys_user(id),
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE fin_period IS '会计期间';

-- =============================================
-- CRM 模块
-- =============================================

-- 客户跟进记录
CREATE TABLE IF NOT EXISTS crm_followup (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES biz_customer(id),
    customer_name VARCHAR(100),
    followup_type VARCHAR(20),
    content TEXT,
    followup_date DATE NOT NULL,
    next_date DATE,
    created_by BIGINT REFERENCES sys_user(id),
    created_by_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE crm_followup IS '客户跟进记录';
COMMENT ON COLUMN crm_followup.followup_type IS '跟进类型: phone-电话, visit-拜访, wechat-微信, other-其他';

-- =============================================
-- 索引创建
-- =============================================

-- 系统用户表索引
CREATE INDEX IF NOT EXISTS idx_sys_user_username ON sys_user(username);
CREATE INDEX IF NOT EXISTS idx_sys_user_dept ON sys_user(dept_id);
CREATE INDEX IF NOT EXISTS idx_sys_user_status ON sys_user(status);

-- 商品表索引
CREATE INDEX IF NOT EXISTS idx_biz_product_category ON biz_product(category_id);
CREATE INDEX IF NOT EXISTS idx_biz_product_code ON biz_product(product_code);
CREATE INDEX IF NOT EXISTS idx_biz_product_enabled ON biz_product(is_enabled);

-- 采购单索引
CREATE INDEX IF NOT EXISTS idx_pur_order_no ON pur_order(order_no);
CREATE INDEX IF NOT EXISTS idx_pur_order_supplier ON pur_order(supplier_id);
CREATE INDEX IF NOT EXISTS idx_pur_order_status ON pur_order(status);
CREATE INDEX IF NOT EXISTS idx_pur_order_date ON pur_order(order_date);

-- 销售单索引
CREATE INDEX IF NOT EXISTS idx_sal_order_no ON sal_order(order_no);
CREATE INDEX IF NOT EXISTS idx_sal_order_customer ON sal_order(customer_id);
CREATE INDEX IF NOT EXISTS idx_sal_order_status ON sal_order(status);
CREATE INDEX IF NOT EXISTS idx_sal_order_date ON sal_order(order_date);

-- 库存表索引
CREATE INDEX IF NOT EXISTS idx_inv_stock_product ON inv_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_stock_warehouse ON inv_stock(warehouse_id);

-- 库存变动索引
CREATE INDEX IF NOT EXISTS idx_inv_movement_product ON inv_movement(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_movement_date ON inv_movement(created_at);
CREATE INDEX IF NOT EXISTS idx_inv_movement_type ON inv_movement(movement_type);

-- 应收应付索引
CREATE INDEX IF NOT EXISTS idx_fin_receivable_customer ON fin_receivable(customer_id);
CREATE INDEX IF NOT EXISTS idx_fin_receivable_status ON fin_receivable(status);
CREATE INDEX IF NOT EXISTS idx_fin_payable_supplier ON fin_payable(supplier_id);
CREATE INDEX IF NOT EXISTS idx_fin_payable_status ON fin_payable(status);

-- CRM索引
CREATE INDEX IF NOT EXISTS idx_crm_followup_customer ON crm_followup(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_followup_date ON crm_followup(followup_date);
