package com.cc.erp.mapper;

import com.cc.erp.entity.InvMovement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 库存流水Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface InvMovementMapper {

    /**
     * 插入
     */
    void insert(InvMovement movement);

    /**
     * 查询列表
     */
    List<InvMovement> findList(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId,
            @Param("movementType") String movementType
    );
}
