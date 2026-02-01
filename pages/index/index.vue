<template>
	<view class="container">
		<view v-if="yesterdayReport" class="yesterday-box">
			<view class="box-header">
				<text class="box-title">昨日功课复盘</text>
				<text class="box-rate">完成率: {{yesterdayReport.rate}}%</text>
			</view>
			<view class="report-content">
				<text class="feedback-text">心得：{{yesterdayReport.feedback || '持之以恒，金石可镂'}}</text>
			</view>
		</view>

		<view class="mind-map-container" v-if="todayTask">
			<view class="center-node">
				<view class="glow-bg"></view>
				<text class="goal-text">{{currentGoal.title || '当前目标'}}</text>
				<text class="duration-text">{{currentGoal.typeName}} · {{todayTask.dayLabel}}</text>
			</view>

			<view class="branch-container">
				<view class="task-card" v-for="(action, index) in todayTask.actions" :key="index">
					<view class="connector-line"></view>
					<view class="task-content" :class="{ 'done-bg': action.done }">
						<view class="task-main">
							<text class="task-title">{{action.title}}</text>
							<text class="task-desc">{{action.desc}}</text>
						</view>
						<checkbox :checked="action.done" @click="toggleAction(index)" color="#6b52ae" />
					</view>
				</view>
				
				<view v-if="todayTask.isRest" class="rest-node">
					<text>🍀 今日休整，顺应天时</text>
				</view>
			</view>
		</view>

		<view class="feedback-area" v-if="todayTask && !todayTask.isRest">
			<view class="label-row">
				<text class="label">今日心得记录</text>
				<text class="save-tip" v-if="isSaving">自动保存中...</text>
			</view>
			<textarea 
				v-model="todayFeedback" 
				placeholder="记录下今日执行的感悟，将作为明日复盘的参考..." 
				@input="saveFeedback" 
			/>
		</view>

		<view class="footer-actions">
			<button class="btn-outline" @click="navToAllTasks">全周期路径图</button>
			<button class="btn-summary" @click="navToSummary">查看结业报告</button>
		</view>

		<view v-if="!hasUser" class="error-view">
			<text>数据未就绪，请重新录入</text>
			<button @click="reInit">返回初始化</button>
		</view>
	</view>
</template>

<script>
	// 引入逻辑层
	import logic from '@/common/logic.js';

	export default {
		data() {
			return {
				loading: true,
				hasUser: false,
				userInfo: null,
				currentGoal: null,
				taskList: [],
				todayTask: null,
				yesterdayReport: null,
				todayFeedback: '',
				isSaving: false
			}
		},
		// 关键点：使用 onLoad 替代 onShow 确保在浏览器刷新时立即执行
		onLoad() {
		    this.refreshPage();
		},
		onShow() {
		    // 确保从其他页面返回时也刷新数据
		    this.refreshPage();
		},
		methods: {
		    refreshPage() {
		        const goal = uni.getStorageSync('currentGoal');
		        const tasks = uni.getStorageSync('currentTasks');
		        
		        // 关键：如果没有数据，不要停留，直接去设置页
		        if (!goal || !tasks || tasks.length === 0) {
		            uni.redirectTo({ url: '/pages/setup/setup' });
		            return;
		        }
		
		        this.currentGoal = goal;
		        this.taskList = tasks;
		
		        // 获取当前时间字符串
		        const now = new Date();
		        const nowStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`;
		        
		        // 查找今日任务
		        let todayIdx = this.taskList.findIndex(t => t.date === nowStr);
		        
		        // 如果找不到今日（比如用户把系统时间往后调了），默认显示第一天
		        if (todayIdx === -1) todayIdx = 0;
		
		        this.todayTask = this.taskList[todayIdx];
		        this.todayFeedback = this.todayTask.feedback || '';
		
		        // 昨日报告逻辑
		        if (todayIdx > 0) {
		            const prev = this.taskList[todayIdx - 1];
		            // 确保 actions 存在
		            const actions = prev.actions || [];
		            const doneCount = actions.filter(a => a.done).length;
		            this.yesterdayReport = {
		                rate: actions.length > 0 ? Math.round((doneCount / actions.length) * 100) : 0,
		                feedback: prev.feedback
		            };
		        }
		        this.loading = false;
			},
			toggleAction(index) {
				this.todayTask.actions[index].done = !this.todayTask.actions[index].done;
				this.syncStorage();
			},
			saveFeedback() {
				this.isSaving = true;
				this.todayTask.feedback = this.todayFeedback;
				this.syncStorage();
				// 模拟保存延迟感
				setTimeout(() => { this.isSaving = false; }, 500);
			},
			syncStorage() {
				const idx = this.taskList.findIndex(t => t.date === this.todayTask.date);
				if (idx !== -1) {
					this.taskList[idx] = this.todayTask;
					uni.setStorageSync('currentTasks', this.taskList);
				}
			},
			navToSummary() {
				uni.navigateTo({ url: '/pages/summary/summary' });
			},
			navToAllTasks(){
			uni.navigateTo({
			            url: '/pages/full-path/full-path',
			            fail: (err) => {
			                console.error("跳转失败，请检查 pages.json 配置:", err);
			                uni.showToast({ title: '页面丢失', icon: 'none' });
			            }
			        });
			    },
			reInit() {
				uni.clearStorageSync();
				uni.reLaunch({ url: '/pages/setup/setup' });
			}
		}
	}
</script>

<style>
	.container { padding: 30rpx; background-color: #f6f8fb; min-height: 100vh; font-family: -apple-system, system-ui; }

	/* 昨日回顾卡片 */
	.yesterday-box { background: #fff; padding: 25rpx; border-radius: 20rpx; margin-bottom: 40rpx; box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.05); }
	.box-header { display: flex; justify-content: space-between; margin-bottom: 10rpx; }
	.box-title { font-size: 24rpx; color: #d4af37; font-weight: bold; }
	.box-rate { font-size: 22rpx; color: #6b52ae; }
	.feedback-text { font-size: 26rpx; color: #666; font-style: italic; }

	/* 思维导图样式区 */
	.mind-map-container { display: flex; flex-direction: column; align-items: center; padding: 40rpx 0; }
	.center-node { position: relative; background: #6b52ae; color: #fff; padding: 40rpx 60rpx; border-radius: 60rpx; text-align: center; z-index: 2; }
	.glow-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #6b52ae; filter: blur(20rpx); opacity: 0.3; border-radius: 60rpx; z-index: -1; }
	.goal-text { font-size: 38rpx; font-weight: bold; color: #ffffff;display: block; letter-spacing: 2rpx; }
	.duration-text { font-size: 22rpx;color: rgba(255, 255, 255, 0.85); opacity: 0.8; margin-top: 10rpx; display: block; }

	.branch-container { width: 100%; margin-top: 20rpx; }
	.task-card { display: flex; align-items: center; margin-bottom: 25rpx; }
	.connector-line { width: 40rpx; height: 2rpx; background: #6b52ae; opacity: 0.3; }
	.task-content { background: #ffffff; border-left: 10rpx solid #6b52ae; padding: 30rpx; border-radius: 16rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08); }
	.done-bg.task-title { background: #f0fdf4 !important;color: #95a5a6; opacity: 0.8; }
	
	.task-main { flex: 1; }
	.task-title { font-size: 30rpx; color: #1a1a1a; font-weight: bold; margin-bottom: 10rpx; }
	.task-desc { font-size: 26rpx; color: #4a4a4a; line-height: 1.5; background: #f8f9fa; padding: 15rpx; border-radius: 8rpx; }

	/* 反馈区域 */
	.feedback-area { background: #fff; padding: 30rpx; border-radius: 24rpx; margin-top: 20rpx; }
	.label-row { display: flex; justify-content: space-between; align-items: center; }
	.label { font-size: 26rpx; color: #333; font-weight: bold; }
	.save-tip { font-size: 20rpx; color: #999; }
	textarea { width: 100%; height: 160rpx; font-size: 26rpx; color: #555; margin-top: 20rpx; background: #f9f9f9; padding: 15rpx; border-radius: 12rpx; }

	.footer-actions { display: flex; gap: 20rpx; margin-top: 50rpx; padding-bottom: 50rpx; }
	button { flex: 1; height: 90rpx; line-height: 90rpx; border-radius: 45rpx; font-size: 28rpx; }
	.btn-outline { background: #fff; color: #6b52ae; border: 1px solid #6b52ae; }
	.btn-summary { background: #6b52ae; color: #fff; border: none; }
</style>
