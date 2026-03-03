package com.cc.erp.service;

import com.cc.erp.dto.StockAdjustRequest;
import com.cc.erp.entity.BizProduct;
import com.cc.erp.entity.BizWarehouse;
import com.cc.erp.entity.InvMovement;
import com.cc.erp.entity.InvStock;
import com.cc.erp.mapper.BizProductMapper;
import com.cc.erp.mapper.BizWarehouseMapper;
import com.cc.erp.mapper.InvMovementMapper;
import com.cc.erp.mapper.InvStockMapper;
import com.cc.erp.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * 库存管理服务
 *
 * @author CC ERP Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InvStockMapper invStockMapper;
    private final InvMovementMapper invMovementMapper;
    private final BizProductMapper bizProductMapper;
    private final BizWarehouseMapper bizWarehouseMapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * 库存调整
     */
    @Transactional(rollbackFor = Exception.class)
    public void adjustStock(StockAdjustRequest request) {
        // 验证商品
        BizProduct product = bizProductMapper.findById(request.getProductId());
        if (product == null) {
            throw new BusinessException("商品不存在");
        }

        // 验证仓库
        BizWarehouse warehouse = bizWarehouseMapper.findById(request.getWarehouseId());
        if (warehouse == null) {
            throw new BusinessException("仓库不存在");
        }

        // 获取当前库存
        InvStock stock = invStockMapper.findByProductAndWarehouse(
            request.getProductId(), request.getWarehouseId()
        );

        Integer beforeStock;
        Integer afterStock;

        if (stock == null) {
            // 首次入库，创建库存记录
            if ("in".equals(request.getAdjustType()) || "loss".equals(request.getAdjustType())) {
                stock = new InvStock();
                stock.setProductId(request.getProductId());
                stock.setProductCode(product.getProductCode());
                stock.setProductName(product.getProductName());
                stock.setWarehouseId(request.getWarehouseId());
                stock.setWarehouseName(warehouse.getWarehouseName());
                stock.setQuantity(0);
                stock.setAvgCost(0L);
                stock.setCreatedAt(LocalDateTime.now());
                beforeStock = 0;
            } else {
                throw new BusinessException("商品库存不存在，无法出库");
            }
        } else {
            beforeStock = stock.getQuantity();
        }

        // 计算调整后库存
        if ("in".equals(request.getAdjustType())) {
            afterStock = beforeStock + request.getAdjustQuantity();
        } else if ("out".equals(request.getAdjustType())) {
            afterStock = beforeStock - request.getAdjustQuantity();
            if (afterStock < 0) {
                throw new BusinessException("库存不足，当前库存: " + beforeStock);
            }
        } else {
            // 损溢调整
            afterStock = beforeStock + request.getAdjustQuantity();
        }

        // 更新库存
        stock.setQuantity(afterStock);
        if (stock.getAvgCost() == 0) {
            stock.setAvgCost(request.getAdjustPrice());
        }
        stock.setUpdatedAt(LocalDateTime.now());

        if (stock.getId() == null) {
            invStockMapper.insert(stock);
        } else {
            invStockMapper.update(stock);
        }

        // 记录库存流水
        InvMovement movement = new InvMovement();
        movement.setMovementNo(generateMovementNo());
        movement.setProductId(request.getProductId());
        movement.setProductCode(product.getProductCode());
        movement.setProductName(product.getProductName());
        movement.setWarehouseId(request.getWarehouseId());
        movement.setWarehouseName(warehouse.getWarehouseName());
        movement.setMovementType("adjust");
        movement.setBusinessType(request.getReason());
        movement.setQuantity(request.getAdjustQuantity());
        movement.setBeforeStock(beforeStock);
        movement.setAfterStock(afterStock);
        movement.setUnitPrice(request.getAdjustPrice());
        movement.setAmount((long) request.getAdjustQuantity() * request.getAdjustPrice());
        movement.setRemark(request.getRemark());
        movement.setCreatedAt(LocalDateTime.now());

        invMovementMapper.insert(movement);

        log.info("库存调整成功: productId={}, adjustType={}, quantity={}, before={}, after={}",
            request.getProductId(), request.getAdjustType(), request.getAdjustQuantity(), beforeStock, afterStock);
    }

    /**
     * 查询库存列表
     */
    public List<InvStock> getStockList(String productCode, String productName, Long warehouseId, String stockStatus) {
        return invStockMapper.findList(productCode, productName, warehouseId, stockStatus);
    }

    /**
     * 查询库存流水
     */
    public List<InvMovement> getMovementList(Long productId, Long warehouseId, String movementType) {
        return invMovementMapper.findList(productId, warehouseId, movementType);
    }

    /**
     * 获取库存预警统计
     */
    public List<InvStock> getAlertStocks() {
        return invStockMapper.findAlertStocks();
    }

    /**
     * 生成流水单号
     */
    private String generateMovementNo() {
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);
        return String.format("MV-%s-%06d", dateStr, System.currentTimeMillis() % 1000000);
    }
}
