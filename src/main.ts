import { arrow, autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { TourStep, TourConfig, TourOptions, TourInstance, TourConstructor } from './types';
import { createElement, getStaticSide, isElementInViewport, getHighestZIndex } from './utils';
import jump from "jump.js";
import "./style.less";

/**
 * Tour 类 - 用于创建页面引导流程
 * @class Tour
 */
export class Tour implements TourInstance {
  /** 当前高亮的目标元素 */
  private targetElement?: HTMLElement;
  /** tooltip 元素 */
  private tooltipElement?: HTMLElement;
  /** tooltip 的箭头元素 */
  private arrowElement?: HTMLElement;
  /** 位置更新清理函数 */
  private positionCleanup?: () => void;
  /** 当前步骤索引 */
  private currentStep: number = 0;
  /** 引导步骤配置 */
  private steps: TourStep[] = [];
  /** 实例配置 */
  private instanceConfig?: Partial<TourConfig>;

  /** Tour 的全局配置 */
  private static config: TourConfig = {
    /** 是否自动跳过未找到的元素 */
    autoSkipInvalid: true,
    /** 是否自动开始执行 */
    autoStart: true,
    /** 基础层级 */
    zIndex: 9999
  };

  constructor(options: TourOptions | TourStep[]) {
    // 判断参数类型并标准化为 TourOptions
    const normalizedOptions: TourOptions = Array.isArray(options) 
      ? { steps: options }
      : options;

    if (!normalizedOptions?.steps?.length) {
      console.warn('未配置有效的引导步骤，导览已结束');
      return;
    }
    
    this.steps = normalizedOptions.steps;
    this.instanceConfig = normalizedOptions.config;
    this.createTooltipElements();
    
    if (this.getConfig().autoStart) {
      this.run();
    }
  }

  /**
   * 获取合并后的最终配置
   * @private
   * @returns {TourConfig} 最终配置
   */
  private getConfig(): TourConfig {
    return {
      ...Tour.config,
      ...this.instanceConfig
    };
  }

  /**
   * 检查当前步骤的目标元素是否存在
   * @private
   * @returns {HTMLElement | null} 目标元素或 null
   */
  private checkTargetElement(): HTMLElement | null {
    const step = this.steps[this.currentStep];
    return document.querySelector<HTMLElement>(step.target);
  }

  /**
   * 初始化当前步骤
   * @description
   * 1. 清理上一步的位置更新监听
   * 2. 检查目标元素是否存在
   * 3. 移除上一个目标元素的高亮样式
   * 4. 隐藏 tooltip
   * 5. 检查目标元素是否在视口内，决定是否需要滚动
   * @private
   */
  private initStep(): void {
    this.positionCleanup?.();
    
    const targetElement = this.checkTargetElement();
    if (!targetElement) return;

    this.targetElement?.classList.remove("_tourjs-target--highlighted");
    this.targetElement = targetElement;

    if (this.tooltipElement) {
      this.tooltipElement.setAttribute('data-show', 'false');
    }

    // 检查目标元素是否在视口内
    if (!isElementInViewport(targetElement)) {
      // 如果不在视口内，则滚动到目标元素
      jump(this.targetElement, {
        offset: -10,
        duration: 300,
        callback: () => this.showTooltip()
      });
    } else {
      // 如果已经在视口内，直接显示 tooltip
      setTimeout(() => {
        this.showTooltip();
      }, 300);
    }
  }

  /**
   * 显示 tooltip
   * @description
   * 1. 高亮目标元素
   * 2. 更新 tooltip 内容
   * 3. 启动位置自动更新
   * 4. 显示 tooltip
   * @private
   */
  private showTooltip(): void {
    if (!this.targetElement || !this.tooltipElement) return;

    this.targetElement.classList.add("_tourjs-target--highlighted");
    this.updateTooltipContent();

    requestAnimationFrame(() => {
      if (this.tooltipElement && this.targetElement) {
        this.positionCleanup = autoUpdate(
          this.targetElement,
          this.tooltipElement,
          this.updatePosition()
        );
        this.tooltipElement.setAttribute('data-show', 'true');
      }
    });
  }

  /**
   * 清理引导相关的所有内容
   * @description 
   * 1. 移除 tooltip 元素
   * 2. 清理位置更新监听
   * 3. 移除目标元素的高亮样式
   * 4. 重置当前步骤
   * @public
   */
  public cleanup() {
    if (this.tooltipElement) {
      this.tooltipElement.setAttribute('data-show', 'false');
      setTimeout(() => {
        this.tooltipElement?.remove();
        this.tooltipElement = undefined;
        this.arrowElement = undefined;
      }, 300);
    }
    
    this.positionCleanup?.();
    this.targetElement?.classList.remove("_tourjs-target--highlighted");
    this.targetElement = undefined;
    this.currentStep = 0;
  }

  /**
   * 更新 tooltip 的位置
   * @description
   * 1. 计算 tooltip 相对于目标元素的位置
   * 2. 应用偏移、翻转、移位等中间件
   * 3. 更新 tooltip 和箭头的位置
   * @private
   * @returns {() => void} 位置更新函数
   */
  private updatePosition() {
    return () => {
      if (!this.targetElement || !this.tooltipElement || !this.arrowElement) return;

      computePosition(this.targetElement, this.tooltipElement, {
        placement: "bottom",
        middleware: [
          offset(12),
          flip(),
          shift({ padding: 5 }),
          arrow({ element: this.arrowElement }),
        ],
      }).then(({ x, y, placement, middlewareData }) => {
        Object.assign(this.tooltipElement!.style, {
          left: `${x}px`,
          top: `${y}px`,
        });

        const { x: arrowX, y: arrowY } = middlewareData.arrow || {};
        const staticSide = getStaticSide(placement);

        Object.assign(this.arrowElement!.style, {
          left: arrowX != null ? `${arrowX}px` : "",
          top: arrowY != null ? `${arrowY}px` : "",
          right: "",
          bottom: "",
          [staticSide]: "-4px",
        });
      });
    };
  }

  /**
   * 创建 tooltip 相关的 DOM 元素
   * @description
   * 1. 创建 tooltip 容器元素
   * 2. 创建箭头元素
   * 3. 创建内容区域
   * 4. 创建按钮组
   * 5. 将所有元素添加到文档中
   * @private
   */
  private createTooltipElements() {
    if (this.tooltipElement) return;

    // 创建新的tooltip
    this.arrowElement = createElement("div", { class: "tourjs-step-arrow" });
    this.tooltipElement = createElement("div", { class: "tourjs-step" }, [this.arrowElement]);

    // 获取基础层级
    const baseZIndex = this.getConfig().zIndex;
    // 计算最终层级
    const finalZIndex = baseZIndex === 'auto' ? getHighestZIndex() : baseZIndex;
    
    // 设置层级
    this.tooltipElement.style.setProperty('z-index', String(finalZIndex));
    this.targetElement?.style.setProperty('z-index', String(finalZIndex - 1));

    const content = createElement("div", { class: "tourjs-step-content" });
    const buttons = this.createButtons();
    const btnGroup = createElement("div", { class: "tourjs-step-btn-group" }, buttons);

    this.tooltipElement.appendChild(content);
    this.tooltipElement.appendChild(btnGroup);
    document.body.appendChild(this.tooltipElement);
  }

  /**
   * 更新 tooltip 的内容和按钮
   * @description
   * 1. 更新内容区域的文本
   * 2. 重新创建按钮组
   * @private
   */
  private updateTooltipContent() {
    if (!this.tooltipElement) return;

    const content = this.tooltipElement.querySelector('.tourjs-step-content');
    if (content) {
      content.textContent = this.steps[this.currentStep].content;
    }

    const btnGroup = this.tooltipElement.querySelector('.tourjs-step-btn-group');
    if (btnGroup) {
      btnGroup.replaceWith(createElement("div", { class: "tourjs-step-btn-group" }, this.createButtons()));
    }
  }

  /**
   * 创建操作按钮
   * @description
   * 1. 创建上一步按钮（如果不是第一步）
   * 2. 创建下一步/完成按钮
   * 3. 创建跳过按钮（如果不是最后一步）
   * 4. 绑定按钮点击事件
   * @private
   * @returns {HTMLElement[]} 按钮元素数组
   */
  private createButtons() {
    const btnPrevious = createElement("button", {
      class: `tourjs-step-btn ${this.isFirst() ? 'tourjs-step-btn-disabled' : ''}`,
      disabled: this.isFirst() ? "disabled" : undefined
    }, ["上一步"]);

    const btnNext = createElement("button", {
      class: 'tourjs-step-btn tourjs-step-btn-primary',
    }, [this.isLast() ? "完成" : "下一步"]);

    const buttons = [btnPrevious, btnNext];
    if (!this.isLast()) {
      const btnSkip = createElement("button", {
        class: "tourjs-step-btn tourjs-step-btn-skip"
      }, ["跳过"]);
      btnSkip.addEventListener('click', () => this.skip());
      buttons.push(btnSkip);
    }

    btnPrevious.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.previous();
      }
    });
    
    btnNext.addEventListener('click', () => {
      if (this.currentStep === this.steps.length - 1) {
        this.cleanup();
      } else {
        this.next();
      }
    });

    return buttons;
  }

  /**
   * 进入下一步
   * @public
   */
  public next(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      const targetElement = this.checkTargetElement();
      
      if (!targetElement) {
        if (this.getConfig().autoSkipInvalid && this.currentStep < this.steps.length - 1) {
          console.warn(`目标元素 ${this.steps[this.currentStep].target} 未找到，已自动跳过`);
          return this.next();
        }
        this.cleanup();
        throw new Error(`目标元素 ${this.steps[this.currentStep].target} 未找到`);
      }

      this.initStep();
    } else {
      this.skip();
    }
  }

  /**
   * 返回上一步
   * @public
   */
  public previous(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      const targetElement = this.checkTargetElement();
      
      if (!targetElement) {
        if (this.getConfig().autoSkipInvalid && this.currentStep > 0) {
          console.warn(`目标元素 ${this.steps[this.currentStep].target} 未找到，已自动跳过`);
          return this.previous();
        }
        this.cleanup();
        throw new Error(`目标元素 ${this.steps[this.currentStep].target} 未找到`);
      }

      this.initStep();
    }
  }

  /**
   * 跳过引导
   * @public
   */
  public skip() {
    this.cleanup();
  }

  /**
   * 配置 Tour 的全局设置
   * @static
   * @param {Partial<typeof Tour.config>} options - 配置选项
   */
  public static configure(options: Partial<typeof Tour.config>) {
    Object.assign(Tour.config, options);
  }

  public goTo(index: number): void {
    if (index < 0 || index >= this.steps.length) {
      throw new Error(`步骤索引 ${index} 不合法，有效范围: 0-${this.steps.length - 1}`);
    }

    this.currentStep = index;
    const targetElement = this.checkTargetElement();
    
    if (!targetElement) {
      this.cleanup();
      throw new Error(`目标元素 ${this.steps[this.currentStep].target} 未找到`);
    }

    this.initStep();
  }

  public getCurrentStep(): number {
    return this.currentStep;
  }

  public getTotalSteps(): number {
    return this.steps.length;
  }

  public isFirst(): boolean {
    return this.currentStep === 0;
  }

  public isLast(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  /**
   * 开始执行引导
   * @public
   */
  public run(): void {
    this.currentStep = 0;
    this.initStep();
  }
}

// 导出所有类型和工具函数
export type {
  TourStep,
  TourConfig,
  TourOptions,
  TourInstance,
  TourConstructor
};

export {
  createElement,
  getStaticSide,
  isElementInViewport
};