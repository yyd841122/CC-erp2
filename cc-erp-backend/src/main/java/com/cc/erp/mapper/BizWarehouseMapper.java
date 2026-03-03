package com.cc.erp.mapper;

import com.cc.erp.entity.BizWarehouse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 仓库Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface BizWarehouseMapper {

    /**
     * 插入
     */
    void insert(BizWarehouse warehouse);

    /**
     * 更新
     */
    void update(BizWarehouse warehouse);

    /**
     * 根据ID查询
     */
    BizWarehouse findById(Long id);

    /**
     * 查询列表
     */
    List<BizWarehouse> findList();

    /**
     * 删除（软删除）
     */
    void delete(Long id);
}
