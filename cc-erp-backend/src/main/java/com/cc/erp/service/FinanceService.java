package com.cc.erp.service;

import com.cc.erp.dto.PaymentRequest;
import com.cc.erp.dto.ReceiptRequest;
import com.cc.erp.entity.FinPayable;
import com.cc.erp.entity.FinPayment;
import com.cc.erp.entity.FinReceipt;
import com.cc.erp.entity.FinReceivable;
import com.cc.erp.mapper.FinPayableMapper;
import com.cc.erp.mapper.FinPaymentMapper;
import com.cc.erp.mapper.FinReceiptMapper;
import com.cc.erp.mapper.FinReceivableMapper;
import com.cc.erp.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 财务管理服务
 *
 * @author CC ERP Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FinanceService {

    private final FinReceivableMapper finReceivableMapper;
    private final FinPayableMapper finPayableMapper;
    private final FinReceiptMapper finReceiptMapper;
    private final FinPaymentMapper finPaymentMapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * 查询应收列表
     */
    public List<FinReceivable> getReceivableList(String customerName, String status) {
        return finReceivableMapper.findList(customerName, status);
    }

    /**
     * 查询应付列表
     */
    public List<FinPayable> getPayableList(String supplierName, String status) {
        return finPayableMapper.findList(supplierName, status);
    }

    /**
     * 收款登记
     */
    @Transactional(rollbackFor = Exception.class)
    public void recordReceipt(ReceiptRequest request) {
        // 获取应收记录
        FinReceivable receivable = finReceivableMapper.findById(request.getReceivableId());
        if (receivable == null) {
            throw new BusinessException("应收记录不存在");
        }

        // 检查收款金额
        long remainingAmount = receivable.getTotalAmount() - receivable.getPaidAmount();
        if (request.getAmount() > remainingAmount) {
            throw new BusinessException("收款金额超过待收金额，待收: " + remainingAmount);
        }

        // 创建收款记录
        FinReceipt receipt = new FinReceipt();
        receipt.setReceiptNo(generateReceiptNo());
        receipt.setCustomerId(receivable.getCustomerId());
        receipt.setCustomerName(receivable.getCustomerName());
        receipt.setReceivableId(receivable.getId());
        receipt.setReceiptDate(request.getReceiptDate());
        receipt.setAmount(request.getAmount());
        receipt.setPaymentMethod(request.getPaymentMethod());
        receipt.setBankAccount(request.getBankAccount());
        receipt.setHandlerName(request.getHandlerName());
        receipt.setRemark(request.getRemark());
        receipt.setCreatedAt(LocalDateTime.now());

        finReceiptMapper.insert(receipt);

        // 更新应收记录
        receivable.setPaidAmount(receivable.getPaidAmount() + request.getAmount());
        if (receivable.getPaidAmount() >= receivable.getTotalAmount()) {
            receivable.setStatus("paid");
        } else {
            receivable.setStatus("partial");
        }
        finReceivableMapper.update(receivable);

        log.info("收款登记成功: receiptNo={}, amount={}", receipt.getReceiptNo(), request.getAmount());
    }

    /**
     * 付款登记
     */
    @Transactional(rollbackFor = Exception.class)
    public void recordPayment(PaymentRequest request) {
        // 获取应付记录
        FinPayable payable = finPayableMapper.findById(request.getPayableId());
        if (payable == null) {
            throw new BusinessException("应付记录不存在");
        }

        // 检查付款金额
        long remainingAmount = payable.getTotalAmount() - payable.getPaidAmount();
        if (request.getAmount() > remainingAmount) {
            throw new BusinessException("付款金额超过待付金额，待付: " + remainingAmount);
        }

        // 创建付款记录
        FinPayment payment = new FinPayment();
        payment.setPaymentNo(generatePaymentNo());
        payment.setSupplierId(payable.getSupplierId());
        payment.setSupplierName(payable.getSupplierName());
        payment.setPayableId(payable.getId());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setBankAccount(request.getBankAccount());
        payment.setHandlerName(request.getHandlerName());
        payment.setRemark(request.getRemark());
        payment.setCreatedAt(LocalDateTime.now());

        finPaymentMapper.insert(payment);

        // 更新应付记录
        payable.setPaidAmount(payable.getPaidAmount() + request.getAmount());
        if (payable.getPaidAmount() >= payable.getTotalAmount()) {
            payable.setStatus("paid");
        } else {
            payable.setStatus("partial");
        }
        finPayableMapper.update(payable);

        log.info("付款登记成功: paymentNo={}, amount={}", payment.getPaymentNo(), request.getAmount());
    }

    /**
     * 查询收款记录
     */
    public List<FinReceipt> getReceiptList(String receiptNo, String customerName) {
        return finReceiptMapper.findList(receiptNo, customerName);
    }

    /**
     * 查询付款记录
     */
    public List<FinPayment> getPaymentList(String paymentNo, String supplierName) {
        return finPaymentMapper.findList(paymentNo, supplierName);
    }

    /**
     * 获取财务统计
     */
    public java.util.Map<String, Object> getFinanceStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();

        // 本月收入
        Long monthlyIncome = finReceiptMapper.sumByCurrentMonth();
        stats.put("monthlyIncome", monthlyIncome != null ? monthlyIncome : 0L);

        // 本月支出
        Long monthlyExpense = finPaymentMapper.sumByCurrentMonth();
        stats.put("monthlyExpense", monthlyExpense != null ? monthlyExpense : 0L);

        // 应收总额
        Long totalReceivable = finReceivableMapper.sumTotalAmount();
        stats.put("receivable", totalReceivable != null ? totalReceivable : 0L);

        // 应付总额
        Long totalPayable = finPayableMapper.sumTotalAmount();
        stats.put("payable", totalPayable != null ? totalPayable : 0L);

        return stats;
    }

    /**
     * 生成收款单号
     */
    private String generateReceiptNo() {
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);
        int count = finReceiptMapper.countByDate(dateStr) + 1;
        return String.format("REC-%s-%04d", dateStr, count);
    }

    /**
     * 生成付款单号
     */
    private String generatePaymentNo() {
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);
        int count = finPaymentMapper.countByDate(dateStr) + 1;
        return String.format("PAY-%s-%04d", dateStr, count);
    }
}
