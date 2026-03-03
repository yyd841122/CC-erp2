package com.cc.erp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 付款登记请求
 *
 * @author CC ERP Team
 */
@Data
public class PaymentRequest {

    /**
     * 应付ID
     */
    @NotNull(message = "应付ID不能为空")
    private Long payableId;

    /**
     * 付款日期
     */
    @NotNull(message = "付款日期不能为空")
    private String paymentDate;

    /**
     * 付款金额
     */
    @NotNull(message = "付款金额不能为空")
    private Long amount;

    /**
     * 付款方式: cash-现金, bank-银行转账, alipay-支付宝, wechat-微信
     */
    @NotNull(message = "付款方式不能为空")
    private String paymentMethod;

    /**
     * 付款账户
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
