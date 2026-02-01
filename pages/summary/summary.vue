<template>
	<view class="container">
		<view class="report-card">
			<view class="header">
				<text class="title">阶段结业报告</text>
				<text class="date">{{currentDate}}</text>
			</view>
			
			<view class="user-info">
				<text class="name">{{userInfo.nickname}}</text>
				<text class="fate-info">{{userInfo.zodiac}} | {{userInfo.bazi.split(' ')[0]}}生人</text>
			</view>

			<view class="score-circle">
				<text class="score-num">{{stats.completionRate}}%</text>
				<text class="score-label">目标达成率</text>
			</view>

			<view class="stats-grid">
				<view class="stat-item">
					<text class="val">{{stats.totalDays}}</text>
					<text class="key">计划天数</text>
				</view>
				<view class="stat-item">
					<text class="val">{{stats.completedDays}}</text>
					<text class="key">坚持打卡</text>
				</view>
				<view class="stat-item">
					<text class="val">{{stats.restDays}}</text>
					<text class="key">休整天数</text>
				</view>
			</view>

			<view class="divider"></view>

			<view class="summary-text">
				<text class="label">命理复盘：</text>
				<text class="content">{{fateComment}}</text>
			</view>
			
			<view class="goal-target">
				<text>专注目标：{{currentGoal.title}}</text>
			</view>
		</view>

		<view class="action-bar">
			<button class="btn-home" @click="goHome">返回首页</button>
			<button class="btn-download" @click="generateAndSaveImage">下载结业符(保存图片)</button>
		</view>

		<canvas canvas-id="shareCanvas" class="canvas-hide" :style="{width: canvasWidth + 'px', height: canvasHeight + 'px'}"></canvas>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {},
				currentGoal: {},
				tasks: [],
				stats: {
					totalDays: 0,
					completedDays: 0,
					restDays: 0,
					completionRate: 0
				},
				currentDate: '',
				fateComment: '',
				// Canvas配置
				canvasWidth: 375,
				canvasHeight: 600,
				pixelRatio: 1
			}
		},
		onLoad() {
			this.loadData();
			
			// 获取屏幕信息以适配Canvas
			const sys = uni.getSystemInfoSync();
			this.canvasWidth = sys.windowWidth;
			this.pixelRatio = sys.pixelRatio;
			this.canvasHeight = sys.windowHeight * 0.8; // 画布高度
			
			const now = new Date();
			this.currentDate = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`;
		},
		methods: {
			loadData() {
				this.userInfo = uni.getStorageSync('userInfo') || { nickname: '用户', zodiac: '', bazi: '' };
				this.currentGoal = uni.getStorageSync('currentGoal') || { title: '未命名目标' };
				this.tasks = uni.getStorageSync('currentTasks') || [];

				// 1. 统计数据
				const total = this.tasks.length;
				const completed = this.tasks.filter(t => t.status === 'completed').length;
				const rest = this.tasks.filter(t => t.isRest).length;
				// 分母减去休息日，或者休息日算作达标，这里逻辑设为：(完成数 / (总天数 - 休息日)) * 100
				// 如果全是休息日或刚开始，做防抖处理
				let validDays = total - rest;
				let rate = 0;
				if(validDays > 0) {
					rate = Math.round((completed / validDays) * 100);
				} else if (total > 0 && rest === total) {
					rate = 100; // 全是休息日算完美
				}

				this.stats = {
					totalDays: total,
					completedDays: completed,
					restDays: rest,
					completionRate: rate
				};

				// 2. 生成命理评语
				this.generateFateComment(rate);
			},

			generateFateComment(rate) {
				const zodiac = this.userInfo.zodiac;
				let comment = "";
				
				if (rate >= 90) {
					comment = `乾卦之象，天行健，君子以自强不息。${zodiac}的你展现了惊人的毅力，此刻气运正盛，宜乘胜追击，谋划更大的宏图。`;
				} else if (rate >= 60) {
					comment = `中正平和。你的执行力如同${zodiac}的稳健特质。虽然偶有波折，但总体顺应天时。易经云：君子终日乾乾，夕惕若厉，无咎。`;
				} else {
					comment = `潜龙勿用。这段时间你似乎受到了外界干扰，未能完全发挥${zodiac}的潜能。建议调整风水方位，修整身心后再出发。`;
				}
				this.fateComment = comment;
			},

			goHome() {
				uni.navigateBack();
			},

			// 核心功能：使用 Canvas 绘制图片并保存
			generateAndSaveImage() {
				uni.showLoading({ title: '正在绘制结业符...' });
				
				const ctx = uni.createCanvasContext('shareCanvas', this);
				const w = this.canvasWidth;
				const h = this.canvasHeight;
				
				// 1. 绘制背景 (米黄色宣纸感)
				ctx.setFillStyle('#fdfbf0');
				ctx.fillRect(0, 0, w, h);
				
				// 2. 绘制边框
				ctx.setStrokeStyle('#d4af37'); // 金色
				ctx.setLineWidth(4);
				ctx.strokeRect(15, 15, w - 30, h - 30);
				
				// 3. 绘制标题
				ctx.setFillStyle('#333');
				ctx.setFontSize(22);
				ctx.setTextAlign('center');
				ctx.fillText('目标结业·AI追梦报告', w / 2, 60);
				
				// 4. 绘制用户信息
				ctx.setFontSize(16);
				ctx.setFillStyle('#666');
				ctx.fillText(`${this.userInfo.nickname} | ${this.userInfo.zodiac}`, w / 2, 90);
				
				// 5. 绘制大大的分数
				ctx.setFontSize(60);
				ctx.setFillStyle('#6b52ae'); // 紫色
				ctx.fillText(`${this.stats.completionRate}%`, w / 2, 180);
				
				ctx.setFontSize(14);
				ctx.setFillStyle('#999');
				ctx.fillText('目标达成率', w / 2, 210);
				
				// 6. 绘制分割线
				ctx.moveTo(40, 240);
				ctx.lineTo(w - 40, 240);
				ctx.setStrokeStyle('#ddd');
				ctx.setLineWidth(1);
				ctx.stroke();
				
				// 7. 绘制多行评语 (简易换行处理)
				ctx.setFontSize(14);
				ctx.setFillStyle('#333');
				ctx.setTextAlign('left');
				let text = this.fateComment;
				let chr = text.split("");
				let temp = "";
				let row = [];
				
				for (let a = 0; a < chr.length; a++) {
					if (ctx.measureText(temp).width < w - 80) {
						temp += chr[a];
					} else {
						a--; 
						row.push(temp);
						temp = "";
					}
				}
				row.push(temp); 
				
				// 逐行绘制
				for (let b = 0; b < row.length; b++) {
					ctx.fillText(row[b], 40, 280 + (b + 1) * 24);
				}
				
				// 8. 底部目标
				const endY = 280 + (row.length * 24) + 40;
				ctx.setFillStyle('#6b52ae');
				ctx.setFontSize(16);
				ctx.setTextAlign('center');
				ctx.fillText(`目标：${this.currentGoal.title}`, w/2, endY);
				
				// 9. 底部水印
				ctx.setFillStyle('#ccc');
				ctx.setFontSize(12);
				ctx.fillText(`— 梦想目标助手 · ${this.currentDate} —`, w/2, h - 30);

				ctx.draw(false, () => {
					// 绘制完成后生成图片
					setTimeout(() => {
						uni.canvasToTempFilePath({
							canvasId: 'shareCanvas',
							success: (res) => {
								this.saveImage(res.tempFilePath);
							},
							fail: (err) => {
								uni.hideLoading();
								uni.showToast({ title: '绘图失败', icon: 'none' });
								console.log(err);
							}
						}, this);
					}, 200);
				});
			},
			
			saveImage(tempFilePath) {
				uni.saveImageToPhotosAlbum({
					filePath: tempFilePath,
					success: () => {
						uni.hideLoading();
						uni.showModal({
							title: '保存成功',
							content: '结业符已保存到相册，快去分享吧！',
							showCancel: false
						});
					},
					fail: () => {
						uni.hideLoading();
						uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' });
					}
				});
			}
		}
	}
</script>

<style>
	.container { padding: 20px; background: #2c3e50; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
	
	/* 报告卡片样式 */
	.report-card { width: 100%; background: #fdfbf0; border-radius: 12px; padding: 30px 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); margin-bottom: 30px; position: relative; overflow: hidden; }
	/* 装饰用纹理 */
	.report-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(90deg, #d4af37, #fdfbf0, #d4af37); }
	
	.header { text-align: center; margin-bottom: 20px; }
	.title { font-size: 22px; font-weight: bold; color: #333; display: block; }
	.date { font-size: 12px; color: #999; margin-top: 5px; }
	
	.user-info { text-align: center; margin-bottom: 30px; }
	.name { font-size: 18px; font-weight: bold; margin-right: 10px; }
	.fate-info { font-size: 14px; color: #666; }
	
	.score-circle { text-align: center; margin: 20px 0; }
	.score-num { font-size: 64px; font-weight: bold; color: #6b52ae; display: block; line-height: 1; }
	.score-label { font-size: 14px; color: #999; }
	
	.stats-grid { display: flex; justify-content: space-around; margin: 30px 0; background: rgba(107, 82, 174, 0.05); padding: 15px; border-radius: 8px; }
	.stat-item { display: flex; flex-direction: column; align-items: center; }
	.val { font-size: 20px; font-weight: bold; color: #333; }
	.key { font-size: 12px; color: #666; margin-top: 5px; }
	
	.divider { height: 1px; background: #eee; margin: 20px 0; }
	
	.summary-text { margin-bottom: 30px; }
	.label { color: #d4af37; font-weight: bold; font-size: 16px; margin-bottom: 8px; display: block; }
	.content { font-size: 15px; color: #444; line-height: 1.6; text-align: justify; }
	
	.goal-target { text-align: center; font-size: 14px; color: #6b52ae; font-weight: bold; background: #f0f0f0; padding: 10px; border-radius: 20px; }
	
	/* 按钮栏 */
	.action-bar { width: 100%; display: flex; gap: 15px; }
	button { flex: 1; font-size: 14px; border-radius: 25px; height: 44px; line-height: 44px; }
	.btn-home { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.4); }
	.btn-download { background: #d4af37; color: #2c3e50; font-weight: bold; }
	
	/* 隐藏Canvas，移出屏幕外 */
	.canvas-hide { position: fixed; left: 10000px; top: 0; }
</style>