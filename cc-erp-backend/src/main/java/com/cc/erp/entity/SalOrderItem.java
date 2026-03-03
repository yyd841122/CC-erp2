package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 销售订单明细
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SalOrderItem extends BaseEntity {

    /**
     * 销售单ID
     */
    private Long orderId;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * 商品编码
     */
    private String productCode;

    /**
     * 商品名称
     */
    private String productName;

    /**
     * 规格型号
     */
    private String spec;

    /**
     * 单位
     */
    private String unit;

    /**
     * 销售数量
     */
    private Integer quantity;

    /**
     * 销售单价
     */
    private Long price;

    /**
     * 税率(%)
     */
    private Integer taxRate;

    /**
     * 小计金额
     */
    private Long subtotal;

    /**
     * 税额
     */
    private Long taxAmount;

    /**
     * 含税金额
     */
    private Long finalAmount;
}
