package com.cc.erp.security;

import com.cc.erp.entity.SysUser;
import com.cc.erp.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 用户详情服务实现
 *
 * @author CC ERP Team
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final SysUserMapper sysUserMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser sysUser = sysUserMapper.findByUsername(username);
        if (sysUser == null) {
            throw new UsernameNotFoundException("用户不存在: " + username);
        }

        if (sysUser.getStatus() == 0) {
            throw new UsernameNotFoundException("用户已被禁用: " + username);
        }

        // 从数据库加载用户权限
        List<String> permissions = sysUserMapper.findUserPermissions(sysUser.getId());
        if (permissions == null || permissions.isEmpty()) {
            // 如果没有权限，赋予默认的ROLE_ADMIN角色（用于管理员）
            permissions = new ArrayList<>();
            permissions.add("ROLE_ADMIN");
        }

        return new CustomUserDetails(
                sysUser.getId(),
                sysUser.getUsername(),
                sysUser.getPasswordHash(),
                sysUser.getRealName(),
                permissions
        );
    }
}
