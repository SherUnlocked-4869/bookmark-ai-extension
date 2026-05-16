# 书签智能分类扩展功能设计

## 概述

在现有 AI 分类核心功能基础上，重构 UI 为侧边栏导航布局，并新增查重清理、搜索、手动分类调整、统计看板、增量分类等功能。

## 架构设计

### 布局结构

```
+------------------------------------------------------+
| AppBar: 书签智能分类     [搜索框...]  [同步] [智能分类] |
+----------+-------------------------------------------+
| 侧边栏   |  主内容区域                                |
|          |                                           |
| 📑 书签   |  (根据选中页面渲染不同内容)                |
| 🔍 查重   |                                           |
| 📊 统计   |                                           |
| ⚙️ 设置   |                                           |
|          |                                           |
+----------+-------------------------------------------+
```

### 路由方案

使用 `useState<Page>` 进行页面切换，不引入 react-router：

```typescript
type Page = 'bookmarks' | 'dedup' | 'statistics' | 'settings';
```

### 组件树

```
App
├── ThemeProvider
├── Layout (新)
│   ├── AppBar (从 TopBar 升级)
│   │   ├── 标题（双击触发成人分类显隐切换）
│   │   ├── 搜索框（书签页专用）
│   │   └── 操作按钮（同步/分类）
│   ├── Sidebar (新)
│   │   └── NavItem[]
│   └── Content
│       ├── BookmarksPage (增强)
│       ├── DedupPage (新)
│       ├── StatisticsPage (新)
│       └── SettingsPage (已有)
```

## 功能设计

### 1. 侧边栏导航

- 固定宽度 200px，左侧放置导航项
- 导航项包含图标 + 文字标签
- 当前选中项高亮
- 可收起为图标模式（可选增强）

### 2. 书签管理页（增强）

#### 全文搜索
- 搜索框位于 AppBar 区域，仅在书签页显示
- 实时前端过滤，匹配书签标题和 URL
- 搜索时匹配的分类保留，不匹配的分类折叠
- 匹配文字高亮显示

#### 手动调整分类
- 每个书签右下角显示当前分类名，带下拉箭头
- 点击弹出分类选择菜单，列出所有可用分类
- 选择后即时更新 storage 和 UI
- 书签自动移到新分类下

### 3. 查重清理页

#### 重复检测逻辑
- **完全重复**：URL 完全一致
- **疑似重复**：标题编辑距离相似度 > 80% 且域名相同

#### 页面布局
- 顶部"开始扫描"按钮，扫描完成后显示统计
- 重复组列表，按类型分组（完全重复 / 疑似重复）
- 每组显示书签标题、URL、所属分类
- 勾选要删除的书签，每组至少保留一个
- 底部操作栏：全选、反选、删除选中
- 删除通过 `chrome.bookmarks.remove` 同步到 Chrome

#### 整理报告（页面顶部摘要）
- 书签总数 / 分类数 / 未分类数 / 重复组数 / 已删除数
- 数据存入 storage，每次分类或查重后更新

### 4. 统计看板

- 顶部概览数字卡片：书签总数、分类数、未分类、重复组数
- 分类分布条形图（纯 CSS 实现，比例条宽度 = count/maxCount * 100%）
- 排序切换：数量降序/升序/字母序
- 底部统计摘要：最大分类、最小分类、平均每类数量

### 5. 增量分类

- 同步后检测新增书签，自动弹出提示"发现 N 个新书签，是否分类？"
- 智能分类按钮增加下拉选项："全部分类"和"仅新增"
- 后台分类，不阻塞用户其他操作

### 6. 成人分类隐藏

- **机制**：约定分类名匹配（可配置 `hiddenCategories: string[]` 存 storage）
- **默认**：匹配的分类及其书签在列表和统计中隐藏
- **触发**：双击 AppBar 标题文字切换显隐
- **提示**：书签页侧边栏图标旁显示红点提示"隐藏分类中有 N 个书签"
- **切换反馈**：Snackbar 提示"已显示" / "已隐藏"

### 数据流

```
chrome.bookmarks API
       ↓
bookmarkService.getAllBookmarks()
       ↓
storageService (chrome.storage.local)
  ├── settings
  ├── categories
  ├── classifications
  ├── lastSyncTime
  ├── bookmarksSnapshot
  ├── hiddenCategories (新增)
  ├── dedupReport (新增)
  └── stats (新增)
       ↓
React Hooks (useBookmarks, useCategories, useStats 等)
       ↓
Components
```

## 文件变更清单

### 新增文件
- `src/tab/components/Layout.tsx` — 整体布局（AppBar + Sidebar + Content）
- `src/tab/components/Sidebar.tsx` — 侧边栏导航
- `src/tab/components/SearchBar.tsx` — 搜索框组件
- `src/tab/pages/DedupPage.tsx` — 查重清理页
- `src/tab/pages/StatisticsPage.tsx` — 统计看板
- `src/tab/hooks/useDedup.ts` — 查重逻辑 hook
- `src/tab/hooks/useStats.ts` — 统计计算 hook
- `src/tab/hooks/useSearch.ts` — 搜索逻辑 hook

### 修改文件
- `src/tab/App.tsx` — 集成 Layout，切换页面
- `src/tab/pages/Bookmarks.tsx` — 集成搜索、手动分类、成人隐藏
- `src/tab/components/TopBar.tsx` — 升级为 AppBar（增加搜索插槽、双击事件）
- `src/tab/components/BookmarkItem.tsx` — 增加分类切换下拉菜单
- `src/tab/types/index.ts` — 增加新类型定义
- `src/tab/services/storageService.ts` — 增加新字段读写
