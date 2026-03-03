package com.cc.erp.controller;

import com.cc.erp.entity.SysUser;
import com.cc.erp.mapper.SysUserMapper;
import com.cc.erp.vo.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户管理控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 查询用户列表
     */
    @GetMapping
    @PreAuthorize("hasAuthority('sys:user')")
    public Result<List<SysUser>> findList(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Boolean isEnabled) {
        List<SysUser> list = sysUserMapper.findList(username, isEnabled);
        // 隐藏密码
        list.forEach(u -> u.setPassword(null));
        return Result.success(list);
    }

    /**
     * 查询用户详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('sys:user')")
    public Result<SysUser> findById(@PathVariable Long id) {
        SysUser user = sysUserMapper.findById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        user.setPassword(null);
        return Result.success(user);
    }

    /**
     * 新增用户
     */
    @PostMapping
    @PreAuthorize("hasAuthority('sys:user:create')")
    public Result<SysUser> create(@RequestBody SysUser user) {
        // 检查用户名是否已存在
        SysUser existing = sysUserMapper.findByUsername(user.getUsername());
        if (existing != null) {
            return Result.error(400, "用户名已存在");
        }
        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        sysUserMapper.insert(user);
        log.info("新增用户: id={}", user.getId());
        user.setPassword(null);
        return Result.success("新增成功", user);
    }

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('sys:user:update')")
    public Result<Void> update(@PathVariable Long id, @RequestBody SysUser user) {
        SysUser existing = sysUserMapper.findById(id);
        if (existing == null) {
            return Result.error(404, "用户不存在");
        }
        user.setId(id);
        // 如果密码不为空，则加密
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        sysUserMapper.update(user);
        log.info("更新用户: id={}", id);
        return Result.success("更新成功", null);
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('sys:user:delete')")
    public Result<Void> delete(@PathVariable Long id) {
        sysUserMapper.delete(id);
        log.info("删除用户: id={}", id);
        return Result.success("删除成功", null);
    }

    /**
     * 重置密码
     */
    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('sys:user:reset')")
    public Result<Void> resetPassword(@PathVariable Long id, @RequestBody String newPassword) {
        SysUser user = sysUserMapper.findById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        sysUserMapper.update(user);
        log.info("重置用户密码: id={}", id);
        return Result.success("密码重置成功", null);
    }
}
