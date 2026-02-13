/**
 * Gittea API 客户端模块
 * 用于与 Gittea 实例进行 API 交互
 */

/**
 * 通过用户名获取用户 ID
 * @param {string} baseUrl - Gittea 实例的基础 URL
 * @param {string} username - 用户名
 * @param {string} token - 个人访问令牌
 * @returns {Promise<number>} 用户 ID
 */
export async function getUserId(baseUrl, username, token) {
    const url = `${baseUrl}/api/v1/users/${username}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`用户 "${username}" 不存在`);
            }
            if (response.status === 401) {
                throw new Error('认证失败，请检查您的 Token 是否正确');
            }
            throw new Error(`获取用户信息失败: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        return userData.id;
    } catch (error) {
        if (error.message.includes('fetch')) {
            throw new Error(`无法连接到 Gittea 实例: ${baseUrl}`);
        }
        throw error;
    }
}

/**
 * 获取用户热力图数据（Gittea 专用 API - 最快最准确）
 * @param {string} baseUrl - Gittea 实例的基础 URL
 * @param {string} username - 用户名
 * @param {string} token - 个人访问令牌
 * @param {string} startDate - 起始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 按日期聚合的贡献数据
 */
export async function getUserHeatmap(baseUrl, username, token, startDate, endDate) {
    const url = `${baseUrl}/api/v1/users/${username}/heatmap`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Heatmap API 不可用');
            }
            throw new Error(`获取热力图数据失败: ${response.status} ${response.statusText}`);
        }

        const heatmapData = await response.json();

        // 转换为我们需要的格式
        const contributionsByDate = {};
        const start = new Date(startDate);
        const end = new Date(endDate);

        heatmapData.forEach(item => {
            // Gittea heatmap API 返回的是时间戳（秒）和贡献数
            const timestamp = item.timestamp * 1000; // 转换为毫秒
            const date = new Date(timestamp);

            // 只统计在日期范围内的数据
            if (date >= start && date <= end) {
                const dateKey = date.toISOString().split('T')[0];
                contributionsByDate[dateKey] = item.contributions || 0;
            }
        });

        return contributionsByDate;
    } catch (error) {
        throw error;
    }
}

/**
 * 获取用户的活动/贡献数据
 * @param {string} baseUrl - Gittea 实例的基础 URL
 * @param {number} userId - 用户 ID
 * @param {string} token - 个人访问令牌
 * @param {string} startDate - 起始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 按日期聚合的贡献数据
 */
export async function getUserActivities(baseUrl, userId, token, startDate, endDate) {
    // Gittea/Gitea 的活动 API 端点
    const url = `${baseUrl}/api/v1/users/${userId}/activities/feeds`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`获取用户活动失败: ${response.status} ${response.statusText}`);
        }

        const activities = await response.json();

        // 按日期聚合贡献
        const contributionsByDate = {};
        const start = new Date(startDate);
        const end = new Date(endDate);

        activities.forEach(activity => {
            const activityDate = new Date(activity.created);

            // 只统计在日期范围内的活动
            if (activityDate >= start && activityDate <= end) {
                const dateKey = activityDate.toISOString().split('T')[0];
                contributionsByDate[dateKey] = (contributionsByDate[dateKey] || 0) + 1;
            }
        });

        return contributionsByDate;
    } catch (error) {
        throw error;
    }
}

/**
 * 获取用户的仓库列表并统计提交
 * 备用方案：如果活动 API 不可用，可以通过仓库提交来统计
 * @param {string} baseUrl - Gittea 实例的基础 URL
 * @param {string} username - 用户名
 * @param {string} token - 个人访问令牌
 * @param {string} startDate - 起始日期
 * @param {string} endDate - 结束日期
 * @returns {Promise<Object>} 按日期聚合的贡献数据
 */
export async function getUserContributionsFromRepos(baseUrl, username, token, startDate, endDate) {
    const reposUrl = `${baseUrl}/api/v1/users/${username}/repos?limit=100`;

    try {
        const response = await fetch(reposUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`获取仓库列表失败: ${response.status}`);
        }

        const repos = await response.json();
        const contributionsByDate = {};
        const start = new Date(startDate);
        const end = new Date(endDate);

        console.log(`   找到 ${repos.length} 个仓库，开始统计提交...`);

        // 遍历每个仓库获取提交
        for (let i = 0; i < repos.length; i++) {
            const repo = repos[i];
            console.log(`   [${i + 1}/${repos.length}] 正在处理: ${repo.full_name}`);

            // 添加日期范围参数以减少数据量
            const commitsUrl = `${baseUrl}/api/v1/repos/${repo.full_name}/commits?limit=100`;

            try {
                // 添加超时控制
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

                const commitsResponse = await fetch(commitsUrl, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (commitsResponse.ok) {
                    const commits = await commitsResponse.json();

                    let commitCount = 0;
                    commits.forEach(commit => {
                        if (commit.commit && commit.commit.author) {
                            const commitDate = new Date(commit.commit.author.date);

                            if (commitDate >= start && commitDate <= end) {
                                const dateKey = commitDate.toISOString().split('T')[0];
                                contributionsByDate[dateKey] = (contributionsByDate[dateKey] || 0) + 1;
                                commitCount++;
                            }
                        }
                    });

                    if (commitCount > 0) {
                        console.log(`      ✓ 找到 ${commitCount} 次提交`);
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn(`      ⚠ 超时，跳过仓库 ${repo.full_name}`);
                } else {
                    console.warn(`      ⚠ 跳过仓库 ${repo.full_name}: ${error.message}`);
                }
            }
        }

        return contributionsByDate;
    } catch (error) {
        throw error;
    }
}
