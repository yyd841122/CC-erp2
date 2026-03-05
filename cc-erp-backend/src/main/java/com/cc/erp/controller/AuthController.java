package com.cc.erp.controller;

import com.cc.erp.dto.LoginRequest;
import com.cc.erp.security.CustomUserDetails;
import com.cc.erp.service.AuthService;
import com.cc.erp.vo.Result;
import com.cc.erp.vo.TokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        return Result.success(response);
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        // JWT 无状态，客户端删除 token 即可
        return Result.success("登出成功", null);
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public Result<TokenResponse> getCurrentUser() {
        Long userId = authService.getCurrentUserId();
        String username = authService.getCurrentUsername();
        // 获取用户权限
        CustomUserDetails userDetails = (CustomUserDetails) org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return Result.success(new TokenResponse(null, userId, username, userDetails.getPermissions()));
    }
}
