package com.cc.erp.mapper;

import com.cc.erp.entity.BizCustomer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 客户Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface BizCustomerMapper {

    /**
     * 插入
     */
    void insert(BizCustomer customer);

    /**
     * 更新
     */
    void update(BizCustomer customer);

    /**
     * 根据ID查询
     */
    BizCustomer findById(Long id);

    /**
     * 查询列表
     */
    List<BizCustomer> findList(@Param("customerName") String customerName, @Param("isEnabled") Boolean isEnabled);

    /**
     * 删除（软删除）
     */
    void delete(Long id);
}
