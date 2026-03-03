package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购单主表实体
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class PurOrder extends SoftDeleteEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 采购单ID
     */
    private Long id;

    /**
     * 采购单号
     */
    private String orderNo;

    /**
     * 供应商ID
     */
    private Long supplierId;

    /**
     * 供应商名称
     */
    private String supplierName;

    /**
     * 仓库ID
     */
    private Long warehouseId;

    /**
     * 仓库名称
     */
    private String warehouseName;

    /**
     * 采购金额
     */
    private java.math.BigDecimal totalAmount;

    /**
     * 税额
     */
    private java.math.BigDecimal taxAmount;

    /**
     * 含税金额
     */
    private java.math.BigDecimal finalAmount;

    /**
     * 已付款金额
     */
    private java.math.BigDecimal paymentAmount;

    /**
     * 采购日期
     */
    private java.time.LocalDate orderDate;

    /**
     * 预计到货日期
     */
    private java.time.LocalDate expectedDate;

    /**
     * 状态: 0-草稿, 1-待审核, 2-已审核, 3-已入库, 9-已作废
     */
    private Integer status;

    /**
     * 备注
     */
    private String remark;

    /**
     * 审核人ID
     */
    private Long approvedBy;

    /**
     * 审核时间
     */
    private java.time.LocalDateTime approvedAt;

    /**
     * 版本号(乐观锁)
     */
    private Integer version;
}
