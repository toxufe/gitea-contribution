/**
 * 数据处理模块
 * 用于处理和转换贡献数据
 */

/**
 * 填充日期范围内的所有日期（包括没有贡献的日期）
 * @param {Object} contributionsByDate - 按日期的贡献数据
 * @param {string} startDate - 起始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Object} 填充后的贡献数据
 */
export function fillMissingDates(contributionsByDate, startDate, endDate) {
    const filled = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateKey = date.toISOString().split('T')[0];
        filled[dateKey] = contributionsByDate[dateKey] || 0;
    }

    return filled;
}

/**
 * 计算贡献等级（0-4，类似 GitHub）
 * @param {number} count - 贡献数
 * @param {number} maxCount - 最大贡献数
 * @returns {number} 等级 (0-4)
 */
export function getContributionLevel(count, maxCount) {
    if (count === 0) return 0;
    if (maxCount === 0) return 0;

    const percentage = count / maxCount;

    if (percentage >= 0.75) return 4;
    if (percentage >= 0.50) return 3;
    if (percentage >= 0.25) return 2;
    return 1;
}

/**
 * 生成基于周的网格数据结构
 * @param {Object} contributionsByDate - 填充后的贡献数据
 * @param {string} startDate - 起始日期
 * @returns {Array} 周数据数组
 */
export function generateWeekGrid(contributionsByDate, startDate) {
    const start = new Date(startDate);
    const dates = Object.keys(contributionsByDate).sort();

    // 找到最大贡献数用于计算等级
    const maxCount = Math.max(...Object.values(contributionsByDate));

    // 调整起始日期到周日（GitHub 风格）
    const firstDay = new Date(start);
    const dayOfWeek = firstDay.getDay();
    firstDay.setDate(firstDay.getDate() - dayOfWeek);

    const weeks = [];
    let currentWeek = [];

    dates.forEach((dateKey, index) => {
        const date = new Date(dateKey);
        const count = contributionsByDate[dateKey];
        const level = getContributionLevel(count, maxCount);

        currentWeek.push({
            date: dateKey,
            count: count,
            level: level,
            dayOfWeek: date.getDay()
        });

        // 每7天或最后一个日期时，完成一周
        if (currentWeek.length === 7 || index === dates.length - 1) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    return weeks;
}

/**
 * 获取月份标签位置
 * @param {Array} weeks - 周数据数组
 * @returns {Array} 月份标签数组
 */
export function getMonthLabels(weeks) {
    const monthLabels = [];
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'];

    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
        if (week.length > 0) {
            const firstDate = new Date(week[0].date);
            const month = firstDate.getMonth();

            if (month !== lastMonth) {
                monthLabels.push({
                    month: monthNames[month],
                    weekIndex: weekIndex
                });
                lastMonth = month;
            }
        }
    });

    return monthLabels;
}

/**
 * 获取统计摘要
 * @param {Object} contributionsByDate - 贡献数据
 * @returns {Object} 统计信息
 */
export function getStatistics(contributionsByDate) {
    const counts = Object.values(contributionsByDate);
    const total = counts.reduce((sum, count) => sum + count, 0);
    const daysWithContributions = counts.filter(count => count > 0).length;
    const maxCount = Math.max(...counts, 0);
    const avgCount = total / counts.length;

    return {
        total,
        daysWithContributions,
        totalDays: counts.length,
        maxCount,
        avgCount: avgCount.toFixed(2)
    };
}
