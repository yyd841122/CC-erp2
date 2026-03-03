package com.cc.erp.service;

import com.cc.erp.dto.CreateSalesOrderRequest;
import com.cc.erp.entity.BizCustomer;
import com.cc.erp.entity.BizProduct;
import com.cc.erp.entity.BizWarehouse;
import com.cc.erp.entity.FinReceivable;
import com.cc.erp.entity.InvMovement;
import com.cc.erp.entity.InvStock;
import com.cc.erp.entity.SalOrder;
import com.cc.erp.entity.SalOrderItem;
import com.cc.erp.mapper.BizCustomerMapper;
import com.cc.erp.mapper.BizProductMapper;
import com.cc.erp.mapper.BizWarehouseMapper;
import com.cc.erp.mapper.FinReceivableMapper;
import com.cc.erp.mapper.InvMovementMapper;
import com.cc.erp.mapper.InvStockMapper;
import com.cc.erp.mapper.SalOrderItemMapper;
import com.cc.erp.mapper.SalOrderMapper;
import com.cc.erp.exception.BusinessException;
import com.cc.erp.vo.SalesOrderDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * 销售管理服务
 *
 * @author CC ERP Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SalesService {

    private final SalOrderMapper salOrderMapper;
    private final SalOrderItemMapper salOrderItemMapper;
    private final BizCustomerMapper bizCustomerMapper;
    private final BizWarehouseMapper bizWarehouseMapper;
    private final BizProductMapper bizProductMapper;
    private final InvStockMapper invStockMapper;
    private final InvMovementMapper invMovementMapper;
    private final FinReceivableMapper finReceivableMapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * 创建销售单
     */
    @Transactional(rollbackFor = Exception.class)
    public SalesOrderDTO createOrder(CreateSalesOrderRequest request) {
        // 验证客户
        BizCustomer customer = bizCustomerMapper.findById(request.getCustomerId());
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }

        // 验证仓库
        BizWarehouse warehouse = bizWarehouseMapper.findById(request.getWarehouseId());
        if (warehouse == null) {
            throw new BusinessException("仓库不存在");
        }

        // 验证商品并计算金额
        List<SalOrderItem> items = new ArrayList<>();
        Long totalAmount = 0L;
        Long taxAmount = 0L;

        for (CreateSalesOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            BizProduct product = bizProductMapper.findById(itemReq.getProductId());
            if (product == null) {
                throw new BusinessException("商品不存在: " + itemReq.getProductId());
            }

            Integer taxRate = itemReq.getTaxRate() != null ? itemReq.getTaxRate() : 0;
            Long subtotal = itemReq.getQuantity() * itemReq.getPrice();
            Long itemTax = subtotal * taxRate / 100;

            SalOrderItem item = new SalOrderItem();
            item.setProductId(itemReq.getProductId());
            item.setProductCode(product.getProductCode());
            item.setProductName(product.getProductName());
            item.setSpec(product.getSpec());
            item.setUnit(product.getUnit());
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(itemReq.getPrice());
            item.setTaxRate(taxRate);
            item.setSubtotal(subtotal);
            item.setTaxAmount(itemTax);
            item.setFinalAmount(subtotal + itemTax);

            items.add(item);
            totalAmount += subtotal;
            taxAmount += itemTax;
        }

        // 生成销售单号
        String orderNo = generateOrderNo();

        // 创建销售单
        SalOrder order = new SalOrder();
        order.setOrderNo(orderNo);
        order.setCustomerId(request.getCustomerId());
        order.setCustomerName(customer.getCustomerName());
        order.setWarehouseId(request.getWarehouseId());
        order.setWarehouseName(warehouse.getWarehouseName());
        order.setOrderDate(request.getOrderDate());
        order.setDeliveryDate(request.getDeliveryDate());
        order.setTotalAmount(totalAmount);
        order.setTaxAmount(taxAmount);
        order.setFinalAmount(totalAmount + taxAmount);
        order.setStatus(0); // 草稿
        order.setRemark(request.getRemark());
        order.setCreatedAt(LocalDateTime.now());

        salOrderMapper.insert(order);

        // 保存明细
        for (SalOrderItem item : items) {
            item.setOrderId(order.getId());
            salOrderItemMapper.insert(item);
        }

        // 创建应收记录（如果是赊销）
        FinReceivable receivable = new FinReceivable();
        receivable.setReceivableNo("AR-" + orderNo);
        receivable.setCustomerId(request.getCustomerId());
        receivable.setCustomerName(customer.getCustomerName());
        receivable.setBusinessType("销售");
        receivable.setReferenceId(order.getId());
        receivable.setReferenceNo(orderNo);
        receivable.setTotalAmount(order.getFinalAmount());
        receivable.setPaidAmount(0L);
        receivable.setReceivableDate(request.getOrderDate());
        if (request.getDeliveryDate() != null) {
            receivable.setDueDate(request.getDeliveryDate());
        }
        receivable.setStatus("unpaid");
        receivable.setCreatedAt(LocalDateTime.now());

        finReceivableMapper.insert(receivable);

        return convertToDTO(order, items);
    }

    /**
     * 审核销售单
     */
    @Transactional(rollbackFor = Exception.class)
    public void approveOrder(Long id) {
        SalOrder order = salOrderMapper.findById(id);
        if (order == null) {
            throw new BusinessException("销售单不存在");
        }

        if (order.getStatus() != 0 && order.getStatus() != 1) {
            throw new BusinessException("只有草稿或待审核状态的单据才能审核");
        }

        // 更新状态
        order.setStatus(2); // 已审核
        salOrderMapper.update(order);

        // 扣减库存
        List<SalOrderItem> items = salOrderItemMapper.findByOrderId(id);
        for (SalOrderItem item : items) {
            // 获取当前库存
            InvStock stock = invStockMapper.findByProductAndWarehouse(
                item.getProductId(), order.getWarehouseId()
            );

            if (stock == null) {
                throw new BusinessException("商品库存不存在: " + item.getProductName());
            }

            Integer beforeStock = stock.getQuantity();
            Integer afterStock = beforeStock - item.getQuantity();

            if (afterStock < 0) {
                throw new BusinessException("商品库存不足: " + item.getProductName());
            }

            // 更新库存
            stock.setQuantity(afterStock);
            invStockMapper.update(stock);

            // 记录库存流水
            InvMovement movement = new InvMovement();
            movement.setMovementNo(generateMovementNo());
            movement.setProductId(item.getProductId());
            movement.setProductCode(item.getProductCode());
            movement.setProductName(item.getProductName());
            movement.setWarehouseId(order.getWarehouseId());
            movement.setWarehouseName(order.getWarehouseName());
            movement.setMovementType("out");
            movement.setBusinessType("销售出库");
            movement.setQuantity(item.getQuantity());
            movement.setBeforeStock(beforeStock);
            movement.setAfterStock(afterStock);
            movement.setUnitPrice(item.getPrice());
            movement.setAmount(item.getSubtotal());
            movement.setReferenceId(order.getId());
            movement.setReferenceNo(order.getOrderNo());
            movement.setCreatedAt(LocalDateTime.now());

            invMovementMapper.insert(movement);
        }
    }

    /**
     * 查询销售单详情
     */
    public SalesOrderDTO getOrderById(Long id) {
        SalOrder order = salOrderMapper.findById(id);
        if (order == null) {
            throw new BusinessException("销售单不存在");
        }

        List<SalOrderItem> items = salOrderItemMapper.findByOrderId(id);
        return convertToDTO(order, items);
    }

    /**
     * 查询销售单列表
     */
    public List<SalesOrderDTO> getOrderList(String orderNo, String customerName, Integer status) {
        List<SalOrder> orders = salOrderMapper.findList(orderNo, customerName, status);
        List<SalesOrderDTO> result = new ArrayList<>();

        for (SalOrder order : orders) {
            List<SalOrderItem> items = salOrderItemMapper.findByOrderId(order.getId());
            result.add(convertToDTO(order, items));
        }

        return result;
    }

    /**
     * 生成销售单号
     */
    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);
        int count = salOrderMapper.countByDate(dateStr) + 1;
        return String.format("SAL-%s-%04d", dateStr, count);
    }

    /**
     * 生成流水单号
     */
    private String generateMovementNo() {
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);
        return String.format("MV-%s-%06d", dateStr, System.currentTimeMillis() % 1000000);
    }

    /**
     * 转换为DTO
     */
    private SalesOrderDTO convertToDTO(SalOrder order, List<SalOrderItem> items) {
        SalesOrderDTO dto = new SalesOrderDTO();
        dto.setId(order.getId());
        dto.setOrderNo(order.getOrderNo());
        dto.setCustomerId(order.getCustomerId());
        dto.setCustomerName(order.getCustomerName());
        dto.setWarehouseId(order.getWarehouseId());
        dto.setWarehouseName(order.getWarehouseName());
        dto.setOrderDate(order.getOrderDate());
        dto.setDeliveryDate(order.getDeliveryDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setFinalAmount(order.getFinalAmount());
        dto.setStatus(order.getStatus());
        dto.setRemark(order.getRemark());
        dto.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : null);

        List<SalesOrderDTO.OrderItemDTO> itemDTOs = new ArrayList<>();
        for (SalOrderItem item : items) {
            SalesOrderDTO.OrderItemDTO itemDTO = new SalesOrderDTO.OrderItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setProductId(item.getProductId());
            itemDTO.setProductCode(item.getProductCode());
            itemDTO.setProductName(item.getProductName());
            itemDTO.setSpec(item.getSpec());
            itemDTO.setUnit(item.getUnit());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());
            itemDTO.setTaxRate(item.getTaxRate());
            itemDTO.setSubtotal(item.getSubtotal());
            itemDTOs.add(itemDTO);
        }
        dto.setItems(itemDTOs);

        return dto;
    }
}
