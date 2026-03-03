package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 财务应付账款
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FinPayable extends SoftDeleteEntity {

    /**
     * 应付单号
     */
    private String payableNo;

    /**
     * 供应商ID
     */
    private Long supplierId;

    /**
     * 供应商名称
     */
    private String supplierName;

    /**
     * 业务类型
     */
    private String businessType;

    /**
     * 关联单据ID
     */
    private Long referenceId;

    /**
     * 关联单据号
     */
    private String referenceNo;

    /**
     * 应付金额
     */
    private Long totalAmount;

    /**
     * 已付金额
     */
    private Long paidAmount;

    /**
     * 应付日期
     */
    private String payableDate;

    /**
     * 到期日期
     */
    private String dueDate;

    /**
     * 状态: unpaid-未结算, partial-部分结算, paid-已结算
     */
    private String status;

    /**
     * 备注
     */
    private String remark;
}
