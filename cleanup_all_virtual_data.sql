-- =============================================
-- CC ERP 系统全面清理虚拟数据脚本
-- 执行方式: 在 pgAdmin 或 psql 中连接 cc_erp 数据库后执行
-- =============================================

-- 显示清理前的数据统计
SELECT '========== 清理前数据统计 ==========' AS info;
SELECT '商品分类' AS module, COUNT(*) AS count FROM biz_product_category WHERE is_deleted = false
UNION ALL
SELECT '商品' AS module, COUNT(*) AS count FROM biz_product WHERE is_deleted = false
UNION ALL
SELECT '仓库' AS module, COUNT(*) AS count FROM biz_warehouse WHERE is_deleted = false
UNION ALL
SELECT '客户' AS module, COUNT(*) AS count FROM biz_customer WHERE is_deleted = false
UNION ALL
SELECT '供应商' AS module, COUNT(*) AS count FROM biz_supplier WHERE is_deleted = false
UNION ALL
SELECT '采购订单' AS module, COUNT(*) AS count FROM pur_order WHERE is_deleted = false
UNION ALL
SELECT '销售订单' AS module, COUNT(*) AS count FROM sal_order WHERE is_deleted = false
UNION ALL
SELECT '会计期间' AS module, COUNT(*) AS count FROM fin_period;

-- 1. 清理预设商品分类 (CAT001-CAT004)
SELECT '清理预设商品分类...' AS info;
UPDATE biz_product_category
SET is_deleted = true,
    updated_at = CURRENT_TIMESTAMP
WHERE category_code IN ('CAT001', 'CAT002', 'CAT003', 'CAT004');

-- 2. 清理预设仓库 (WH001)
SELECT '清理预设仓库...' AS info;
UPDATE biz_warehouse
SET is_deleted = true,
    updated_at = CURRENT_TIMESTAMP
WHERE warehouse_code = 'WH001';

-- 3. 清理预设会计期间 (2024年)
SELECT '清理预设会计期间...' AS info;
DELETE FROM fin_period WHERE period_code LIKE '2024-%';

-- 4. 清理预设部门（除了总公司，保留系统必需）
-- DELETE FROM sys_dept WHERE id > 1;  -- 可选：是否删除预设部门

-- 5. 清理预设角色（除了系统管理员，保留系统必需）
-- DELETE FROM sys_role WHERE id > 1;  -- 可选：是否删除预设角色

-- 显示清理后的数据统计
SELECT '========== 清理后数据统计 ==========' AS info;
SELECT '商品分类' AS module, COUNT(*) AS count FROM biz_product_category WHERE is_deleted = false
UNION ALL
SELECT '商品' AS module, COUNT(*) AS count FROM biz_product WHERE is_deleted = false
UNION ALL
SELECT '仓库' AS module, COUNT(*) AS count FROM biz_warehouse WHERE is_deleted = false
UNION ALL
SELECT '客户' AS module, COUNT(*) AS count FROM biz_customer WHERE is_deleted = false
UNION ALL
SELECT '供应商' AS module, COUNT(*) AS count FROM biz_supplier WHERE is_deleted = false
UNION ALL
SELECT '采购订单' AS module, COUNT(*) AS count FROM pur_order WHERE is_deleted = false
UNION ALL
SELECT '销售订单' AS module, COUNT(*) AS count FROM sal_order WHERE is_deleted = false
UNION ALL
SELECT '会计期间' AS module, COUNT(*) AS count FROM fin_period;

SELECT '========== 清理完成！ ==========' AS info;
