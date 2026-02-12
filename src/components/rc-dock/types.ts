import type { Component, Ref } from "vue";

// Drag/drop direction union used across dock interactions
// 拖拽放置方向的联合类型
export type DropDirectionType =
  | "left"
  | "right"
  | "bottom"
  | "top"
  | "middle"
  | "remove"
  | "before"
  | "after"
  | "float"
  | "front"
  | "maximize"
  | "new-window"
  | "move"
  | "active"
  | "update";

// Single tab definition
// 单个标签页定义
export interface DockTab {
  id: string;
  title: string;
  content?: string | Component;
  closable?: boolean;
  group?: string;
  active?: boolean;
  componentName?: string;
  component?: Component;
  icon?: Component | string;
  // Allow other properties for user custom data
  [key: string]: any;
}

// Context injected by DockLayout
// DockLayout 注入的上下文
export interface DockContextType {
  layout: Ref<LayoutData>;
  onDockMove: (
    source: DockTab | DockPanel,
    target: DockTab | DockPanel | DockBox | string,
    direction: DropDirectionType,
  ) => void;
  findNode: (id: string) => DockBox | DockPanel | DockTab | undefined;
  layoutVersion: Ref<number>;
  getTabComponent: (id: string) => Component | undefined;
}

// Panel contains multiple tabs
// 面板包含多个标签页
export interface DockPanel {
  id: string;
  size?: number;
  tabs: DockTab[];
  activeId?: string;
  group?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  z?: number;
  minWidth?: number;
  minHeight?: number;
  panelLock?: any; // PanelLock
}

// Box contains panels or nested boxes
// 盒子包含面板或子盒子
export interface DockBox {
  id: string;
  mode?: "horizontal" | "vertical" | "float";
  size?: number;
  children: (DockBox | DockPanel)[];
}

// Root layout tree structure
// 布局树根结构
export interface LayoutData {
  dockbox: DockBox;
  floatbox?: DockBox;
  windowbox?: DockBox;
  maxbox?: DockBox;
}

// Persisted state per tab
// 每个标签页的持久化状态
export interface TabState {
  [key: string]: any;
}
