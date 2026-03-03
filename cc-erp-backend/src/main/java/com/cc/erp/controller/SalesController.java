package com.cc.erp.controller;

import com.cc.erp.dto.CreateSalesOrderRequest;
import com.cc.erp.service.SalesService;
import com.cc.erp.vo.Result;
import com.cc.erp.vo.SalesOrderDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 销售管理控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/sales-orders")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    /**
     * 创建销售单
     */
    @PostMapping
    @PreAuthorize("hasAuthority('sales:order:create')")
    public Result<SalesOrderDTO> createOrder(@Valid @RequestBody CreateSalesOrderRequest request) {
        log.info("创建销售单: {}", request);
        SalesOrderDTO order = salesService.createOrder(request);
        return Result.success("销售单创建成功", order);
    }

    /**
     * 审核销售单
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('sales:order:approve')")
    public Result<Void> approveOrder(@PathVariable Long id) {
        log.info("审核销售单: id={}", id);
        salesService.approveOrder(id);
        return Result.success("销售单审核成功", null);
    }

    /**
     * 查询销售单详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('sales:order')")
    public Result<SalesOrderDTO> getOrderById(@PathVariable Long id) {
        SalesOrderDTO order = salesService.getOrderById(id);
        return Result.success(order);
    }

    /**
     * 查询销售单列表
     */
    @GetMapping
    @PreAuthorize("hasAuthority('sales:order')")
    public Result<List<SalesOrderDTO>> getOrderList(
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Integer status) {
        List<SalesOrderDTO> orders = salesService.getOrderList(orderNo, customerName, status);
        return Result.success(orders);
    }

    /**
     * 作废销售单
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('sales:order:cancel')")
    public Result<Void> cancelOrder(@PathVariable Long id) {
        log.info("作废销售单: id={}", id);
        // TODO: 实现作废逻辑
        return Result.success("销售单作废成功", null);
    }
}
