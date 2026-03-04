package com.cc.erp.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * 密码哈希生成工具
 * 运行此类以生成 BCrypt 哈希
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "admin123";
        String hash = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);

        // 验证哈希
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verification: " + matches);
    }
}
