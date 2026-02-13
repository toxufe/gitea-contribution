# Gittea 贡献热力图生成器

轻量级的 Node.js 脚本，用于连接自部署的 Gittea 实例，获取指定用户的贡献数据，并在本地生成类似 GitHub 的贡献热力图。

![示例热力图](https://img.shields.io/badge/Node.js-18+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ 特性

- 🏠 **私有部署支持** - 完美支持自托管（Self-hosted）的 Gittea/Gitea 实例
- 📅 **按需统计** - 支持自定义统计的起止日期范围，不仅限于当前年份
- 🚀 **无需依赖** - 基于 Node.js 原生 HTTP 和 Fetch API，无需安装 node_modules（Node.js 18+ 环境下）
- 🔍 **自动解析** - 输入用户名即可自动查找 User ID
- 🎨 **GitHub 风格** - 生成与 GitHub 一致的贡献热力图样式
- 📊 **详细统计** - 显示总贡献数、活跃天数、最高贡献等统计信息
- 🌐 **双格式输出** - 同时生成 SVG 和 HTML 两种格式，HTML 版本支持交互式悬停提示
- ⚡ **智能降级** - 自动尝试三种 API（Heatmap → Activities → Repos），选择最快的可用方式

## 📋 前置要求

- Node.js 18.0.0 或更高版本
- 有效的 Gittea/Gitea 实例访问权限
- 个人访问令牌（Personal Access Token）

## 🚀 快速开始

### 1. 克隆或下载项目

```bash
git clone <your-repo-url>
cd gittea.contribution
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的配置：

```env
GITTEA_URL=https://your-gittea-instance.com
GITTEA_TOKEN=your_personal_access_token_here
GITTEA_USERNAME=your_username
```

#### 如何获取 Personal Access Token？

1. 登录您的 Gittea 实例
2. 进入 **设置** → **应用** → **访问令牌**
3. 点击 **生成新令牌**
4. 选择权限（至少需要 `read:user` 和 `read:repository`）
5. 复制生成的令牌到 `.env` 文件

### 3. 运行脚本

```bash
node index.js
```

生成的热力图将保存为 `contribution-heatmap.svg`。

## 📖 使用方法

### 基本用法

使用 `.env` 文件中的配置：

```bash
node index.js
```

### 命令行参数

您也可以通过命令行参数覆盖 `.env` 配置：

```bash
node index.js --url https://git.example.com --username myuser --token mytoken
```

### 自定义日期范围

生成特定时间段的热力图：

```bash
node index.js --start-date 2025-01-01 --end-date 2025-12-31
```

### 自定义输出文件名

```bash
node index.js --output my-heatmap.svg
```

### 完整参数列表

| 参数 | 说明 | 示例 |
|------|------|------|
| `--url` | Gittea 实例 URL | `--url https://git.example.com` |
| `--username` | 用户名 | `--username myuser` |
| `--token` | 访问令牌 | `--token abc123...` |
| `--start-date` | 起始日期 (YYYY-MM-DD) | `--start-date 2025-01-01` |
| `--end-date` | 结束日期 (YYYY-MM-DD) | `--end-date 2025-12-31` |
| `--output` | 输出文件名 | `--output my-heatmap.svg` |

## 📊 输出示例

脚本会生成两种格式的热力图：

### 1. SVG 格式 (`contribution-heatmap.svg`)
- 矢量图形，可无限缩放
- 适合嵌入到文档或网页中
- 文件体积小

### 2. HTML 格式 (`contribution-heatmap.html`)
- 独立的网页文件，可直接在浏览器中打开
- 包含现代化的渐变背景和卡片设计
- 交互式悬停提示（显示具体日期和贡献数）
- 统计信息以卡片形式展示
- 响应式设计，适配各种屏幕尺寸

两种格式都包含：
- 📅 按周排列的贡献网格
- 🎨 GitHub 风格的颜色编码（颜色越深 = 贡献越多）
- 📈 统计信息（总贡献、活跃天数、最高贡献、平均贡献）
- 🏷️ 月份和星期标签
- 💡 悬停提示（HTML 版本更美观）

### 额外工具：查看器 (`viewer.html`)
- 可以加载和查看任意 SVG 热力图文件
- 支持文件上传和下载
- 自动提取并显示统计信息

## 🔧 故障排除

### 错误：无法连接到 Gittea 实例

- 检查 `GITTEA_URL` 是否正确（包括 `https://` 前缀）
- 确认网络连接正常
- 验证 Gittea 实例是否可访问

### 错误：认证失败

- 确认 `GITTEA_TOKEN` 是否有效
- 检查令牌是否具有必要的权限（`read:user`、`read:repository`）
- 尝试重新生成令牌

### 错误：用户不存在

- 验证 `GITTEA_USERNAME` 拼写是否正确
- 确认该用户在 Gittea 实例中存在

### 没有数据或数据很少

- Gittea API 可能有限制，脚本会自动尝试两种方式获取数据：
  1. 用户活动 API
  2. 仓库提交统计（备用方案）
- 检查用户在指定日期范围内是否有实际贡献

## 🛠️ 技术栈

- **Node.js 18+** - 使用原生 Fetch API
- **ES Modules** - 现代 JavaScript 模块系统
- **SVG** - 可缩放矢量图形输出

## 📝 项目结构

```
gittea.contribution/
├── index.js                 # 主入口文件
├── lib/
│   ├── gittea-client.js    # Gittea API 客户端
│   ├── data-processor.js   # 数据处理模块
│   └── heatmap-generator.js # SVG 热力图生成器
├── package.json            # 项目配置
├── .env.example            # 环境变量模板
├── .gitignore              # Git 忽略文件
└── README.md               # 本文件
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- 灵感来源于 GitHub 的贡献热力图
- 支持所有自托管的 Gittea/Gitea 实例

---

**提示**: 如果您觉得这个项目有用，请给它一个 ⭐️！
