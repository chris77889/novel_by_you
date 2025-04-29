# 执笔马良 - AI Interactive Novel Generator

一个基于 AI 的交互式小说生成器，让用户可以通过选择不同的剧情分支来影响故事的发展方向。

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

## 开发环境设置

1. 克隆项目并安装依赖：

```bash
git clone <repository-url>
cd novel-generator
npm install
```

2. 配置环境变量：

创建 `.env` 文件并添加以下配置：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_API_KEY=your_ai_api_key
VITE_AI_CREATIVE_MODEL_NAME=your_model_name
VITE_AI_CREATIVE_MODEL_ENDPOINT=your_model_endpoint
```

3. 启动开发服务器：

```bash
npm run dev
```

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
