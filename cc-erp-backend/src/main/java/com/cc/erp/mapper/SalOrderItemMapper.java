package com.cc.erp.mapper;

import com.cc.erp.entity.SalOrderItem;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 销售订单明细Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface SalOrderItemMapper {

    /**
     * 插入
     */
    void insert(SalOrderItem item);

    /**
     * 根据订单ID查询明细
     */
    List<SalOrderItem> findByOrderId(Long orderId);

    /**
     * 删除
     */
    void delete(Long id);
}
