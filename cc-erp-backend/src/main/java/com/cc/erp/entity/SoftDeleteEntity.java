package com.cc.erp.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 支持软删除的实体基类
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public abstract class SoftDeleteEntity extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 是否删除: true-已删除, false-未删除
     */
    private Boolean isDeleted;
}
