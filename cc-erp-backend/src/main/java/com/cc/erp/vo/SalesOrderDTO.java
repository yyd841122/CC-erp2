package com.cc.erp.vo;

import lombok.Data;

import java.util.List;

/**
 * 销售单DTO
 *
 * @author CC ERP Team
 */
@Data
public class SalesOrderDTO {

    private Long id;
    private String orderNo;
    private Long customerId;
    private String customerName;
    private Long warehouseId;
    private String warehouseName;
    private String orderDate;
    private String deliveryDate;
    private Long totalAmount;
    private Long taxAmount;
    private Long finalAmount;
    private Integer status;
    private String remark;
    private String createdAt;
    private List<OrderItemDTO> items;

    @Data
    public static class OrderItemDTO {
        private Long id;
        private Long productId;
        private String productCode;
        private String productName;
        private String spec;
        private String unit;
        private Integer quantity;
        private Long price;
        private Integer taxRate;
        private Long subtotal;
    }
}
