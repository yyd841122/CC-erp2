package com.cc.erp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户表实体
 *
 * @author CC ERP Team
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysUser extends SoftDeleteEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码哈希
     */
    @lombok.Setter(lombok.AccessLevel.NONE)
    @lombok.Getter(lombok.AccessLevel.NONE)
    private String passwordHash;

    /**
     * 密码（用于业务逻辑，映射到 passwordHash）
     */
    public String getPassword() {
        return passwordHash;
    }

    public void setPassword(String password) {
        this.passwordHash = password;
    }

    /**
     * 获取密码哈希（用于安全认证）
     */
    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 昵称
     */
    private String nickName;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 性别: 0-未知, 1-男, 2-女
     */
    private Integer gender;

    /**
     * 部门ID
     */
    private Long deptId;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 状态: 1-正常, 0-禁用
     */
    private Integer status;

    /**
     * 最后登录时间
     */
    private java.time.LocalDateTime lastLoginAt;
}
