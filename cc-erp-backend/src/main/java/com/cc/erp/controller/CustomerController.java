package com.cc.erp.controller;

import com.cc.erp.entity.BizCustomer;
import com.cc.erp.mapper.BizCustomerMapper;
import com.cc.erp.vo.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 客户管理控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final BizCustomerMapper bizCustomerMapper;

    /**
     * 查询客户列表
     */
    @GetMapping
    @PreAuthorize("hasAuthority('base:customer')")
    public Result<List<BizCustomer>> findList(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Boolean isEnabled) {
        List<BizCustomer> list = bizCustomerMapper.findList(customerName, isEnabled);
        return Result.success(list);
    }

    /**
     * 查询客户详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('base:customer')")
    public Result<BizCustomer> findById(@PathVariable Long id) {
        BizCustomer customer = bizCustomerMapper.findById(id);
        if (customer == null) {
            return Result.error(404, "客户不存在");
        }
        return Result.success(customer);
    }

    /**
     * 新增客户
     */
    @PostMapping
    @PreAuthorize("hasAuthority('base:customer:create')")
    public Result<BizCustomer> create(@RequestBody BizCustomer customer) {
        bizCustomerMapper.insert(customer);
        log.info("新增客户: id={}", customer.getId());
        return Result.success("新增成功", customer);
    }

    /**
     * 更新客户
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('base:customer:update')")
    public Result<Void> update(@PathVariable Long id, @RequestBody BizCustomer customer) {
        BizCustomer existing = bizCustomerMapper.findById(id);
        if (existing == null) {
            return Result.error(404, "客户不存在");
        }
        customer.setId(id);
        bizCustomerMapper.update(customer);
        log.info("更新客户: id={}", id);
        return Result.success("更新成功", null);
    }

    /**
     * 删除客户
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('base:customer:delete')")
    public Result<Void> delete(@PathVariable Long id) {
        bizCustomerMapper.delete(id);
        log.info("删除客户: id={}", id);
        return Result.success("删除成功", null);
    }
}
