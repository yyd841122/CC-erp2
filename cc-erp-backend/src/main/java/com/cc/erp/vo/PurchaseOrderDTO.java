package com.cc.erp.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 采购单 DTO
 *
 * @author CC ERP Team
 */
@Data
public class PurchaseOrderDTO {

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
    private BigDecimal totalAmount;

    /**
     * 税额
     */
    private BigDecimal taxAmount;

    /**
     * 含税金额
     */
    private BigDecimal finalAmount;

    /**
     * 采购日期
     */
    private LocalDate orderDate;

    /**
     * 预计到货日期
     */
    private LocalDate expectedDate;

    /**
     * 状态: 0-草稿, 1-待审核, 2-已审核, 3-已入库, 9-已作废
     */
    private Integer status;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}
