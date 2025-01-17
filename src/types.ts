import type { Placement } from '@floating-ui/dom';

/** Tour 步骤配置 */
export interface TourStep {
  /** 目标元素的选择器 */
  target: string;
  /** 提示内容 */
  content: string;
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>;
  /** 定位配置 */
  placement?: Placement;
  /** 偏移量配置 */
  offset?: {
    /** 主轴偏移量 */
    mainAxis?: number;
    /** 交叉轴偏移量 */
    crossAxis?: number;
  };
}

/** Tour 配置选项 */
export interface TourConfig {
  /** 是否自动跳过未找到的元素 */
  autoSkipInvalid: boolean;
  /** 是否自动开始执行 */
  autoStart: boolean;
  /** 基础层级，可以是具体数值或 'auto'。当为 'auto' 时将自动计算页面最高层级，会有一定的性能损耗 */
  zIndex: number | 'auto';
  /** 滚动配置 */
  scroll?: {
    /** 滚动偏移量 */
    offset?: number;
    /** 滚动动画时长(ms) */
    duration?: number;
  };
  /** tooltip 配置 */
  tooltip?: {
    /** 最小宽度 */
    minWidth?: number;
    /** 最大宽度 */
    maxWidth?: number;
    /** 默认定位 */
    defaultPlacement?: Placement;
    /** 默认偏移量 */
    defaultOffset?: number;
  };
  /** 动画配置 */
  animation?: {
    /** 动画时长(ms) */
    duration?: number;
    /** 动画缓动函数 */
    easing?: string;
  };
}

/** Tour 实例选项 */
export interface TourOptions {
  /** 引导步骤配置 */
  steps: TourStep[];
  /** Tour 配置 */
  config?: Partial<TourConfig>;
}

/** Tour 实例方法 */
export interface TourInstance {
  /** 进入下一步 */
  next(): void;
  /** 返回上一步 */
  previous(): void;
  /** 跳过引导 */
  skip(): void;
  /** 清理引导相关的所有内容 */
  cleanup(): void;
  /** 跳转到指定步骤 */
  goTo(index: number): void;
  /** 获取当前步骤索引 */
  getCurrentStep(): number;
  /** 获取总步骤数 */
  getTotalSteps(): number;
  /** 是否是第一步 */
  isFirst(): boolean;
  /** 是否是最后一步 */
  isLast(): boolean;
  /** 开始执行引导 */
  run(): void;
}

/** Tour 静态方法 */
export interface TourStatic {
  /** 配置 Tour 的全局设置 */
  configure(options: Partial<TourConfig>): void;
}

/** Tour 构造函数 */
export interface TourConstructor {
  new (options: TourOptions): TourInstance;
  prototype: TourInstance;
}

/** Tour 类型 */
export type TourType = TourConstructor & TourStatic;

/** DOM 元素创建配置 */
export interface CreateElementOptions {
  /** 标签名 */
  tagName: keyof HTMLElementTagNameMap;
  /** 属性对象 */
  props?: Record<string, any>;
  /** 子元素数组 */
  children?: (string | HTMLElement)[];
}

/** 定位更新函数 */
export type UpdatePositionFn = () => void;

/** 清理函数 */
export type CleanupFn = () => void; 