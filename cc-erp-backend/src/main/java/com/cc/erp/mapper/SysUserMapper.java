package com.cc.erp.mapper;

import com.cc.erp.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 用户表 Mapper
 *
 * @author CC ERP Team
 */
@Mapper
public interface SysUserMapper {

    /**
     * 根据用户名查询用户
     */
    SysUser findByUsername(@Param("username") String username);

    /**
     * 根据ID查询用户
     */
    SysUser findById(@Param("id") Long id);

    /**
     * 插入用户
     */
    int insert(SysUser user);

    /**
     * 更新用户
     */
    int update(SysUser user);
}
