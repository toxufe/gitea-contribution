/**
 * HTML 热力图生成模块
 * 生成可交互的 HTML 格式贡献热力图
 */

// GitHub 风格的配色方案
const COLORS = {
    0: '#ebedf0',  // 无贡献
    1: '#9be9a8',  // 低
    2: '#40c463',  // 中
    3: '#30a14e',  // 高
    4: '#216e39'   // 很高
};

const CELL_SIZE = 10;
const CELL_SPACING = 2;

/**
 * 生成 HTML 热力图
 * @param {Array} weeks - 周数据数组
 * @param {Array} monthLabels - 月份标签数组
 * @param {Object} stats - 统计信息
 * @param {string} username - 用户名
 * @returns {string} HTML 字符串
 */
export function generateHTMLHeatmap(weeks, monthLabels, stats, username) {
    const totalWeeks = weeks.length;
    const containerWidth = totalWeeks * (CELL_SIZE + CELL_SPACING) + 60;

    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${username} 的贡献热力图</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: ${containerWidth + 100}px;
            animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        h1 {
            color: #24292e;
            font-size: 24px;
            margin-bottom: 8px;
        }

        .stats {
            color: #586069;
            font-size: 13px;
            margin-bottom: 30px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .stat-value {
            font-weight: 600;
            color: #24292e;
        }

        .heatmap-wrapper {
            background: #f6f8fa;
            border-radius: 8px;
            padding: 20px;
            overflow-x: auto;
        }

        .heatmap {
            position: relative;
            display: inline-block;
        }

        .months {
            display: flex;
            margin-bottom: 8px;
            padding-left: 30px;
        }

        .month {
            font-size: 10px;
            color: #767676;
            position: absolute;
        }

        .days-and-grid {
            display: flex;
        }

        .days {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            margin-right: 8px;
            padding-top: 0;
        }

        .day-label {
            font-size: 9px;
            color: #767676;
            height: ${CELL_SIZE}px;
            line-height: ${CELL_SIZE}px;
        }

        .grid {
            display: flex;
            gap: ${CELL_SPACING}px;
        }

        .week {
            display: flex;
            flex-direction: column;
            gap: ${CELL_SPACING}px;
        }

        .cell {
            width: ${CELL_SIZE}px;
            height: ${CELL_SIZE}px;
            border-radius: 2px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .cell:hover {
            outline: 2px solid rgba(0, 0, 0, 0.3);
            outline-offset: 1px;
            transform: scale(1.2);
            z-index: 10;
        }

        .tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            pointer-events: none;
            white-space: nowrap;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .tooltip.show {
            display: block;
        }

        .legend {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 20px;
            font-size: 11px;
            color: #767676;
        }

        .legend-cells {
            display: flex;
            gap: ${CELL_SPACING}px;
        }

        .legend-cell {
            width: ${CELL_SIZE}px;
            height: ${CELL_SIZE}px;
            border-radius: 2px;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            color: #586069;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${username} 的贡献热力图</h1>
        <div class="stats">
            <div class="stat-item">
                <span>📊</span>
                <span>总贡献: <span class="stat-value">${stats.total}</span></span>
            </div>
            <div class="stat-item">
                <span>📅</span>
                <span>活跃天数: <span class="stat-value">${stats.daysWithContributions}/${stats.totalDays}</span></span>
            </div>
            <div class="stat-item">
                <span>🔥</span>
                <span>最高: <span class="stat-value">${stats.maxCount}</span> 次/天</span>
            </div>
            <div class="stat-item">
                <span>📈</span>
                <span>平均: <span class="stat-value">${stats.avgCount}</span> 次/天</span>
            </div>
        </div>

        <div class="heatmap-wrapper">
            <div class="heatmap">
                <div class="months">`;

    // 添加月份标签
    monthLabels.forEach(label => {
        const x = label.weekIndex * (CELL_SIZE + CELL_SPACING);
        html += `                    <div class="month" style="left: ${x}px;">${label.month}</div>\n`;
    });

    html += `                </div>

                <div class="days-and-grid">
                    <div class="days">
                        <div class="day-label">周一</div>
                        <div class="day-label"></div>
                        <div class="day-label">周三</div>
                        <div class="day-label"></div>
                        <div class="day-label">周五</div>
                        <div class="day-label"></div>
                        <div class="day-label"></div>
                    </div>

                    <div class="grid">`;

    // 添加贡献网格
    weeks.forEach(week => {
        html += `                        <div class="week">\n`;

        // 填充空白天（如果第一周不是从周日开始）
        if (week.length > 0) {
            const firstDayOfWeek = week[0].dayOfWeek;
            for (let i = 0; i < firstDayOfWeek; i++) {
                html += `                            <div class="cell" style="background: transparent;"></div>\n`;
            }
        }

        week.forEach(day => {
            const color = COLORS[day.level];
            html += `                            <div class="cell" style="background: ${color};" data-date="${day.date}" data-count="${day.count}"></div>\n`;
        });

        html += `                        </div>\n`;
    });

    html += `                    </div>
                </div>

                <div class="legend">
                    <span>少</span>
                    <div class="legend-cells">`;

    [0, 1, 2, 3, 4].forEach(level => {
        html += `                        <div class="legend-cell" style="background: ${COLORS[level]};"></div>\n`;
    });

    html += `                    </div>
                    <span>多</span>
                </div>
            </div>
        </div>

        <div class="footer">
            🚀 Generated by Gittea Contribution Heatmap Generator
        </div>
    </div>

    <div class="tooltip" id="tooltip"></div>

    <script>
        const cells = document.querySelectorAll('.cell[data-date]');
        const tooltip = document.getElementById('tooltip');

        cells.forEach(cell => {
            cell.addEventListener('mouseenter', function(e) {
                const date = this.dataset.date;
                const count = this.dataset.count;
                tooltip.textContent = \`\${date}: \${count} 次贡献\`;
                tooltip.classList.add('show');
                updateTooltipPosition(e);
            });

            cell.addEventListener('mousemove', updateTooltipPosition);

            cell.addEventListener('mouseleave', function() {
                tooltip.classList.remove('show');
            });
        });

        function updateTooltipPosition(e) {
            const x = e.pageX + 10;
            const y = e.pageY - 30;
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        }
    </script>
</body>
</html>`;

    return html;
}
