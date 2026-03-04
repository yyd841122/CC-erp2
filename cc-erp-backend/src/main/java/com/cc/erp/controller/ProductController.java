package com.cc.erp.controller;

import com.cc.erp.entity.BizProduct;
import com.cc.erp.mapper.BizProductMapper;
import com.cc.erp.vo.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品管理控制器
 *
 * @author CC ERP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final BizProductMapper bizProductMapper;

    /**
     * 查询商品列表
     */
    @GetMapping
    @PreAuthorize("hasAuthority('base:product')")
    public Result<List<BizProduct>> findList(
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean isEnabled) {
        List<BizProduct> list = bizProductMapper.findList(productName, categoryId, isEnabled);
        return Result.success(list);
    }

    /**
     * 查询商品详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('base:product')")
    public Result<BizProduct> findById(@PathVariable Long id) {
        BizProduct product = bizProductMapper.findById(id);
        if (product == null) {
            return Result.error(404, "商品不存在");
        }
        return Result.success(product);
    }

    /**
     * 创建商品
     */
    @PostMapping
    @PreAuthorize("hasAuthority('base:product:create')")
    public Result<BizProduct> create(@RequestBody BizProduct product) {
        bizProductMapper.insert(product);
        log.info("新增商品: id={}", product.getId());
        return Result.success("新增成功", product);
    }

    /**
     * 更新商品
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('base:product:update')")
    public Result<Void> update(@PathVariable Long id, @RequestBody BizProduct product) {
        BizProduct existing = bizProductMapper.findById(id);
        if (existing == null) {
            return Result.error(404, "商品不存在");
        }
        product.setId(id);
        bizProductMapper.update(product);
        log.info("更新商品: id={}", id);
        return Result.success("更新成功", null);
    }

    /**
     * 删除商品
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('base:product:delete')")
    public Result<Void> delete(@PathVariable Long id) {
        BizProduct existing = bizProductMapper.findById(id);
        if (existing == null) {
            return Result.error(404, "商品不存在");
        }
        bizProductMapper.softDelete(id);
        log.info("删除商品: id={}", id);
        return Result.success("删除成功", null);
    }
}
