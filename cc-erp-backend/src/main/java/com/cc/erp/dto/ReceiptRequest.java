package com.cc.erp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 收款登记请求
 *
 * @author CC ERP Team
 */
@Data
public class ReceiptRequest {

    /**
     * 应收ID
     */
    @NotNull(message = "应收ID不能为空")
    private Long receivableId;

    /**
     * 收款日期
     */
    @NotNull(message = "收款日期不能为空")
    private String receiptDate;

    /**
     * 收款金额
     */
    @NotNull(message = "收款金额不能为空")
    private Long amount;

    /**
     * 收款方式: cash-现金, bank-银行转账, alipay-支付宝, wechat-微信
     */
    @NotNull(message = "收款方式不能为空")
    private String paymentMethod;

    /**
     * 收款账户
     */
    private String bankAccount;

    /**
     * 经手人姓名
     */
    private String handlerName;

    /**
     * 备注
     */
    private String remark;
}
