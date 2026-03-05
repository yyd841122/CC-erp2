package com.cc.erp.mapper;

import com.cc.erp.entity.InvStock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 库存表 Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface InvStockMapper {

    /**
     * 根据仓库ID和商品ID查询库存
     */
    InvStock findByWarehouseAndProduct(@Param("warehouseId") Long warehouseId,
                                       @Param("productId") Long productId);

    /**
     * 插入库存
     */
    int insert(InvStock stock);

    /**
     * 更新库存
     */
    int update(InvStock stock);

    /**
     * 增加库存
     */
    int increaseQuantity(@Param("warehouseId") Long warehouseId,
                        @Param("productId") Long productId,
                        @Param("quantity") Integer quantity);

    /**
     * 减少库存
     */
    int decreaseQuantity(@Param("warehouseId") Long warehouseId,
                        @Param("productId") Long productId,
                        @Param("quantity") Integer quantity);
}
