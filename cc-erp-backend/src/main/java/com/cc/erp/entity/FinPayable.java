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
     * 订单类型（用于关联业务订单）
     */
    private String orderType;

    /**
     * 订单ID（用于关联业务订单）
     */
    private Long orderId;

    /**
     * 订单号（用于关联业务订单）
     */
    private String orderNo;

    /**
     * 关联单据ID
     */
    private Long referenceId;

    /**
     * 关联单据号
     */
    private String referenceNo;

    /**
     * 应付金额（别名，与totalAmount相同）
     */
    public void setAmount(Long amount) {
        this.totalAmount = amount;
    }

    public Long getAmount() {
        return this.totalAmount;
    }

    /**
     * 余额（未付金额）
     */
    private Long balance;

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
