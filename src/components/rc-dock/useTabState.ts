import { inject, reactive, watch } from "vue";
import { getTabState, saveTabState } from "./DockData";

/**
 * Composition API for persistent tab state
 * 用于持久化标签页状态的组合式 API
 *
 * @param initialState - Default state values (默认状态值)
 * @returns - Reactive state object that auto-saves (自动保存的响应式状态对象)
 */
// Persisted state helper for tab content components
// 标签内容组件的持久化状态助手
export function useTabState<T extends Record<string, any>>(
  initialState: T = {} as T,
): T {
  const tabId = inject<string>("dock-tab-id");

  if (!tabId) {
    console.warn("useTabState called outside of a DockTab");
    return reactive(initialState) as T;
  }

  // Get persistent state object from global store
  // 从全局存储获取持久化状态对象
  const savedState = getTabState(tabId);

  // Initialize default values if not present
  // 如果不存在则初始化默认值
  for (const key in initialState) {
    if (savedState[key] === undefined) {
      savedState[key] = initialState[key];
    }
  }

  // Create a reactive proxy directly to the saved state
  // 直接为保存的状态创建响应式代理
  const state = reactive(savedState) as T;

  // Watch for changes and trigger save
  // 监听变化并触发保存
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  watch(
    state,
    () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTabState();
      }, 300);
    },
    { deep: true },
  );

  return state;
}
