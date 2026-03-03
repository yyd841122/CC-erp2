package com.cc.erp.controller;

import com.cc.erp.service.ReportService;
import com.cc.erp.vo.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 报表统计控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * 销售报表
     */
    @GetMapping("/sales")
    @PreAuthorize("hasAuthority('report:sales')")
    public Result<Map<String, Object>> getSalesReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> report = reportService.getSalesReport(startDate, endDate);
        return Result.success(report);
    }

    /**
     * 采购报表
     */
    @GetMapping("/purchase")
    @PreAuthorize("hasAuthority('report:purchase')")
    public Result<Map<String, Object>> getPurchaseReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> report = reportService.getPurchaseReport(startDate, endDate);
        return Result.success(report);
    }

    /**
     * 库存报表
     */
    @GetMapping("/inventory")
    @PreAuthorize("hasAuthority('report:inventory')")
    public Result<Map<String, Object>> getInventoryReport() {
        Map<String, Object> report = reportService.getInventoryReport();
        return Result.success(report);
    }

    /**
     * 财务报表
     */
    @GetMapping("/finance")
    @PreAuthorize("hasAuthority('report:finance')")
    public Result<Map<String, Object>> getFinanceReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> report = reportService.getFinanceReport(startDate, endDate);
        return Result.success(report);
    }

    /**
     * 业绩报表
     */
    @GetMapping("/performance")
    @PreAuthorize("hasAuthority('report:performance')")
    public Result<Map<String, Object>> getPerformanceReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> report = reportService.getPerformanceReport(startDate, endDate);
        return Result.success(report);
    }

    /**
     * 商品销售排行
     */
    @GetMapping("/top-products")
    @PreAuthorize("hasAuthority('report:product')")
    public Result<List<Map<String, Object>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> list = reportService.getTopProducts(limit);
        return Result.success(list);
    }
}
