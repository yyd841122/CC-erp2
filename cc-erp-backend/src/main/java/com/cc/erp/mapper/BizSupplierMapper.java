package com.cc.erp.mapper;

import com.cc.erp.entity.BizSupplier;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 供应商Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface BizSupplierMapper {

    /**
     * 插入
     */
    void insert(BizSupplier supplier);

    /**
     * 更新
     */
    void update(BizSupplier supplier);

    /**
     * 根据ID查询
     */
    BizSupplier findById(Long id);

    /**
     * 查询列表
     */
    List<BizSupplier> findList(@Param("supplierName") String supplierName, @Param("isEnabled") Boolean isEnabled);

    /**
     * 删除（软删除）
     */
    void delete(Long id);
}
