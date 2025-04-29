# 执笔马良 - AI 交互式小说生成器

一个基于 AI 的交互式小说生成器，允许用户选择不同的风格，然后通过选择剧情分支来决定故事的走向。

## 项目特点

- 多种小说风格：武侠江湖、科幻探索、奇幻魔法、悬疑推理等
- 丰富的交互选择：用户可以在故事中作出选择，影响故事发展方向
- 流畅的用户体验：美观的界面，无缝的故事过渡
- 历史记录：保存用户的阅读历史，可以随时回顾或继续

## 新增功能

### 1. 基于关键词的 AI 响应解析

- 修改了 AI 交互逻辑，不再依赖严格的 JSON 格式
- 使用关键词（`novelstory:`, `options:`, `structure_thinking:`, `preference_thinking:`）和特定分隔符(`.`)从 AI 响应中提取内容
- 实现了健壮的解析逻辑，可以处理各种可能的 AI 输出格式

### 2. 小说结构思考

- 用户选择风格后，系统会生成一个初始的小说结构大纲
- 当用户选择次数达到阈值（默认为 5 次）后，AI 会分析当前剧情并对后续结构进行调整
- 结构大纲被存储在数据库中，并在每次故事继续时提供给 AI 参考

### 3. 用户偏好分析

- 系统会记录用户的所有选择，并在达到阈值后分析用户的偏好
- AI 可以根据分析结果调整后续剧情和选项，使故事更符合用户喜好
- 偏好分析结果目前会记录在控制台中（仅用于调试）

## 技术栈

- 前端：React, TailwindCSS, Zustand
- 后端：Supabase (数据库、认证)
- AI：Gemini API

## 配置说明

项目中添加了新的环境变量：
```
VITE_STRUCTURE_THINKING_THRESHOLD=5
```
此变量控制触发结构思考和偏好分析的用户选择次数阈值。

## 数据库更新

项目中添加了新的数据库表字段，需要在 Supabase 中执行以下 SQL：

```sql
ALTER TABLE reading_histories
ADD COLUMN structure_outline TEXT DEFAULT NULL;
```

详见 `supabase_update.sql` 文件。

## 安装与运行

1. 克隆项目
2. 安装依赖：`npm install`
3. 配置环境变量：复制 `.env.example` 为 `.env.local` 并填写相关信息
4. 运行开发服务器：`npm run dev`

## 功能特点

- 🎭 多种小说风格：武侠、科幻、奇幻、悬疑等多种风格可选
- 🔄 交互式剧情：每个选择都会影响故事的发展方向
- 💾 阅读历史同步：自动保存并同步阅读历史
- 🌓 深色/浅色主题：支持主题切换，提供舒适的阅读体验
- 🔐 用户认证：支持邮箱注册和登录
- 📱 响应式设计：完美支持各种设备尺寸

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand
- **数据库**: Supabase
- **UI 组件**: Radix UI
- **图标**: Lucide React
- **类型检查**: TypeScript

## 项目结构

```
src/
├── components/      # React 组件
├── data/           # 静态数据
├── lib/            # 工具库
├── services/       # 服务层
├── store/          # 状态管理
├── types/          # TypeScript 类型定义
└── App.tsx         # 应用入口
```

## 数据库结构

### Profiles 表

- `id`: UUID (Primary Key)
- `username`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Reading Histories 表

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> profiles.id)
- `style_id`: Text
- `style_name`: Text
- `content`: Text
- `choices`: JSONB
- `history`: JSONB
- `created_at`: Timestamp
- `updated_at`: Timestamp

## 部署

项目使用 Netlify 进行部署。构建命令和输出目录已在 `netlify.toml` 中配置：

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

[MIT License](LICENSE)
