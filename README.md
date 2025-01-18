# TourJS

🎯 一个轻量级的页面引导库，帮助用户快速了解网页功能。

## ✨ 特性

- 🚀 **轻量级**: 无依赖，体积小巧
- 🎨 **可定制**: 支持自定义样式和动画
- 🎯 **智能定位**: 自动计算最佳显示位置
- ⚡️ **性能优化**: 智能的 z-index 管理和动画性能优化
- 📱 **响应式**: 自适应不同屏幕尺寸
- 🔧 **易配置**: 丰富的配置选项

## 📦 安装

```bash
npm install @adiynil/tourjs
```

## 🚀 快速开始

```typescript
import { Tour } from '@adiynil/tourjs';

// 创建引导实例
const tour = new Tour({
  steps: [
    {
      target: '#step1',
      content: '这是第一步引导'
    },
    {
      target: '.step2',
      content: '这是第二步引导',
      placement: 'right'
    }
  ],
  config: {
    autoStart: true,
    zIndex: 'auto'
  }
});

// 开始引导
tour.run();
```

## ⚙️ 配置项

### Tour 配置

```typescript
interface TourConfig {
  // 是否自动跳过未找到的元素
  autoSkipInvalid: boolean;
  // 是否自动开始执行
  autoStart: boolean;
  // 基础层级，可以是具体数值或 'auto'
  zIndex: number | 'auto';
  // 滚动配置
  scroll?: {
    offset?: number;
    duration?: number;
  };
  // tooltip 配置
  tooltip?: {
    minWidth?: number;
    maxWidth?: number;
    defaultPlacement?: 'top' | 'right' | 'bottom' | 'left';
    defaultOffset?: number;
  };
  // 动画配置
  animation?: {
    duration?: number;
    easing?: string;
  };
}
```

### 步骤配置

```typescript
interface TourStep {
  // 目标元素的选择器
  target: string;
  // 提示内容
  content: string;
  // 自定义样式
  style?: Partial<CSSStyleDeclaration>;
  // 定位配置
  placement?: 'top' | 'right' | 'bottom' | 'left';
  // 偏移量配置
  offset?: {
    mainAxis?: number;
    crossAxis?: number;
  };
}
```

## 📖 API

### 实例方法

- `next()`: 进入下一步
- `previous()`: 返回上一步
- `skip()`: 跳过引导
- `cleanup()`: 清理引导
- `goTo(index)`: 跳转到指定步骤
- `getCurrentStep()`: 获取当前步骤索引
- `getTotalSteps()`: 获取总步骤数
- `isFirst()`: 是否是第一步
- `isLast()`: 是否是最后一步
- `run()`: 开始执行引导

### 静态方法

- `Tour.configure(options)`: 配置全局设置

## 📄 许可证

[MIT License](./LICENSE) 