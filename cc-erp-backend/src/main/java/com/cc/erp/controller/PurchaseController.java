package com.cc.erp.controller;

import com.cc.erp.dto.CreatePurchaseOrderRequest;
import com.cc.erp.service.PurchaseService;
import com.cc.erp.vo.PurchaseOrderDTO;
import com.cc.erp.vo.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 采购管理控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    /**
     * 创建采购单
     */
    @PostMapping
    @PreAuthorize("hasAuthority('purchase:order:create')")
    public Result<PurchaseOrderDTO> createOrder(@Valid @RequestBody CreatePurchaseOrderRequest request) {
        PurchaseOrderDTO order = purchaseService.createOrder(request);
        return Result.success("采购单创建成功", order);
    }

    /**
     * 审核采购单
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('purchase:order:approve')")
    public Result<Void> approveOrder(@PathVariable Long id) {
        purchaseService.approveOrder(id);
        return Result.success("采购单审核成功", null);
    }

    /**
     * 查询采购单详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('purchase:order')")
    public Result<PurchaseOrderDTO> getOrderById(@PathVariable Long id) {
        PurchaseOrderDTO order = purchaseService.getOrderById(id);
        return Result.success(order);
    }
}
