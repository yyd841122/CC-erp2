package com.cc.erp.service;

import com.cc.erp.dto.LoginRequest;
import com.cc.erp.security.CustomUserDetails;
import com.cc.erp.security.jwt.JwtTokenProvider;
import com.cc.erp.vo.TokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * 认证服务
 *
 * @author CC ERP Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 用户登录
     */
    public TokenResponse login(LoginRequest request) {
        // 执行认证
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 设置安全上下文
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 获取用户详情
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // 生成 token
        String token = jwtTokenProvider.generateToken(userDetails.getUsername(), userDetails.getUserId());

        log.info("用户登录成功: {}", userDetails.getUsername());

        return new TokenResponse(token, userDetails.getUserId(), userDetails.getRealName(), userDetails.getPermissions());
    }

    /**
     * 获取当前登录用户ID
     */
    public Long getCurrentUserId() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return userDetails.getUserId();
    }

    /**
     * 获取当前登录用户名
     */
    public String getCurrentUsername() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return userDetails.getUsername();
    }
}
