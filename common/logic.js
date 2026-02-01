/**
 * 智能分析引擎 - 动态因子驱动架构
 * 确保“因人而异”，千人千面
 */

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// --- 核心算法：生成唯一特征指纹 ---
const getFingerprint = (name, bazi) => {
	let hash = 0;
	const str = name + bazi;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash) + str.charCodeAt(i);
		hash |= 0; 
	}
	return Math.abs(hash);
};

// --- 智能深度分析函数 ---
const generateFateAnalysis = (name, zodiac, bazi, profession) => {
	const fp = getFingerprint(name, bazi);
	
	// 1. 职业称谓的人性化平滑处理
	const profTransform = {
		"无业": ["潜龙在渊的开拓者", "待时而动的思想家", "静谧修行的智者"],
		"学生": ["锐意进取的求知者", "博学笃行的后浪", "深耕未来的探索者"],
		"创业者": ["披荆斩棘的统帅", "寻找蓝海的航海家", "极具韧性的构建者"]
	};
	const humanProf = profTransform[profession] ? profTransform[profession][fp % 3] : `${profession}领域的深耕者`;

	// 2. 星座深度解构 (基于指纹动态组合)
	const zodiacTraits = {
		"核心": [`${zodiac}座的特质在您身上表现为一种隐性的${fp % 2 === 0 ? '爆发力' : '持久力'}。`, `您的${zodiac}位显示，能量场往往在${fp % 4 === 0 ? '静谧' : '交互'}中达到巅峰。`],
		"深度": ["在处理决策时，您具备一种天然的避险本能，这让您在2026年的多变环境下能保持清醒。", "您对他人的感知力极强，这种细腻的情感触觉是您建立核心竞争力的关键。"]
	};
	const zodiacText = `${zodiacTraits.核心[fp % 2]} ${zodiacTraits.深度[fp % 2]} 这种特质决定了您在未来的目标设定中，不应追求表面的速度，而应注重底层的稳固。在接下来的周期内，星盘指示您的创造力将集中爆发，建议预留出专门的复盘时间以校准方向。`;

	// 3. 八字乾坤解构 (基于五行权重模拟)
	const elements = ["木气", "火性", "土蕴", "金锋", "水韵"];
	const mainElement = elements[fp % 5];
	const baziText = `从您的八字${bazi}观察，命格中${mainElement}最为纯正，这象征着一种${fp % 2 === 0 ? '向上生长' : '向内聚能'}的力量。您的人生底色中带有“宁静致远”的韵味，这意味着在高压环境下，您比常人更容易寻找到突破口。命理预示，您在2026年适合开启具有“播种”性质的长线计划，避开短期的盲目跟风。您的气场与${["东方", "南方", "西方", "北方"][fp % 4]}契合，在此方位执行任务效率将提升。`;

	// 4. 性格优劣与定制化建议
	const advs = [
		"您的优点是具备极强的逻辑自洽能力，能将零散的信息串联成完整的行动方案。但需注意，偶尔的完美主义会消耗您过多的精力。",
		"您性格中的包容力是巨大的财富，这让您在团队或合作中无往不利。弱点在于面对冲突时容易选择退让，建议在目标执行中更加果断。",
		"锐利的直觉是您的天赋，您往往能洞察到事物表象下的真实动向。不过，请警惕这种敏感带来的情绪波动，保持心境平和是修行的核心。"
	];
	const characterText = `作为一名${humanProf}，${advs[fp % 3]} 建议您在接下来的修行中，采用“模块化推进”策略，每达成一个小目标即给予自己正向反馈。这种性格驱动的模式将确保您在长达30天的周期内不会感到职业倦怠或目标疲劳。`;

	return {
		summary: characterText,
		zodiacAnalysis: zodiacText,
		baziAnalysis: baziText,
		lucky_direction: ["东", "南", "西", "北"][fp % 4],
		lucky_color: ["玄青", "赤红", "月白", "黛蓝"][fp % 4]
	};
};

// --- 智能任务生成引擎 (根据性格指纹差异化) ---
const _getDailyActions = (goal, dayIdx, totalDays, fp) => {
	const progress = dayIdx / totalDays;
	const isActionOriented = fp % 2 === 0; // 是否为行动导向型性格

	// 根据性格指纹调整任务侧重点
	const tasks = [];
	if (isActionOriented) {
		tasks.push({ title: "高强度执行", desc: `今日进入${goal}实操阶段，建议完成 ${5 + dayIdx} 组深度练习，追求量变。` });
		tasks.push({ title: "效率监测", desc: "记录完成每项子任务的实际耗时，优化后续动作。" });
	} else {
		tasks.push({ title: "深度思考", desc: `针对${goal}的底层逻辑进行梳理，尝试用思维导图画出今日的心得。` });
		tasks.push({ title: "质感打磨", desc: "不追求速度，仅对昨日的一个核心痛点进行彻底攻克。" });
	}
	
	// 增加一条与命理挂钩的每日小贴士
	if (dayIdx % 3 === 0) {
		tasks.push({ title: "能量校准", desc: "面向您的吉位深呼吸3分钟，清理思维杂讯。" });
	}

	return tasks;
};

const generateMindMapPlan = (goal, durationType, userInfo) => {
	const fp = getFingerprint(userInfo.name, userInfo.bazi || '');
	const daysCount = durationType === 'week' ? 7 : 30;
	let taskList = [];
	let startDate = new Date();

	for (let i = 0; i < daysCount; i++) {
		let currDate = new Date(startDate);
		currDate.setDate(startDate.getDate() + i);
		taskList.push({
			date: currDate.toISOString().split('T')[0],
			dayLabel: `第${i + 1}天`,
			actions: _getDailyActions(goal, i, daysCount, fp),
			result: null,
			isReported: false
		});
	}
	return taskList;
};

export default { getZodiac, getBaZi, generateFateAnalysis, generateMindMapPlan };
