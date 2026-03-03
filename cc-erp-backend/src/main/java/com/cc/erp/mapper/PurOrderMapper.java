package com.cc.erp.mapper;

import com.cc.erp.entity.PurOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 采购单 Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface PurOrderMapper {

    /**
     * 根据ID查询采购单
     */
    PurOrder findById(@Param("id") Long id);

    /**
     * 根据单号查询采购单
     */
    PurOrder findByOrderNo(@Param("orderNo") String orderNo);

    /**
     * 查询采购单列表
     */
    List<PurOrder> findList(@Param("supplierId") Long supplierId,
                           @Param("status") Integer status,
                           @Param("startDate") String startDate,
                           @Param("endDate") String endDate);

    /**
     * 插入采购单
     */
    int insert(PurOrder order);

    /**
     * 更新采购单
     */
    int update(PurOrder order);

    /**
     * 审核采购单（带乐观锁）
     */
    int approve(PurOrder order);
}
