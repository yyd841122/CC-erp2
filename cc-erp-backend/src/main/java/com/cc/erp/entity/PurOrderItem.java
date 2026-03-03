package com.cc.erp.entity;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 采购单明细实体
 *
 * @author CC ERP Team
 */
@Data
public class PurOrderItem implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 明细ID
     */
    private Long id;

    /**
     * 采购单ID
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
     * 规格
     */
    private String spec;

    /**
     * 单位
     */
    private String unit;

    /**
     * 数量
     */
    private Integer quantity;

    /**
     * 单价
     */
    private java.math.BigDecimal price;

    /**
     * 税率
     */
    private java.math.BigDecimal taxRate;

    /**
     * 小计(不含税)
     */
    private java.math.BigDecimal subtotal;

    /**
     * 税额
     */
    private java.math.BigDecimal taxAmount;

    /**
     * 含税金额
     */
    private java.math.BigDecimal finalAmount;

    /**
     * 已入库数量
     */
    private Integer receivedQty;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}
