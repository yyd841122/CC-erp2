package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 销售单主表实体
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SalOrder extends SoftDeleteEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 销售单ID
     */
    private Long id;

    /**
     * 销售单号
     */
    private String orderNo;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 客户名称
     */
    private String customerName;

    /**
     * 仓库ID
     */
    private Long warehouseId;

    /**
     * 仓库名称
     */
    private String warehouseName;

    /**
     * 销售金额(分)
     */
    private Long totalAmount;

    /**
     * 税额(分)
     */
    private Long taxAmount;

    /**
     * 含税金额(分)
     */
    private Long finalAmount;

    /**
     * 已收款金额(分)
     */
    private Long paymentAmount;

    /**
     * 销售日期
     */
    private String orderDate;

    /**
     * 交货日期
     */
    private String deliveryDate;

    /**
     * 状态: 0-草稿, 1-待审核, 2-已审核, 3-已出库, 9-已作废
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
