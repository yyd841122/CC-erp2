package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存表实体
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class InvStock extends SoftDeleteEntity {

    private static final long serialVersionUID = 1L;

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
     * 仓库ID
     */
    private Long warehouseId;

    /**
     * 仓库名称
     */
    private String warehouseName;

    /**
     * 库存数量
     */
    private Integer quantity;

    /**
     * 最小库存
     */
    private Integer minStock;

    /**
     * 最大库存
     */
    private Integer maxStock;

    /**
     * 平均成本(分)
     */
    private Long avgCost;

    /**
     * 最近入库日期
     */
    private String lastInDate;

    /**
     * 最近出库日期
     */
    private String lastOutDate;
}
