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

        // 加载用户权限（这里简化处理，实际应该从数据库加载）
        List<String> permissions = new ArrayList<>();

        return new CustomUserDetails(
                sysUser.getId(),
                sysUser.getUsername(),
                sysUser.getPasswordHash(),
                sysUser.getRealName(),
                permissions
        );
    }
}
