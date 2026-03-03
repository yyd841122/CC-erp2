package com.cc.erp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 报表统计服务
 *
 * @author CC ERP Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final SalesService salesService;
    private final PurchaseService purchaseService;
    private final InventoryService inventoryService;
    private final FinanceService financeService;

    /**
     * 销售报表
     */
    public Map<String, Object> getSalesReport(String startDate, String endDate) {
        Map<String, Object> report = new HashMap<>();

        // KPI数据
        Map<String, Object> kpi = new HashMap<>();
        kpi.put("totalSales", 458600L);
        kpi.put("orderCount", 326);
        kpi.put("profit", 98500L);
        kpi.put("customerCount", 45);
        report.put("kpi", kpi);

        // 趋势数据
        List<Map<String, Object>> trend = new ArrayList<>();
        String[] months = {"1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"};
        long[] sales = {32000L, 42000L, 51000L, 48000L, 55000L, 62000L, 58000L, 65000L, 72000L, 68000L, 75000L, 82000L};
        int[] orders = {22, 28, 35, 32, 38, 42, 40, 45, 48, 46, 52, 56};

        for (int i = 0; i < months.length; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", months[i]);
            item.put("sales", sales[i]);
            item.put("orders", orders[i]);
            trend.add(item);
        }
        report.put("trend", trend);

        // 商品销售排行
        List<Map<String, Object>> topProducts = getTopProducts(10);
        report.put("topProducts", topProducts);

        return report;
    }

    /**
     * 采购报表
     */
    public Map<String, Object> getPurchaseReport(String startDate, String endDate) {
        Map<String, Object> report = new HashMap<>();

        // KPI数据
        Map<String, Object> kpi = new HashMap<>();
        kpi.put("totalAmount", 285600L);
        kpi.put("orderCount", 158);
        kpi.put("supplierCount", 24);
        kpi.put("pendingAmount", 32500L);
        report.put("kpi", kpi);

        // 趋势数据
        List<Map<String, Object>> trend = new ArrayList<>();
        long[] amounts = {18000L, 22000L, 25000L, 23000L, 28000L, 32000L, 30000L, 35000L, 38000L, 36000L, 40000L, 42500L};

        for (int i = 0; i < amounts.length; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", (i + 1) + "月");
            item.put("amount", amounts[i]);
            trend.add(item);
        }
        report.put("trend", trend);

        return report;
    }

    /**
     * 库存报表
     */
    public Map<String, Object> getInventoryReport() {
        Map<String, Object> report = new HashMap<>();

        // KPI数据
        Map<String, Object> kpi = new HashMap<>();
        kpi.put("totalValue", 158600L);
        kpi.put("lowStock", 8);
        kpi.put("outOfStock", 3);
        kpi.put("overstock", 5);
        report.put("kpi", kpi);

        // 预警商品
        report.put("alertStocks", inventoryService.getAlertStocks());

        return report;
    }

    /**
     * 财务报表
     */
    public Map<String, Object> getFinanceReport(String startDate, String endDate) {
        Map<String, Object> report = new HashMap<>();

        // 收支数据
        Map<String, Object> finance = financeService.getFinanceStats();
        report.put("finance", finance);

        // 应收账龄分析
        List<Map<String, Object>> agingReceivable = new ArrayList<>();
        agingReceivable.add(createAgingData("0-30天", 12, 28500L, 62.2));
        agingReceivable.add(createAgingData("31-60天", 5, 12000L, 26.2));
        agingReceivable.add(createAgingData("61-90天", 2, 3800L, 8.3));
        agingReceivable.add(createAgingData("90天以上", 1, 1500L, 3.3));
        report.put("agingReceivable", agingReceivable);

        // 应付账龄分析
        List<Map<String, Object>> agingPayable = new ArrayList<>();
        agingPayable.add(createAgingData("0-30天", 8, 16800L, 58.9));
        agingPayable.add(createAgingData("31-60天", 4, 8200L, 28.8));
        agingPayable.add(createAgingData("61-90天", 2, 2800L, 9.8));
        agingPayable.add(createAgingData("90天以上", 1, 700L, 2.5));
        report.put("agingPayable", agingPayable);

        return report;
    }

    /**
     * 业绩报表
     */
    public Map<String, Object> getPerformanceReport(String startDate, String endDate) {
        Map<String, Object> report = new HashMap<>();

        // KPI数据
        Map<String, Object> kpi = new HashMap<>();
        kpi.put("salesAchievement", 85);
        kpi.put("profitRate", 28.5);
        kpi.put("customerGrowth", 12.3);
        report.put("kpi", kpi);

        // 员工业绩排行
        List<Map<String, Object>> employees = new ArrayList<>();
        employees.add(createEmployeeData("张三", 48, 85600L, 24300L, 28.4, 8, 95));
        employees.add(createEmployeeData("李四", 52, 78500L, 22800L, 29.1, 12, 87));
        employees.add(createEmployeeData("王五", 35, 62800L, 17500L, 27.9, 6, 70));
        employees.add(createEmployeeData("赵六", 42, 54200L, 15200L, 28.0, 9, 60));
        employees.add(createEmployeeData("钱七", 28, 45600L, 12800L, 28.1, 5, 51));
        report.put("employees", employees);

        return report;
    }

    /**
     * 商品销售排行
     */
    public List<Map<String, Object>> getTopProducts(int limit) {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(createProductData("P001", "螺丝A M5*20", 5200, 44200L, 13260L, 30));
        list.add(createProductData("P002", "螺母B M5", 4800, 24000L, 7200L, 30));
        list.add(createProductData("P004", "螺栓D M8*30", 2100, 25200L, 6300L, 25));
        list.add(createProductData("P003", "垫片C φ10", 8500, 4250L, 1275L, 30));
        list.add(createProductData("P005", "螺钉E M6*15", 3500, 17500L, 4375L, 25));
        return list;
    }

    private Map<String, Object> createAgingData(String period, int count, long amount, double ratio) {
        Map<String, Object> map = new HashMap<>();
        map.put("period", period);
        map.put("count", count);
        map.put("amount", amount);
        map.put("ratio", ratio);
        return map;
    }

    private Map<String, Object> createEmployeeData(String name, int orderCount, long sales, long profit, double profitRate, int customers, int achievement) {
        Map<String, Object> map = new HashMap<>();
        map.put("employeeName", name);
        map.put("orderCount", orderCount);
        map.put("salesAmount", sales);
        map.put("profitAmount", profit);
        map.put("profitRate", profitRate);
        map.put("customerCount", customers);
        map.put("achievementRate", achievement);
        return map;
    }

    private Map<String, Object> createProductData(String code, String name, int quantity, long amount, long profit, int profitRate) {
        Map<String, Object> map = new HashMap<>();
        map.put("productCode", code);
        map.put("productName", name);
        map.put("quantity", quantity);
        map.put("amount", amount);
        map.put("profit", profit);
        map.put("profitRate", profitRate);
        return map;
    }
}
