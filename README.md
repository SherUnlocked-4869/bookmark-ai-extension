# Bookmark AI Extension

一款基于 AI 的 Chrome 书签管理扩展，自动对书签进行分类、去重和统计分析。

## 功能

- **智能分类** — 接入 DeepSeek / OpenAI / Claude API，自动分析书签标题并归入相应分类
- **增量分类** — 同步新书签后仅对未分类书签进行分类，避免重复处理
- **书签去重** — 检测完全相同的 URL 重复和标题相似重复（Levenshtein 距离 > 80%），支持批量删除
- **手动分类** — 点击书签标签即可切换分类，随时调整归类
- **分类管理** — 点击分类名称可重命名，长按拖拽可自由排序
- **搜索过滤** — 按标题或 URL 实时搜索书签
- **统计看板** — 展示分类分布柱状图、书签总数、分类数、未分类数、重复数等统计信息
- **成人内容隐藏** — 自动识别并默认隐藏含"成人"关键词的分类，双击标题栏可切换显示
- **多 API 支持** — 兼容 DeepSeek、OpenAI、Claude 等 API，可在设置中自定义 Base URL

## 安装

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/SherUnlocked-4869/bookmark-ai-extension.git
cd bookmark-ai-extension

# 安装依赖
npm install

# 构建
npm run build
```

构建产物位于 `dist/` 目录。

### 加载到 Chrome

1. 打开 Chrome，访问 `chrome://extensions`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目中的 `dist/` 目录

## 使用

1. 点击扩展图标打开管理页面
2. 进入**设置**页面，配置 API Key、Model 和 Base URL
3. 返回书签管理页，点击**同步**按钮从 Chrome 获取书签
4. 点击**智能分类**按钮（或下拉选择"仅新增"）自动分类书签
5. 使用侧边栏导航切换：书签管理 / 去重 / 统计看板 / 设置

## 技术栈

- React 18 + TypeScript
- Material UI 6
- Vite + CRXJS (Chrome 扩展构建)
- Chrome Extension Manifest V3
- Vitest (测试)

## 项目结构

```
src/
├── tab/                    # 扩展弹出页
│   ├── components/         # UI 组件 (Sidebar, TopBar, CategoryPanel, BookmarkItem 等)
│   ├── hooks/              # 自定义 Hooks (useBookmarks, useCategories, useDedup, useStats, useSettings)
│   ├── pages/              # 页面 (Bookmarks, Settings, DedupPage, StatisticsPage)
│   ├── services/           # 服务层 (storageService, bookmarkService, aiService)
│   ├── theme/              # MUI 主题
│   └── types/              # TypeScript 类型定义
├── dist/                   # 构建产物
├── public/                 # 静态资源 (图标)
└── docs/                   # 设计文档
```

## 许可证

MIT
