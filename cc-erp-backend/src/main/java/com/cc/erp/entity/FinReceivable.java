package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 财务应收账款
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FinReceivable extends SoftDeleteEntity {

    /**
     * 应收单号
     */
    private String receivableNo;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 客户名称
     */
    private String customerName;

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
     * 应收金额
     */
    private Long totalAmount;

    /**
     * 已收金额
     */
    private Long paidAmount;

    /**
     * 应收日期
     */
    private String receivableDate;

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
