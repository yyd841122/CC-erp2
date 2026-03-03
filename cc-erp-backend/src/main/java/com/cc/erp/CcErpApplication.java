package com.cc.erp;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * CC ERP 应用启动类
 *
 * @author CC ERP Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableScheduling
@MapperScan("com.cc.erp.mapper")
public class CcErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(CcErpApplication.class, args);
        System.out.println("""
                ========================================
                   CC ERP 后端服务启动成功！
                   API地址: http://localhost:8080/api
                ========================================
                """);
    }
}
