<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑商品' : '新增商品'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form-item label="商品编码">
            <el-input
              v-model="formData.productCode"
              placeholder="自动生成"
              :readonly="!isEdit"
            >
              <template #append v-if="!isEdit">
                <el-button @click="formData.productCode = generateProductCode()">重新生成</el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="formData.productName" placeholder="请输入商品名称" />
          </el-form-item>

          <el-form-item label="商品分类" prop="categoryId">
            <el-select v-model="formData.categoryId" placeholder="请选择商品分类" style="width: 100%;">
              <el-option
                v-for="category in categoryList"
                :key="category.id"
                :label="category.categoryName"
                :value="category.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="规格型号">
            <el-input v-model="formData.spec" placeholder="请输入规格型号" />
          </el-form-item>

          <el-form-item label="单位" prop="unit">
            <el-select v-model="formData.unit" placeholder="请选择单位" style="width: 100%;">
              <el-option label="套" value="套" />
              <el-option label="个" value="个" />
              <el-option label="件" value="件" />
              <el-option label="箱" value="箱" />
              <el-option label="kg" value="kg" />
              <el-option label="KG" value="KG" />
              <el-option label="米" value="米" />
            </el-select>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="价格信息" name="price">
          <el-form-item label="成本价" prop="costPrice">
            <el-input-number
              v-model="formData.costPrice"
              :min="0"
              :precision="2"
              :controls-position="'right'"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="销售价" prop="salePrice">
            <el-input-number
              v-model="formData.salePrice"
              :min="0"
              :precision="2"
              :controls-position="'right'"
              style="width: 100%;"
            />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="库存设置" name="stock">
          <el-form-item label="最低库存" prop="minStock">
            <el-input-number
              v-model="formData.minStock"
              :min="0"
              :controls-position="'right'"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="最高库存">
            <el-input-number
              v-model="formData.maxStock"
              :min="0"
              :controls-position="'right'"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="启用状态">
            <el-switch v-model="formData.isEnabled" />
          </el-form-item>

          <el-form-item label="备注">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ submitting ? '提交中...' : '确定' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createProduct, updateProduct, generateProductCode } from '@/api/product'
import { commonRules, validateLength, validateRange } from '@/utils/validate'

const props = defineProps({
  modelValue: Boolean,
  data: Object,
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.data?.id)

const categoryList = computed(() => props.categories || [])

const formRef = ref()
const activeTab = ref('basic')
const submitting = ref(false)

const formData = reactive({
  id: null,
  productCode: '',
  productName: '',
  categoryId: null,
  spec: '',
  unit: '套',
  costPrice: 0,
  salePrice: 0,
  minStock: 0,
  maxStock: 0,
  isEnabled: true,
  remark: ''
})

const formRules = {
  productName: [
    commonRules.required('请输入商品名称'),
    validateLength(2, 100, '商品名称长度应在2-100个字符之间'),
    { validator: validateNoSpecialChars, trigger: 'blur' }
  ],
  categoryId: [
    commonRules.required('请选择商品分类')
  ],
  unit: [
    commonRules.required('请选择单位')
  ],
  costPrice: [
    commonRules.required('请输入成本价'),
    validateRange(0, 999999.99, '成本价应在0-999999.99之间')
  ],
  salePrice: [
    commonRules.required('请输入销售价'),
    {
      validator: (rule, value, callback) => {
        if (value < formData.costPrice) {
          callback(new Error('销售价不能低于成本价'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  maxStock: [
    {
      validator: (rule, value, callback) => {
        if (value && formData.minStock && value < formData.minStock) {
          callback(new Error('最高库存不能低于最低库存'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 不包含特殊字符验证
function validateNoSpecialChars(rule, value, callback) {
  if (!value) {
    callback()
    return
  }
  // 允许中文、字母、数字、括号、空格等
  const reg = /^[a-zA-Z0-9\u4e00-\u9fa5()（）\-\s]+$/
  if (!reg.test(value)) {
    callback(new Error('商品名称不能包含特殊字符'))
  } else {
    callback()
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    productCode: generateProductCode(),
    productName: '',
    categoryId: null,
    spec: '',
    unit: '套',
    costPrice: 0,
    salePrice: 0,
    minStock: 0,
    maxStock: 0,
    isEnabled: true,
    remark: ''
  })
}

// 监听数据变化
watch(() => props.data, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
  } else {
    resetForm()
  }
}, { immediate: true })

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true

    const data = { ...formData }

    if (isEdit.value) {
      await updateProduct(formData.id, data)
      ElMessage.success('更新成功')
    } else {
      await createProduct(data)
      ElMessage.success('新增成功')
    }

    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-tabs__content) {
  padding-top: 16px;
}

.el-form-item {
  margin-bottom: 18px;
}
</style>
