<template>
	<view class="container">
		<view class="setup-header">
			<text class="title">确立志向</text>
			<text class="desc" v-if="userInfo && userInfo.fate">
				根据您的命理，建议选择一个{{userInfo.fate.lucky_direction || '合适'}}方的目标
			</text>
		</view>

		<view class="goal-form">
			<view class="input-group">
				<text class="label">我的目标内容</text>
				<input class="uni-input" v-model="goalTitle" placeholder="如：记住日语50音" placeholder-style="color:#999" />
			</view>

			<view class="input-group">
				<text class="label">达成周期</text>
				<picker @change="onPeriodChange" :value="periodIndex" :range="periods" range-key="name">
					<view class="picker-val">{{ periods[periodIndex] ? periods[periodIndex].name : '请选择' }}</view>
				</picker>
			</view>

			<view class="input-group flex-row">
				<text class="label">周末休息</text>
				<switch :checked="isWeekendRest" @change="e => isWeekendRest = e.detail.value" color="#6b52ae" />
			</view>

			<button class="btn-generate" :loading="isGenerating" @click="handleStart">
				{{ isGenerating ? '运筹帷幄中...' : '生成并开启计划' }}
			</button>
		</view>
	</view>
</template>

<script>
	// 确保路径正确，如果不确定，请检查 common 文件夹是否在根目录
	import logic from '@/common/logic.js';

	export default {
		data() {
			return {
				goalTitle: '',
				periodIndex: 0,
				periods: [
					{ name: '周目标 (7天)', value: 'week' },
					{ name: '月目标 (30天)', value: 'month' },
					{ name: '半年目标', value: 'halfYear' },
					{ name: '年目标', value: 'year' }
				],
				isWeekendRest: true,
				isGenerating: false,
				userInfo: null // 初始设为 null
			}
		},
		onLoad() {
			// 防御性获取存储数据
			const storedInfo = uni.getStorageSync('userInfo');
			if (storedInfo) {
				this.userInfo = storedInfo;
			} else {
				// 如果没用户信息，强制回退到第一步
				uni.reLaunch({ url: '/pages/setup/setup' });
			}
		},
		methods: {
			onPeriodChange(e) {
				this.periodIndex = e.detail.value;
			},
			handleStart() {
				if (!this.goalTitle) {
					uni.showToast({ title: '请输入志向', icon: 'none' });
					return;
				}

				this.isGenerating = true;

				// 延迟执行，防止 UI 渲染冲突
				setTimeout(() => {
					try {
						const selectedPeriod = this.periods[this.periodIndex];
						
						// 调用重构后的动态任务生成逻辑
						const tasks = logic.generateMindMapPlan(
							this.goalTitle, 
							selectedPeriod.value, 
							this.isWeekendRest
						);

						// 存储基础信息
						uni.setStorageSync('currentGoal', {
							title: this.goalTitle,
							type: selectedPeriod.value,
							typeName: selectedPeriod.name,
							startDate: new Date().toISOString().split('T')[0]
						});

						// 存储生成的差异化任务
						uni.setStorageSync('currentTasks', tasks);

						// 跳转首页
						uni.reLaunch({
							url: '/pages/index/index'
						});
					} catch (err) {
						this.isGenerating = false;
						console.error("生成计划异常:", err);
						uni.showModal({
							title: '演算中断',
							content: '逻辑层脚本报错，请检查 common/logic.js',
							showCancel: false
						});
					}
				}, 1000);
			}
		}
	}
</script>

<style>
	.container { padding: 40rpx; background: #f4f6f9; min-height: 100vh; }
	.setup-header { margin: 40rpx 0 60rpx; }
	.title { font-size: 44rpx; font-weight: bold; color: #2c3e50; display: block; }
	.desc { font-size: 24rpx; color: #7f8c8d; margin-top: 10rpx; }
	
	.goal-form { background: #fff; padding: 40rpx; border-radius: 24rpx; box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.05); }
	.input-group { margin-bottom: 40rpx; border-bottom: 1px solid #eee; padding-bottom: 20rpx; }
	.flex-row { display: flex; justify-content: space-between; align-items: center; }
	.label { font-size: 28rpx; color: #6b52ae; font-weight: bold; margin-bottom: 20rpx; display: block; }
	
	/* 修正文字看不见的问题 */
	.uni-input { 
		font-size: 32rpx; 
		color: #333 !important; 
		height: 80rpx; 
		background: #f9f9f9; 
		padding: 0 20rpx; 
		border-radius: 8rpx;
	}
	.picker-val { font-size: 32rpx; color: #333; height: 60rpx; line-height: 60rpx; }
	
	.btn-generate { background: #6b52ae; color: #fff; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; font-weight: bold; margin-top: 40rpx; border: none; }
</style>
