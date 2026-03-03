package com.cc.erp.mapper;

import com.cc.erp.entity.FinPayment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 付款记录Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface FinPaymentMapper {

    /**
     * 插入
     */
    void insert(FinPayment payment);

    /**
     * 查询列表
     */
    List<FinPayment> findList(@Param("paymentNo") String paymentNo, @Param("supplierName") String supplierName);

    /**
     * 统计本月付款总额
     */
    Long sumByCurrentMonth();

    /**
     * 根据日期统计数量
     */
    int countByDate(@Param("dateStr") String dateStr);
}
