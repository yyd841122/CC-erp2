package com.cc.erp.controller;

import com.cc.erp.entity.BizProduct;
import com.cc.erp.mapper.BizProductMapper;
import com.cc.erp.vo.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品管理控制器
 *
 * @author CC ERP Team
 */
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
}
