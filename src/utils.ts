import type { Placement } from '@floating-ui/dom';

/**
 * 创建 DOM 元素
 * @param tagName 标签名
 * @param props 属性对象
 * @param children 子元素数组
 * @returns HTMLElement
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props: Record<string, any> = {},
  children: (string | HTMLElement)[] = []
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tagName);

  // 处理属性
  for (const [key, value] of Object.entries(props)) {
    if (value != null) {
      el.setAttribute(key, String(value));
    }
  }

  // 处理子元素
  children.forEach((child) => {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  });

  return el;
}

/**
 * 获取定位的静态边
 * @param placement 定位位置
 * @returns 静态边
 */
export function getStaticSide(placement: Placement): string {
  const sides = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  };
  return sides[placement.split("-")[0] as keyof typeof sides];
}

/**
 * 判断元素是否在可视区域内
 * @param element 要检查的元素
 * @returns 是否完全可见
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  // 检查元素是否完全在视口内
  const verticallyVisible = (rect.top >= 0 && rect.bottom <= windowHeight);
  const horizontallyVisible = (rect.left >= 0 && rect.right <= windowWidth);

  return verticallyVisible && horizontallyVisible;
}

/**
 * 获取当前页面最高的 z-index 值
 * @description 只检查可能具有较高 z-index 的元素，如 fixed/absolute 定位的元素
 * @returns {number} 最高的 z-index 值加 1
 */
export function getHighestZIndex(): number {
  // 基础 z-index 值
  let highest = 2000;

  // 常见的高层级容器选择器
  const selectors = [
    'modal',
    'dialog',
    'drawer',
    'popup',
    'tooltip',
    'dropdown',
    'overlay',
    'mask',
  ].map(name => `[class*="${name}"]`).join(',');

  // 查找所有固定/绝对定位且可能有较高 z-index 的元素
  const elements = document.querySelectorAll<HTMLElement>(`
    ${selectors},
    [style*="z-index"],
    [style*="position: fixed"],
    [style*="position: absolute"]
  `);

  for (const element of elements) {
    const style = window.getComputedStyle(element);
    const position = style.position;
    
    // 只检查固定或绝对定位的元素
    if (position === 'fixed' || position === 'absolute') {
      const zIndex = style.zIndex;
      const zIndexNum = !isNaN(Number(zIndex)) ? Number(zIndex) : 0;
      highest = Math.max(highest, zIndexNum);
    }
  }

  return highest + 1;
}