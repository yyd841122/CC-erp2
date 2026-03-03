package com.cc.erp.mapper;

import com.cc.erp.entity.SalOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 销售订单Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface SalOrderMapper {

    /**
     * 插入
     */
    void insert(SalOrder order);

    /**
     * 更新
     */
    void update(SalOrder order);

    /**
     * 根据ID查询
     */
    SalOrder findById(Long id);

    /**
     * 查询列表
     */
    List<SalOrder> findList(@Param("orderNo") String orderNo, @Param("customerName") String customerName, @Param("status") Integer status);

    /**
     * 根据日期统计数量
     */
    int countByDate(@Param("dateStr") String dateStr);

    /**
     * 删除（软删除）
     */
    void delete(Long id);
}
