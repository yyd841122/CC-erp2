package com.cc.erp.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Token 响应
 *
 * @author CC ERP Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {

    /**
     * 访问令牌
     */
    private String token;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户姓名
     */
    private String realName;

    /**
     * 用户权限列表
     */
    private List<String> permissions;
}
