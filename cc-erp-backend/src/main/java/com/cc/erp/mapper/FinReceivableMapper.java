package com.cc.erp.mapper;

import com.cc.erp.entity.FinReceivable;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 应收账款Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface FinReceivableMapper {

    /**
     * 插入
     */
    void insert(FinReceivable receivable);

    /**
     * 更新
     */
    void update(FinReceivable receivable);

    /**
     * 根据ID查询
     */
    FinReceivable findById(Long id);

    /**
     * 查询列表
     */
    List<FinReceivable> findList(@Param("customerName") String customerName, @Param("status") String status);

    /**
     * 统计应收总额
     */
    Long sumTotalAmount();

    /**
     * 删除（软删除）
     */
    void delete(Long id);
}
