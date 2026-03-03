package com.cc.erp.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 库存调整请求
 *
 * @author CC ERP Team
 */
@Data
public class StockAdjustRequest {

    /**
     * 商品ID
     */
    @NotNull(message = "商品不能为空")
    private Long productId;

    /**
     * 仓库ID
     */
    @NotNull(message = "仓库不能为空")
    private Long warehouseId;

    /**
     * 调整类型: in-入库, out-出库, loss-损溢
     */
    @NotEmpty(message = "调整类型不能为空")
    private String adjustType;

    /**
     * 调整数量
     */
    @NotNull(message = "调整数量不能为空")
    private Integer adjustQuantity;

    /**
     * 调整单价
     */
    @NotNull(message = "调整单价不能为空")
    private Long adjustPrice;

    /**
     * 调整原因
     */
    @NotEmpty(message = "调整原因不能为空")
    private String reason;

    /**
     * 备注
     */
    private String remark;
}
