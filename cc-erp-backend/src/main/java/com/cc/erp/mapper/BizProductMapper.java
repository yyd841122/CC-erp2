package com.cc.erp.mapper;

import com.cc.erp.entity.BizProduct;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 商品表 Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface BizProductMapper {

    /**
     * 根据ID查询商品
     */
    BizProduct findById(@Param("id") Long id);

    /**
     * 根据编码查询商品
     */
    BizProduct findByCode(@Param("productCode") String productCode);

    /**
     * 查询商品列表
     */
    List<BizProduct> findList(@Param("productName") String productName,
                              @Param("categoryId") Long categoryId,
                              @Param("isEnabled") Boolean isEnabled);

    /**
     * 插入商品
     */
    int insert(BizProduct product);

    /**
     * 更新商品
     */
    int update(BizProduct product);

    /**
     * 软删除商品
     */
    int softDelete(@Param("id") Long id);
}
