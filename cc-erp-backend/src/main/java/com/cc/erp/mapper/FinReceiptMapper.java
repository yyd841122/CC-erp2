package com.cc.erp.mapper;

import com.cc.erp.entity.FinReceipt;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 收款记录Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface FinReceiptMapper {

    /**
     * 插入
     */
    void insert(FinReceipt receipt);

    /**
     * 查询列表
     */
    List<FinReceipt> findList(@Param("receiptNo") String receiptNo, @Param("customerName") String customerName);

    /**
     * 统计本月收款总额
     */
    Long sumByCurrentMonth();

    /**
     * 根据日期统计数量
     */
    int countByDate(@Param("dateStr") String dateStr);
}
