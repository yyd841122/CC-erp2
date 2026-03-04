package com.cc.erp.service;

import com.cc.erp.dto.CreatePurchaseOrderRequest;
import com.cc.erp.entity.*;
import com.cc.erp.exception.BusinessException;
import com.cc.erp.mapper.*;
import com.cc.erp.vo.PurchaseOrderDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 采购服务
 *
 * @author CC ERP Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurOrderMapper purOrderMapper;
    private final PurOrderItemMapper purOrderItemMapper;
    private final BizProductMapper bizProductMapper;
    private final InvStockMapper invStockMapper;
    private final FinPayableMapper finPayableMapper;

    /**
     * 创建采购单
     */
    @Transactional(rollbackFor = Exception.class)
    public PurchaseOrderDTO createOrder(CreatePurchaseOrderRequest request) {
        // 1. 生成采购单号
        String orderNo = generateOrderNo();

        // 2. 计算金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;

        for (CreatePurchaseOrderRequest.OrderItemDTO item : request.getItems()) {
            BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            BigDecimal itemTax = subtotal.multiply(item.getTaxRate()).divide(BigDecimal.valueOf(100));
            totalAmount = totalAmount.add(subtotal);
            taxAmount = taxAmount.add(itemTax);
        }

        BigDecimal finalAmount = totalAmount.add(taxAmount);

        // 3. 创建采购单主表
        PurOrder order = new PurOrder();
        order.setOrderNo(orderNo);
        order.setSupplierId(request.getSupplierId());
        order.setWarehouseId(request.getWarehouseId());
        order.setOrderDate(request.getOrderDate());
        order.setExpectedDate(request.getExpectedDate());
        order.setTotalAmount(totalAmount);
        order.setTaxAmount(taxAmount);
        order.setFinalAmount(finalAmount);
        order.setStatus(0); // 草稿
        order.setRemark(request.getRemark());
        order.setCreatedAt(LocalDateTime.now());
        order.setVersion(0);

        purOrderMapper.insert(order);

        // 4. 创建采购单明细
        AtomicInteger sort = new AtomicInteger(1);
        for (CreatePurchaseOrderRequest.OrderItemDTO item : request.getItems()) {
            // 查询商品信息
            BizProduct product = bizProductMapper.findById(item.getProductId());
            if (product == null) {
                throw new BusinessException("商品不存在: " + item.getProductId());
            }

            // 计算明细金额
            BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            BigDecimal itemTax = subtotal.multiply(item.getTaxRate()).divide(BigDecimal.valueOf(100));
            BigDecimal itemFinal = subtotal.add(itemTax);

            PurOrderItem orderItem = new PurOrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(item.getProductId());
            orderItem.setProductCode(product.getProductCode());
            orderItem.setProductName(product.getProductName());
            orderItem.setSpec(product.getSpec());
            orderItem.setUnit(product.getUnit());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());
            orderItem.setTaxRate(item.getTaxRate());
            orderItem.setSubtotal(subtotal);
            orderItem.setTaxAmount(itemTax);
            orderItem.setFinalAmount(itemFinal);
            orderItem.setReceivedQty(0);
            orderItem.setRemark(item.getRemark());
            orderItem.setCreatedAt(LocalDateTime.now());

            purOrderItemMapper.insert(orderItem);
        }

        log.info("创建采购单成功: {}", orderNo);

        return convertToDTO(order);
    }

    /**
     * 审核采购单
     */
    @Transactional(rollbackFor = Exception.class)
    public void approveOrder(Long id) {
        // 1. 查询采购单
        PurOrder order = purOrderMapper.findById(id);
        if (order == null) {
            throw BusinessException.notFound("采购单不存在");
        }

        // 2. 检查状态
        if (order.getStatus() != 1) {
            throw BusinessException.badRequest("只有待审核的单据才能审核");
        }

        // 3. 更新状态（带乐观锁）
        order.setStatus(2); // 已审核
        order.setApprovedAt(LocalDateTime.now());
        int rows = purOrderMapper.approve(order);
        if (rows == 0) {
            throw new BusinessException("单据已被其他人修改，请刷新后重试");
        }

        // 4. 生成应付账款
        FinPayable payable = new FinPayable();
        payable.setSupplierId(order.getSupplierId());
        payable.setOrderType("purchase");
        payable.setOrderId(order.getId());
        payable.setOrderNo(order.getOrderNo());
        // 转换BigDecimal到Long（分）
        payable.setAmount(order.getFinalAmount().multiply(new java.math.BigDecimal("100")).longValue());
        payable.setPaidAmount(0L);
        payable.setBalance(order.getFinalAmount().multiply(new java.math.BigDecimal("100")).longValue());
        payable.setStatus("unpaid"); // 未结清
        payable.setCreatedAt(LocalDateTime.now());
        payable.setUpdatedAt(LocalDateTime.now());

        finPayableMapper.insert(payable);

        log.info("审核采购单成功: {}", order.getOrderNo());
    }

    /**
     * 根据ID查询采购单
     */
    public PurchaseOrderDTO getOrderById(Long id) {
        PurOrder order = purOrderMapper.findById(id);
        if (order == null) {
            throw BusinessException.notFound("采购单不存在");
        }
        return convertToDTO(order);
    }

    /**
     * 生成采购单号
     * 格式: PUR-yyyyMMdd-4位流水号
     */
    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "PUR-" + dateStr + "-";

        // 查询当天最大的流水号
        // 这里简化处理，实际应该使用分布式锁或序列生成器
        int serial = (int) (System.currentTimeMillis() % 10000);
        return prefix + String.format("%04d", serial);
    }

    /**
     * 转换为 DTO
     */
    private PurchaseOrderDTO convertToDTO(PurOrder order) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(order.getId());
        dto.setOrderNo(order.getOrderNo());
        dto.setSupplierId(order.getSupplierId());
        dto.setSupplierName(order.getSupplierName());
        dto.setWarehouseId(order.getWarehouseId());
        dto.setWarehouseName(order.getWarehouseName());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setFinalAmount(order.getFinalAmount());
        dto.setOrderDate(order.getOrderDate());
        dto.setExpectedDate(order.getExpectedDate());
        dto.setStatus(order.getStatus());
        dto.setRemark(order.getRemark());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }
}
