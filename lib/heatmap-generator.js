/**
 * SVG 热力图生成模块
 * 生成类似 GitHub 的贡献热力图
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
const MONTH_LABEL_HEIGHT = 20;
const DAY_LABEL_WIDTH = 30;

/**
 * 生成 SVG 热力图
 * @param {Array} weeks - 周数据数组
 * @param {Array} monthLabels - 月份标签数组
 * @param {Object} stats - 统计信息
 * @param {string} username - 用户名
 * @returns {string} SVG 字符串
 */
export function generateHeatmap(weeks, monthLabels, stats, username) {
    const width = weeks.length * (CELL_SIZE + CELL_SPACING) + DAY_LABEL_WIDTH + 20;
    const height = 7 * (CELL_SIZE + CELL_SPACING) + MONTH_LABEL_HEIGHT + 40;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .month-label { font: 10px sans-serif; fill: #767676; }
    .day-label { font: 9px sans-serif; fill: #767676; }
    .contrib-cell { shape-rendering: geometricPrecision; }
    .contrib-cell:hover { stroke: #000; stroke-width: 1px; }
    .title { font: 14px sans-serif; fill: #24292e; font-weight: bold; }
    .stats { font: 11px sans-serif; fill: #586069; }
    .legend-text { font: 10px sans-serif; fill: #767676; }
  </style>
  
  <!-- 标题 -->
  <text x="10" y="15" class="title">${username} 的贡献热力图</text>
  
  <!-- 统计信息 -->
  <text x="10" y="32" class="stats">总贡献: ${stats.total} | 活跃天数: ${stats.daysWithContributions}/${stats.totalDays} | 最高: ${stats.maxCount}/天 | 平均: ${stats.avgCount}/天</text>
  
  <!-- 月份标签 -->
  <g transform="translate(${DAY_LABEL_WIDTH}, ${MONTH_LABEL_HEIGHT + 20})">
`;

    // 添加月份标签
    monthLabels.forEach(label => {
        const x = label.weekIndex * (CELL_SIZE + CELL_SPACING);
        svg += `    <text x="${x}" y="-5" class="month-label">${label.month}</text>\n`;
    });

    svg += `  </g>\n\n`;

    // 星期标签
    const dayLabels = ['周一', '周三', '周五'];
    const dayIndices = [1, 3, 5];

    svg += `  <!-- 星期标签 -->\n`;
    svg += `  <g transform="translate(0, ${MONTH_LABEL_HEIGHT + 20})">\n`;

    dayIndices.forEach((dayIndex, i) => {
        const y = dayIndex * (CELL_SIZE + CELL_SPACING) + CELL_SIZE / 2;
        svg += `    <text x="5" y="${y + 3}" class="day-label" text-anchor="start">${dayLabels[i]}</text>\n`;
    });

    svg += `  </g>\n\n`;

    // 贡献网格
    svg += `  <!-- 贡献网格 -->\n`;
    svg += `  <g transform="translate(${DAY_LABEL_WIDTH}, ${MONTH_LABEL_HEIGHT + 20})">\n`;

    weeks.forEach((week, weekIndex) => {
        week.forEach(day => {
            const x = weekIndex * (CELL_SIZE + CELL_SPACING);
            const y = day.dayOfWeek * (CELL_SIZE + CELL_SPACING);
            const color = COLORS[day.level];

            svg += `    <rect class="contrib-cell" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="${color}" data-date="${day.date}" data-count="${day.count}">\n`;
            svg += `      <title>${day.date}: ${day.count} 次贡献</title>\n`;
            svg += `    </rect>\n`;
        });
    });

    svg += `  </g>\n\n`;

    // 图例
    svg += `  <!-- 图例 -->\n`;
    const legendY = height - 20;
    const legendX = width - 200;

    svg += `  <g transform="translate(${legendX}, ${legendY})">\n`;
    svg += `    <text x="0" y="0" class="legend-text">少</text>\n`;

    [0, 1, 2, 3, 4].forEach((level, index) => {
        const x = 25 + index * (CELL_SIZE + CELL_SPACING);
        svg += `    <rect x="${x}" y="-8" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="${COLORS[level]}" />\n`;
    });

    svg += `    <text x="${25 + 5 * (CELL_SIZE + CELL_SPACING) + 5}" y="0" class="legend-text">多</text>\n`;
    svg += `  </g>\n`;

    svg += `</svg>`;

    return svg;
}
