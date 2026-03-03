package com.cc.erp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 创建采购单请求
 *
 * @author CC ERP Team
 */
@Data
public class CreatePurchaseOrderRequest {

    /**
     * 供应商ID
     */
    @NotNull(message = "供应商不能为空")
    private Long supplierId;

    /**
     * 仓库ID
     */
    @NotNull(message = "仓库不能为空")
    private Long warehouseId;

    /**
     * 采购日期
     */
    @NotNull(message = "采购日期不能为空")
    private LocalDate orderDate;

    /**
     * 预计到货日期
     */
    private LocalDate expectedDate;

    /**
     * 采购明细
     */
    @NotNull(message = "采购明细不能为空")
    private List<OrderItemDTO> items;

    /**
     * 备注
     */
    private String remark;

    @Data
    public static class OrderItemDTO {
        /**
         * 商品ID
         */
        @NotNull(message = "商品不能为空")
        private Long productId;

        /**
         * 数量
         */
        @NotNull(message = "数量不能为空")
        private Integer quantity;

        /**
         * 单价
         */
        @NotNull(message = "单价不能为空")
        private BigDecimal price;

        /**
         * 税率
         */
        private BigDecimal taxRate = BigDecimal.ZERO;

        /**
         * 备注
         */
        private String remark;
    }
}
