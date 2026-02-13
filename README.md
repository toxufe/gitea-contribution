# Gittea Contribution Heatmap Generator

A lightweight Node.js script to connect to self-hosted Gittea instances, fetch user contribution data, and generate a GitHub-style contribution heatmap locally.

![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

[中文文档](./README_CN.md)

## ✨ Features

- 🏠 **Self-hosted Support** - Perfect support for self-hosted Gittea/Gitea instances
- 📅 **Custom Date Range** - Support custom start and end dates, not limited to current year
- 🚀 **Zero Dependencies** - Based on Node.js native HTTP and Fetch API, no node_modules required (Node.js 18+)
- 🔍 **Auto Resolution** - Automatically find User ID by username
- 🎨 **GitHub Style** - Generate contribution heatmap with GitHub-consistent styling
- 📊 **Detailed Statistics** - Display total contributions, active days, max contributions, and more

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- Valid Gittea/Gitea instance access
- Personal Access Token

## 🚀 Quick Start

### 1. Clone or Download

```bash
git clone <your-repo-url>
cd gittea.contribution
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
GITTEA_URL=https://your-gittea-instance.com
GITTEA_TOKEN=your_personal_access_token_here
GITTEA_USERNAME=your_username
```

#### How to Get Personal Access Token?

1. Log in to your Gittea instance
2. Go to **Settings** → **Applications** → **Access Tokens**
3. Click **Generate New Token**
4. Select permissions (at least `read:user` and `read:repository`)
5. Copy the generated token to `.env` file

### 3. Run the Script

```bash
node index.js
```

The generated heatmap will be saved as `contribution-heatmap.svg`.

## 📖 Usage

### Basic Usage

Use configuration from `.env` file:

```bash
node index.js
```

### Command Line Arguments

Override `.env` configuration with command line arguments:

```bash
node index.js --url https://git.example.com --username myuser --token mytoken
```

### Custom Date Range

Generate heatmap for specific time period:

```bash
node index.js --start-date 2025-01-01 --end-date 2025-12-31
```

### Custom Output Filename

```bash
node index.js --output my-heatmap.svg
```

### Available Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--url` | Gittea instance URL | `--url https://git.example.com` |
| `--username` | Username | `--username myuser` |
| `--token` | Access token | `--token abc123...` |
| `--start-date` | Start date (YYYY-MM-DD) | `--start-date 2025-01-01` |
| `--end-date` | End date (YYYY-MM-DD) | `--end-date 2025-12-31` |
| `--output` | Output filename | `--output my-heatmap.svg` |

## 📊 Output Example

The generated SVG file includes:

- 📅 Week-based contribution grid
- 🎨 GitHub-style color coding (darker = more contributions)
- 📈 Statistics (total contributions, active days, max, average)
- 🏷️ Month and day labels
- 💡 Hover tooltips (showing date and contribution count)

## 🔧 Troubleshooting

### Error: Cannot connect to Gittea instance

- Check if `GITTEA_URL` is correct (including `https://` prefix)
- Verify network connection
- Confirm Gittea instance is accessible

### Error: Authentication failed

- Verify `GITTEA_TOKEN` is valid
- Check if token has necessary permissions (`read:user`, `read:repository`)
- Try regenerating the token

### Error: User not found

- Verify `GITTEA_USERNAME` spelling
- Confirm user exists in Gittea instance

### No data or very little data

- Gittea API may have limitations, the script automatically tries two methods:
  1. User activities API
  2. Repository commits statistics (fallback)
- Check if user has actual contributions in the specified date range

## 🛠️ Tech Stack

- **Node.js 18+** - Using native Fetch API
- **ES Modules** - Modern JavaScript module system
- **SVG** - Scalable Vector Graphics output

## 📝 Project Structure

```
gittea.contribution/
├── index.js                 # Main entry point
├── lib/
│   ├── gittea-client.js    # Gittea API client
│   ├── data-processor.js   # Data processing module
│   └── heatmap-generator.js # SVG heatmap generator
├── package.json            # Project configuration
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

## 🙏 Acknowledgments

- Inspired by GitHub's contribution heatmap
- Supports all self-hosted Gittea/Gitea instances

---

**Tip**: If you find this project useful, please give it a ⭐️!
