package com.cc.erp.controller;

import com.cc.erp.dto.PaymentRequest;
import com.cc.erp.dto.ReceiptRequest;
import com.cc.erp.entity.FinPayable;
import com.cc.erp.entity.FinPayment;
import com.cc.erp.entity.FinReceipt;
import com.cc.erp.entity.FinReceivable;
import com.cc.erp.service.FinanceService;
import com.cc.erp.vo.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 财务管理控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    /**
     * 查询应收列表
     */
    @GetMapping("/receivables")
    @PreAuthorize("hasAuthority('finance:receivable')")
    public Result<List<FinReceivable>> getReceivableList(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String status) {
        List<FinReceivable> list = financeService.getReceivableList(customerName, status);
        return Result.success(list);
    }

    /**
     * 查询应付列表
     */
    @GetMapping("/payables")
    @PreAuthorize("hasAuthority('finance:payable')")
    public Result<List<FinPayable>> getPayableList(
            @RequestParam(required = false) String supplierName,
            @RequestParam(required = false) String status) {
        List<FinPayable> list = financeService.getPayableList(supplierName, status);
        return Result.success(list);
    }

    /**
     * 收款登记
     */
    @PostMapping("/receipts")
    @PreAuthorize("hasAuthority('finance:receipt:create')")
    public Result<Void> recordReceipt(@Valid @RequestBody ReceiptRequest request) {
        log.info("收款登记: {}", request);
        financeService.recordReceipt(request);
        return Result.success("收款登记成功", null);
    }

    /**
     * 付款登记
     */
    @PostMapping("/payments")
    @PreAuthorize("hasAuthority('finance:payment:create')")
    public Result<Void> recordPayment(@Valid @RequestBody PaymentRequest request) {
        log.info("付款登记: {}", request);
        financeService.recordPayment(request);
        return Result.success("付款登记成功", null);
    }

    /**
     * 查询收款记录
     */
    @GetMapping("/receipts")
    @PreAuthorize("hasAuthority('finance:receipt')")
    public Result<List<FinReceipt>> getReceiptList(
            @RequestParam(required = false) String receiptNo,
            @RequestParam(required = false) String customerName) {
        List<FinReceipt> list = financeService.getReceiptList(receiptNo, customerName);
        return Result.success(list);
    }

    /**
     * 查询付款记录
     */
    @GetMapping("/payments")
    @PreAuthorize("hasAuthority('finance:payment')")
    public Result<List<FinPayment>> getPaymentList(
            @RequestParam(required = false) String paymentNo,
            @RequestParam(required = false) String supplierName) {
        List<FinPayment> list = financeService.getPaymentList(paymentNo, supplierName);
        return Result.success(list);
    }

    /**
     * 获取财务统计
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('finance:stats')")
    public Result<Map<String, Object>> getFinanceStats() {
        Map<String, Object> stats = financeService.getFinanceStats();
        return Result.success(stats);
    }
}
