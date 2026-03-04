package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 商品分类表实体
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BizProductCategory extends SoftDeleteEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 分类ID
     */
    private Long id;

    /**
     * 分类编码
     */
    private String categoryCode;

    /**
     * 分类名称
     */
    private String categoryName;

    /**
     * 父级ID
     */
    private Long parentId;

    /**
     * 层级
     */
    private Integer level;

    /**
     * 排序
     */
    private Integer sortOrder;

    /**
     * 状态: 1-正常, 0-禁用
     */
    private Integer status;

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新人ID
     */
    private Long updatedBy;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 商品数量（非持久化字段，用于显示）
     */
    private Long productCount;
}
