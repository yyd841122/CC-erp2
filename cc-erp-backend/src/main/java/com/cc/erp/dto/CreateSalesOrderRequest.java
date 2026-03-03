package com.cc.erp.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 创建销售单请求
 *
 * @author CC ERP Team
 */
@Data
public class CreateSalesOrderRequest {

    /**
     * 客户ID
     */
    @NotNull(message = "客户不能为空")
    private Long customerId;

    /**
     * 仓库ID
     */
    @NotNull(message = "仓库不能为空")
    private Long warehouseId;

    /**
     * 销售日期
     */
    @NotNull(message = "销售日期不能为空")
    private String orderDate;

    /**
     * 交货日期
     */
    private String deliveryDate;

    /**
     * 销售明细
     */
    @NotEmpty(message = "销售明细不能为空")
    private List<OrderItemRequest> items;

    /**
     * 备注
     */
    private String remark;

    @Data
    public static class OrderItemRequest {
        /**
         * 商品ID
         */
        @NotNull(message = "商品不能为空")
        private Long productId;

        /**
         * 销售数量
         */
        @NotNull(message = "数量不能为空")
        private Integer quantity;

        /**
         * 销售单价
         */
        @NotNull(message = "单价不能为空")
        private Long price;

        /**
         * 税率(%)
         */
        private Integer taxRate;
    }
}
