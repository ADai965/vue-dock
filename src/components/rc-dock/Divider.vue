<script setup lang="ts">
const props = defineProps<{
  mode: string
}>()

const emit = defineEmits<{
  (e: 'start-resize', event: MouseEvent): void
}>()

// Emit resize start to parent box
// 通知父容器开始调整大小
const onMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  emit('start-resize', e)
}
</script>

<template>
  <div 
    class="dock-divider" 
    :class="'dock-divider-' + mode"
    @mousedown="onMouseDown"
  ></div>
</template>

<style>
.dock-divider {
  background: #1e1e1e;
  z-index: 1;
  position: relative;
}
.dock-divider-horizontal {
  width: 4px;
  cursor: col-resize;
  border-left: 1px solid #333;
  border-right: 1px solid #333;
}
.dock-divider-vertical {
  height: 4px;
  cursor: row-resize;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
}
.dock-divider:hover {
  background: #007fd4;
}
</style>
