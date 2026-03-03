package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 财务付款记录
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FinPayment extends SoftDeleteEntity {

    /**
     * 付款单号
     */
    private String paymentNo;

    /**
     * 供应商ID
     */
    private Long supplierId;

    /**
     * 供应商名称
     */
    private String supplierName;

    /**
     * 应付ID
     */
    private Long payableId;

    /**
     * 付款日期
     */
    private String paymentDate;

    /**
     * 付款金额
     */
    private Long amount;

    /**
     * 付款方式: cash-现金, bank-银行转账, alipay-支付宝, wechat-微信
     */
    private String paymentMethod;

    /**
     * 付款账户
     */
    private String bankAccount;

    /**
     * 经手人ID
     */
    private Long handlerId;

    /**
     * 经手人姓名
     */
    private String handlerName;

    /**
     * 备注
     */
    private String remark;
}
