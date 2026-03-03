package com.cc.erp.mapper;

import com.cc.erp.entity.FinPayable;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 应付账款 Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface FinPayableMapper {

    /**
     * 插入应付账款
     */
    int insert(FinPayable payable);

    /**
     * 根据ID查询
     */
    FinPayable findById(@Param("id") Long id);

    /**
     * 更新应付账款
     */
    int update(FinPayable payable);

    /**
     * 查询列表
     */
    List<FinPayable> findList(@Param("supplierName") String supplierName, @Param("status") String status);

    /**
     * 统计应付总额
     */
    Long sumTotalAmount();
}
