package com.cc.erp.mapper;

import com.cc.erp.entity.BizProductCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 商品分类 Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface BizProductCategoryMapper {

    /**
     * 查询所有分类
     */
    List<BizProductCategory> findAll();

    /**
     * 根据ID查询分类
     */
    BizProductCategory findById(@Param("id") Long id);

    /**
     * 插入分类
     */
    int insert(BizProductCategory category);

    /**
     * 更新分类
     */
    int update(BizProductCategory category);

    /**
     * 删除分类
     */
    int delete(@Param("id") Long id);

    /**
     * 根据名称查询分类数量
     */
    int countByName(@Param("categoryName") String categoryName);

    /**
     * 获取最大ID
     */
    Long getMaxId();
}
