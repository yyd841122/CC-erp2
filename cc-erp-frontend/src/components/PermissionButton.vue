<template>
  <el-button
    v-if="hasAuth"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<script setup>
import { computed } from 'vue'
import { hasPermission, hasAnyPermission } from '@/api/permission'

const props = defineProps({
  permission: String,
  permissions: Array,
  requireAll: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const hasAuth = computed(() => {
  if (props.permission) {
    return hasPermission(props.permission)
  }
  if (props.permissions && props.permissions.length > 0) {
    return props.requireAll
      ? props.permissions.every(p => hasPermission(p))
      : props.permissions.some(p => hasPermission(p))
  }
  return true
})

const handleClick = (e) => {
  emit('click', e)
}
</script>
