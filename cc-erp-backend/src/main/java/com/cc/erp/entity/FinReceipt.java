package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 财务收款记录
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FinReceipt extends SoftDeleteEntity {

    /**
     * 收款单号
     */
    private String receiptNo;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 客户名称
     */
    private String customerName;

    /**
     * 应收ID
     */
    private Long receivableId;

    /**
     * 收款日期
     */
    private String receiptDate;

    /**
     * 收款金额
     */
    private Long amount;

    /**
     * 收款方式: cash-现金, bank-银行转账, alipay-支付宝, wechat-微信
     */
    private String paymentMethod;

    /**
     * 收款账户
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
