#!/usr/bin/env node

/**
 * Gittea 贡献热力图生成器
 * 主入口文件
 */

import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getUserId, getUserHeatmap, getUserActivities, getUserContributionsFromRepos } from './lib/gittea-client.js';
import { fillMissingDates, generateWeekGrid, getMonthLabels, getStatistics } from './lib/data-processor.js';
import { generateHeatmap } from './lib/heatmap-generator.js';
import { generateHTMLHeatmap } from './lib/html-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 加载 .env 文件
 */
async function loadEnv() {
    try {
        const envPath = join(__dirname, '.env');
        const envContent = await readFile(envPath, 'utf-8');
        const env = {};

        envContent.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    env[key.trim()] = valueParts.join('=').trim();
                }
            }
        });

        return env;
    } catch (error) {
        return {};
    }
}

/**
 * 解析命令行参数
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const value = args[i + 1];

            if (value && !value.startsWith('--')) {
                options[key] = value;
                i++;
            }
        }
    }

    return options;
}

/**
 * 获取日期范围
 */
function getDateRange(startDate, endDate) {
    const now = new Date();
    const currentYear = now.getFullYear();

    const start = startDate || `${currentYear}-01-01`;
    const end = endDate || `${currentYear}-12-31`;

    return { start, end };
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 Gittea 贡献热力图生成器\n');

    try {
        // 加载配置
        const env = await loadEnv();
        const args = parseArgs();

        // 获取配置参数
        const gitteaUrl = args['url'] || env.GITTEA_URL;
        const gitteaToken = args['token'] || env.GITTEA_TOKEN;
        const username = args['username'] || env.GITTEA_USERNAME;
        const outputFile = args['output'] || env.OUTPUT_FILE || 'contribution-heatmap.svg';

        // 验证必需参数
        if (!gitteaUrl) {
            throw new Error('缺少 Gittea URL。请在 .env 文件中设置 GITTEA_URL 或使用 --url 参数');
        }

        if (!gitteaToken) {
            throw new Error('缺少访问令牌。请在 .env 文件中设置 GITTEA_TOKEN 或使用 --token 参数');
        }

        if (!username) {
            throw new Error('缺少用户名。请在 .env 文件中设置 GITTEA_USERNAME 或使用 --username 参数');
        }

        // 获取日期范围
        const { start, end } = getDateRange(
            args['start-date'] || env.START_DATE,
            args['end-date'] || env.END_DATE
        );

        console.log(`📋 配置信息:`);
        console.log(`   Gittea URL: ${gitteaUrl}`);
        console.log(`   用户名: ${username}`);
        console.log(`   日期范围: ${start} 至 ${end}`);
        console.log(`   输出文件: ${outputFile}\n`);

        // 步骤 1: 获取用户 ID
        console.log('🔍 正在查找用户 ID...');
        const userId = await getUserId(gitteaUrl, username, gitteaToken);
        console.log(`✅ 找到用户 ID: ${userId}\n`);

        // 步骤 2: 获取贡献数据
        console.log('📊 正在获取贡献数据...');
        let contributionsByDate;

        try {
            // 首先尝试使用 Heatmap API（最快最准确）
            contributionsByDate = await getUserHeatmap(gitteaUrl, username, gitteaToken, start, end);
            console.log(`✅ 通过 Heatmap API 获取到 ${Object.keys(contributionsByDate).length} 天的数据\n`);
        } catch (error) {
            try {
                // 备用方案1：使用活动 API
                console.log('⚠️  Heatmap API 不可用，尝试使用活动 API...');
                contributionsByDate = await getUserActivities(gitteaUrl, userId, gitteaToken, start, end);
                console.log(`✅ 通过活动 API 获取到 ${Object.keys(contributionsByDate).length} 天的数据\n`);
            } catch (error2) {
                // 备用方案2：使用仓库提交统计（最慢但最兼容）
                console.log('⚠️  活动 API 不可用，尝试使用仓库提交统计...');
                contributionsByDate = await getUserContributionsFromRepos(gitteaUrl, username, gitteaToken, start, end);
                console.log(`✅ 通过仓库提交获取到 ${Object.keys(contributionsByDate).length} 天的数据\n`);
            }
        }

        // 步骤 3: 处理数据
        console.log('⚙️  正在处理数据...');
        const filledData = fillMissingDates(contributionsByDate, start, end);
        const weeks = generateWeekGrid(filledData, start);
        const monthLabels = getMonthLabels(weeks);
        const stats = getStatistics(filledData);

        console.log(`✅ 数据处理完成`);
        console.log(`   总贡献: ${stats.total}`);
        console.log(`   活跃天数: ${stats.daysWithContributions}/${stats.totalDays}`);
        console.log(`   最高贡献: ${stats.maxCount} 次/天`);
        console.log(`   平均贡献: ${stats.avgCount} 次/天\n`);

        // 步骤 4: 生成热力图
        console.log('🎨 正在生成热力图...');
        const svg = generateHeatmap(weeks, monthLabels, stats, username);
        const html = generateHTMLHeatmap(weeks, monthLabels, stats, username);

        // 步骤 5: 保存文件
        const outputPath = join(__dirname, outputFile);
        await writeFile(outputPath, svg, 'utf-8');

        const htmlOutputFile = outputFile.replace('.svg', '.html');
        const htmlOutputPath = join(__dirname, htmlOutputFile);
        await writeFile(htmlOutputPath, html, 'utf-8');

        console.log(`✅ SVG 热力图已生成: ${outputPath}`);
        console.log(`✅ HTML 热力图已生成: ${htmlOutputPath}\n`);
        console.log('🎉 完成！您可以在浏览器中打开 HTML 或 SVG 文件查看热力图。');

    } catch (error) {
        console.error(`\n❌ 错误: ${error.message}`);
        console.error('\n💡 提示:');
        console.error('   1. 确保已创建 .env 文件并配置了正确的参数');
        console.error('   2. 检查 Gittea URL 是否正确（例如: https://git.example.com）');
        console.error('   3. 确认访问令牌有效且具有读取权限');
        console.error('   4. 验证用户名是否存在\n');
        process.exit(1);
    }
}

// 运行主函数
main();
