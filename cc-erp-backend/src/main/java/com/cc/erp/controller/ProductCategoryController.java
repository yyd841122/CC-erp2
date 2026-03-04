package com.cc.erp.controller;

import com.cc.erp.entity.BizProductCategory;
import com.cc.erp.mapper.BizProductCategoryMapper;
import com.cc.erp.vo.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品分类管理控制器
 *
 * @author CC ERP Team
 */
@RestController
@RequestMapping("/v1/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final BizProductCategoryMapper bizProductCategoryMapper;

    /**
     * 查询所有分类
     */
    @GetMapping
    @PreAuthorize("hasAuthority('base:product')")
    public Result<List<BizProductCategory>> findAll() {
        List<BizProductCategory> list = bizProductCategoryMapper.findAll();
        return Result.success(list);
    }

    /**
     * 根据ID查询分类
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('base:product')")
    public Result<BizProductCategory> findById(@PathVariable Long id) {
        BizProductCategory category = bizProductCategoryMapper.findById(id);
        if (category == null) {
            return Result.error(404, "分类不存在");
        }
        return Result.success(category);
    }

    /**
     * 创建分类
     */
    @PostMapping
    @PreAuthorize("hasAuthority('base:product:create')")
    public Result<BizProductCategory> create(@RequestBody BizProductCategory category) {
        // 检查名称是否重复
        int count = bizProductCategoryMapper.countByName(category.getCategoryName());
        if (count > 0) {
            return Result.error(400, "分类名称已存在");
        }

        // 生成分类编码
        Long maxId = bizProductCategoryMapper.getMaxId();
        String categoryCode = "CAT" + String.format("%03d", maxId + 1);
        category.setCategoryCode(categoryCode);

        category.setStatus(1);
        category.setParentId(0L);
        category.setLevel(1);
        category.setSortOrder(0);

        bizProductCategoryMapper.insert(category);
        return Result.success(category);
    }

    /**
     * 更新分类
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('base:product:update')")
    public Result<Void> update(@PathVariable Long id, @RequestBody BizProductCategory category) {
        BizProductCategory existing = bizProductCategoryMapper.findById(id);
        if (existing == null) {
            return Result.error(404, "分类不存在");
        }

        // 检查名称是否被其他分类使用
        int count = bizProductCategoryMapper.countByName(category.getCategoryName());
        if (count > 0 && !existing.getCategoryName().equals(category.getCategoryName())) {
            return Result.error(400, "分类名称已被使用");
        }

        category.setId(id);
        bizProductCategoryMapper.update(category);
        return Result.success();
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('base:product:delete')")
    public Result<Void> delete(@PathVariable Long id) {
        BizProductCategory existing = bizProductCategoryMapper.findById(id);
        if (existing == null) {
            return Result.error(404, "分类不存在");
        }
        bizProductCategoryMapper.delete(id);
        return Result.success();
    }
}
