package com.cc.erp.controller;

import com.cc.erp.dto.StockAdjustRequest;
import com.cc.erp.entity.InvMovement;
import com.cc.erp.entity.InvStock;
import com.cc.erp.service.InventoryService;
import com.cc.erp.vo.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 库存管理控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    /**
     * 库存调整
     */
    @PostMapping("/adjust")
    @PreAuthorize("hasAuthority('inventory:adjust')")
    public Result<Void> adjustStock(@Valid @RequestBody StockAdjustRequest request) {
        log.info("库存调整: {}", request);
        inventoryService.adjustStock(request);
        return Result.success("库存调整成功", null);
    }

    /**
     * 查询库存列表
     */
    @GetMapping("/stocks")
    @PreAuthorize("hasAuthority('inventory:stock')")
    public Result<List<InvStock>> getStockList(
            @RequestParam(required = false) String productCode,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String stockStatus) {
        List<InvStock> stocks = inventoryService.getStockList(productCode, productName, warehouseId, stockStatus);
        return Result.success(stocks);
    }

    /**
     * 查询库存流水
     */
    @GetMapping("/movements")
    @PreAuthorize("hasAuthority('inventory:movement')")
    public Result<List<InvMovement>> getMovementList(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String movementType) {
        List<InvMovement> movements = inventoryService.getMovementList(productId, warehouseId, movementType);
        return Result.success(movements);
    }

    /**
     * 获取库存预警统计
     */
    @GetMapping("/alerts")
    @PreAuthorize("hasAuthority('inventory:alert')")
    public Result<List<InvStock>> getAlertStocks() {
        List<InvStock> stocks = inventoryService.getAlertStocks();
        return Result.success(stocks);
    }
}
