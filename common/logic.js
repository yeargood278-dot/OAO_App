/**
 * /common/logic.js 
 * 修正版：消除了重复定义错误，统一了导出格式
 */

// --- 基础数据 ---
const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ZODIACS = ["摩羯座", "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座"];
const ZODIAC_DAYS = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];

// 1. 命理计算函数
const getZodiac = (month, day) => {
	return day < ZODIAC_DAYS[month - 1] ? ZODIACS[month - 1] : ZODIACS[month % 12];
};

const getBaZi = (year, month, day, hour) => {
	const yGan = GAN[(year - 4) % 10];
	const yZhi = ZHI[(year - 4) % 12];
	const hZhi = ZHI[Math.floor(((hour + 1) % 24) / 2)];
	return `${yGan}${yZhi}年 ${month}月${day}日 ${hZhi}时`;
};

const generateFateAnalysis = (name, zodiac, bazi, profession) => {
	const traits = ["思维缜密", "执行力强", "富有灵感", "沉稳持重"];
	let seed = 0;
	const str = name + zodiac + profession;
	for (let i = 0; i < str.length; i++) seed += str.charCodeAt(i);
	
	return {
		summary: `作为${profession}，你具备${traits[seed % traits.length]}的特质。`,
		yijing: "天行健，君子以自强不息。适合开启长线计划。",
		lucky_direction: ["东", "南", "西", "北"][seed % 4],
		lucky_color: ["玄青", "赤红", "月白", "黛蓝"][seed % 4]
	};
};

/**
 * /common/logic.js 强化版
 * 引入动态步长算法，确保每一天任务的唯一性和递进性
 */

// 核心建议矩阵
const BEHAVIOR_MATRIX = {
    "学习/背诵": {
        base: ["记忆", "听读", "默写", "应用"],
        verb: "攻克"
    },
    "运动/健身": {
        base: ["热身", "核心", "拉伸", "呼吸"],
        verb: "挑战"
    },
    "通用/工作": {
        base: ["调研", "执行", "复盘", "优化"],
        verb: "推进"
    }
};

const _getDailyActions = (goal, dayIndex, totalDays) => {
    // 1. 确定目标领域
    let category = "通用/工作";
    if (goal.includes("语") || goal.includes("音") || goal.includes("背")) category = "学习/背诵";
    if (goal.includes("减") || goal.includes("练") || goal.includes("跑")) category = "运动/健身";

    const matrix = BEHAVIOR_MATRIX[category];
    const progress = dayIndex / totalDays;
    
    // 2. 动态生成具体数值 (让用户感到精准)
    // 比如：第1天记5个，第5天记15个；或者第1天跑2km，第10天跑5km
    const intensity = Math.floor(5 + (dayIndex * 1.5)); 
    const depth = Math.floor(progress * 100);

    // 3. 构建递进式行动建议
    let actions = [];
    
    if (category === "学习/背诵") {
        actions = [
            { 
                title: `${matrix.verb}新知`, 
                desc: `今日目标：精准记忆第 ${Math.floor(dayIndex * 3 + 1)} - ${Math.floor(dayIndex * 3 + 3)} 个${goal.slice(-2)}，确保发音标准。`, 
                done: false 
            },
            { 
                title: "结构化复习", 
                desc: `针对前 ${dayIndex > 0 ? dayIndex : 1} 天遗忘曲线，快速回顾 ${Math.floor(intensity/2)} 个旧点。`, 
                done: false 
            },
            { 
                title: "实战模拟", 
                desc: `完成 ${Math.floor(intensity/3 + 1)} 组闭环练习，今日修行深度已达 ${depth}%。`, 
                done: false 
            }
        ];
    } else if (category === "运动/健身") {
        actions = [
            { 
                title: "动态启动", 
                desc: `进行 ${intensity} 分钟专项激活，提升${goal.slice(0,2)}效率。`, 
                done: false 
            },
            { 
                title: "高阶执行", 
                desc: `执行${goal}核心动作，完成 ${3 + Math.floor(dayIndex/2)} 组，每组坚持 ${10+dayIndex} 秒。`, 
                done: false 
            }
        ];
    } else {
        // 通用型目标
        actions = [
            { 
                title: "阶段性推进", 
                desc: `当前进度：${depth}%。今日重点：处理${goal}中的第 ${dayIndex + 1} 个关键环节。`, 
                done: false 
            },
            { 
                title: "逻辑重构", 
                desc: "对照初衷，优化执行路径，记录 1 条新的心得。", 
                done: false 
            }
        ];
    }

    // 4. 插入命理建议 (人命各异)
    if (dayIndex % 3 === 0) {
        actions.push({
            title: "天机提示",
            desc: `今日能量处于上升期，建议在${new Date().getHours() < 12 ? '上午' : '傍晚'}集中处理难点。`,
            done: false
        });
    }

    return actions;
};

const generateMindMapPlan = (goal, durationType, isWeekendRest) => {
    const dayConfig = { 'week': 7, 'month': 30, 'halfYear': 180, 'year': 365 };
    const daysCount = dayConfig[durationType] || 7;
    let taskList = [];
    let startDate = new Date();

    for (let i = 0; i < daysCount; i++) {
        let currDate = new Date(startDate);
        currDate.setDate(startDate.getDate() + i);
        const dateStr = currDate.toISOString().split('T')[0];
        const isRestDay = (currDate.getDay() === 0 || currDate.getDay() === 6) && isWeekendRest;

        taskList.push({
            date: dateStr,
            dayLabel: `第${i + 1}天`,
            isRest: isRestDay,
            actions: isRestDay ? [] : _getDailyActions(goal, i, daysCount),
            feedback: "",
            status: 'pending'
        });
    }
    return taskList;
};

// --- 统一导出 ---
export default {
	getZodiac,
	getBaZi,
	generateFateAnalysis,
	generateMindMapPlan
};