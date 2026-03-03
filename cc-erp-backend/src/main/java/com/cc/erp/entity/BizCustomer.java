package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户实体
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BizCustomer extends SoftDeleteEntity {

    /**
     * 客户编码
     */
    private String customerCode;

    /**
     * 客户名称
     */
    private String customerName;

    /**
     * 联系人
     */
    private String contact;

    /**
     * 联系电话
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 地址
     */
    private String address;

    /**
     * 信用额度
     */
    private Long creditLimit;

    /**
     * 当前欠款
     */
    private Long currentDebt;

    /**
     * 客户等级
     */
    private String customerLevel;

    /**
     * 是否启用
     */
    private Boolean isEnabled;

    /**
     * 备注
     */
    private String remark;
}
