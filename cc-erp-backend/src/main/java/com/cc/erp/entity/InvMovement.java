package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存流水记录
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class InvMovement extends SoftDeleteEntity {

    /**
     * 流水单号
     */
    private String movementNo;

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
     * 移动类型: in-入库, out-出库, adjust-调整, transfer-调拨
     */
    private String movementType;

    /**
     * 业务类型
     */
    private String businessType;

    /**
     * 数量
     */
    private Integer quantity;

    /**
     * 变动前库存
     */
    private Integer beforeStock;

    /**
     * 变动后库存
     */
    private Integer afterStock;

    /**
     * 单价
     */
    private Long unitPrice;

    /**
     * 金额
     */
    private Long amount;

    /**
     * 关联单据ID
     */
    private Long referenceId;

    /**
     * 关联单据号
     */
    private String referenceNo;

    /**
     * 备注
     */
    private String remark;
}
