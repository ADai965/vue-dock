<script setup lang="ts">
import { provide, ref, shallowRef, watchEffect, onMounted, watch } from "vue";
import type { Component } from "vue";
import { DockContext } from "./DockData";
import { dockMove, find } from "./Algorithm";
import DockBox from "./DockBox.vue";
import type {
  LayoutData,
  DockTab,
  DropDirectionType,
  DockBox as DockBoxType,
  DockPanel,
} from "./types";

const props = withDefaults(
  defineProps<{
    defaultLayout?: LayoutData;
    componentRegistry?: Record<string, Component>;
  }>(),
  {
    defaultLayout: () => ({
      dockbox: { id: "root", mode: "horizontal", children: [] },
    }),
    componentRegistry: () => ({}),
  },
);

// Reactive layout state and version counter
// 布局状态与版本号（用于触发渲染刷新）
const layout = ref<LayoutData>(props.defaultLayout);
const layoutVersion = ref(0);

// Cache for persistent components
// 持久化组件的缓存
const tabCache = shallowRef(new Map<string, Component>());

// Persistence
// 持久化逻辑
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const saveLayout = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      // Serialize layout, excluding non-serializable Vue components
      // 序列化布局，排除不可序列化的 Vue 组件
      const json = JSON.stringify(layout.value, (key, value) => {
        if (key === "component") return undefined;
        return value;
      });
      localStorage.setItem("dock-layout", json);
    } catch (e) {
      console.error("Failed to save layout", e);
    }
  }, 500); // 500ms debounce (500ms 防抖)
};

const restoreLayout = () => {
  try {
    const saved = localStorage.getItem("dock-layout");
    if (saved) {
      const parsed = JSON.parse(saved);

      // Re-attach Vue components based on componentName
      // 根据 componentName 重新挂载 Vue 组件
      const attachComponents = (node: any) => {
        if (!node) return;
        if (node.tabs) {
          (node.tabs as DockTab[]).forEach((tab) => {
            if (
              tab.componentName &&
              props.componentRegistry[tab.componentName]
            ) {
              tab.component = props.componentRegistry[tab.componentName];
            }
          });
        }
        if (node.children) {
          node.children.forEach(attachComponents);
        }
      };

      if (parsed.dockbox) attachComponents(parsed.dockbox);
      if (parsed.floatbox) attachComponents(parsed.floatbox);

      layout.value = parsed;
      layoutVersion.value++;
    }
  } catch (e) {
    console.error("Failed to restore layout", e);
  }
};

onMounted(() => {
  restoreLayout();
});

// Auto-save when layout changes
// 布局变化时自动保存
watch(
  layout,
  () => {
    saveLayout();
  },
  { deep: true },
);

// Commit layout changes and bump version
// 提交布局变更并递增版本号
const updateLayout = (newLayout: LayoutData) => {
  layout.value = newLayout;
  layoutVersion.value++;
};

// Public move API used by panels/tabs
// 面板与标签页调用的移动入口
const onDockMove = (
  source: DockTab | DockPanel,
  target: DockTab | DockPanel | DockBoxType | string,
  direction: DropDirectionType,
) => {
  const newLayout = dockMove(layout.value, source, target, direction);
  updateLayout(newLayout);
};

// Find node by id from current layout tree
// 在当前布局树中按 id 查找节点
const findNode = (id: string) => find(layout.value, id);

// Gather all tabs for rendering and update cache
// 收集所有标签页用于渲染并更新缓存
const getAllTabs = (node: DockBoxType | DockPanel): DockTab[] => {
  let tabs: DockTab[] = [];
  if ("tabs" in node && node.tabs) {
    tabs = [...node.tabs];
  }
  if ("children" in node && node.children) {
    for (const child of node.children) {
      tabs = [...tabs, ...getAllTabs(child)];
    }
  }
  return tabs;
};

// Automatically update cache when layout changes
// 布局变化时自动更新缓存
watchEffect(() => {
  const tabs = getAllTabs(layout.value.dockbox);
  const activeIds = new Set<string>();

  for (const tab of tabs) {
    activeIds.add(tab.id);
    if (!tabCache.value.has(tab.id) && tab.component) {
      tabCache.value.set(tab.id, tab.component);
    }
  }

  for (const key of tabCache.value.keys()) {
    if (!activeIds.has(key)) {
      tabCache.value.delete(key);
    }
  }
});

provide(DockContext, {
  layout,
  onDockMove,
  findNode,
  layoutVersion,
  getTabComponent: (id: string) => tabCache.value.get(id),
});

defineExpose({
  dockMove: onDockMove,
  find: findNode,
  updateLayout,
});
</script>

<template>
  <div class="dock-layout">
    <DockBox v-if="layout.dockbox" :box-data="layout.dockbox" />
  </div>
</template>

<style>
.dock-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1e1e1e;
  color: #ccc;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
}
</style>
