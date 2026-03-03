package com.cc.erp.controller;

import com.cc.erp.entity.BizSupplier;
import com.cc.erp.mapper.BizSupplierMapper;
import com.cc.erp.vo.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 供应商管理控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final BizSupplierMapper bizSupplierMapper;

    /**
     * 查询供应商列表
     */
    @GetMapping
    @PreAuthorize("hasAuthority('base:supplier')")
    public Result<List<BizSupplier>> findList(
            @RequestParam(required = false) String supplierName,
            @RequestParam(required = false) Boolean isEnabled) {
        List<BizSupplier> list = bizSupplierMapper.findList(supplierName, isEnabled);
        return Result.success(list);
    }

    /**
     * 查询供应商详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('base:supplier')")
    public Result<BizSupplier> findById(@PathVariable Long id) {
        BizSupplier supplier = bizSupplierMapper.findById(id);
        if (supplier == null) {
            return Result.error(404, "供应商不存在");
        }
        return Result.success(supplier);
    }

    /**
     * 新增供应商
     */
    @PostMapping
    @PreAuthorize("hasAuthority('base:supplier:create')")
    public Result<BizSupplier> create(@RequestBody BizSupplier supplier) {
        bizSupplierMapper.insert(supplier);
        log.info("新增供应商: id={}", supplier.getId());
        return Result.success("新增成功", supplier);
    }

    /**
     * 更新供应商
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('base:supplier:update')")
    public Result<Void> update(@PathVariable Long id, @RequestBody BizSupplier supplier) {
        BizSupplier existing = bizSupplierMapper.findById(id);
        if (existing == null) {
            return Result.error(404, "供应商不存在");
        }
        supplier.setId(id);
        bizSupplierMapper.update(supplier);
        log.info("更新供应商: id={}", id);
        return Result.success("更新成功", null);
    }

    /**
     * 删除供应商
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('base:supplier:delete')")
    public Result<Void> delete(@PathVariable Long id) {
        bizSupplierMapper.delete(id);
        log.info("删除供应商: id={}", id);
        return Result.success("删除成功", null);
    }
}
