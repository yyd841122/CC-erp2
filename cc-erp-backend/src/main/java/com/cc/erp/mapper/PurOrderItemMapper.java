package com.cc.erp.mapper;

import com.cc.erp.entity.PurOrderItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 采购单明细 Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface PurOrderItemMapper {

    /**
     * 根据订单ID查询明细列表
     */
    List<PurOrderItem> findByOrderId(@Param("orderId") Long orderId);

    /**
     * 插入明细
     */
    int insert(PurOrderItem item);

    /**
     * 批量插入
     */
    int batchInsert(@Param("items") List<PurOrderItem> items);
}
