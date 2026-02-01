<template>
	<view class="container">
		<view class="header">
			<text class="title">设定修行目标</text>
			<text class="subtitle">根据您的天机指纹，系统将为您量身定制行动路径</text>
		</view>

		<view class="goal-card">
			<view class="input-group">
				<text class="label">您的总目标</text>
				<textarea class="goal-input" v-model="goal" placeholder="例如：一个月背诵500个雅思单词、一周减重2kg、自研一个APP..." placeholder-style="color:#ccc" />
			</view>

			<view class="input-group">
				<text class="label">计划时长</text>
				<picker @change="onDurationChange" :range="durationOptions" range-key="name">
					<view class="picker-val">{{ selectedDuration.name || '请选择执行周期' }}</view>
				</picker>
			</view>

			<view class="input-group">
				<text class="label">周末安排</text>
				<view class="switch-row">
					<text class="switch-txt">周六日是否需要闭关休整？</text>
					<switch color="#6b52ae" :checked="isWeekendRest" @change="onRestChange" />
				</view>
			</view>

			<button class="btn-generate" :loading="isGenerating" @click="handleGenerate">
				{{ isGenerating ? '正在推演行动路径...' : '智能生成思维导图' }}
			</button>
		</view>

		<view class="tip-box">
			<text class="tip-txt">💡 提示：系统将根据您的生辰八字与目标内容，自动计算每日最佳能量执行点。</text>
		</view>
	</view>
</template>

<script>
	import logic from '@/common/logic.js';

	export default {
		data() {
			return {
				goal: '',
				isGenerating: false,
				isWeekendRest: true,
				durationOptions: [
					{ name: '一周（精进期）', value: 'week' },
					{ name: '一个月（蜕变期）', value: 'month' }
				],
				selectedDuration: { name: '一个月（蜕变期）', value: 'month' }
			}
		},
		methods: {
			onDurationChange(e) {
				this.selectedDuration = this.durationOptions[e.detail.value];
			},
			onRestChange(e) {
				this.isWeekendRest = e.detail.value;
			},
			handleGenerate() {
				if (!this.goal || this.goal.length < 5) {
					uni.showToast({ title: '请详细描述您的目标', icon: 'none' });
					return;
				}

				this.isGenerating = true;

				// 模拟智能拆解过程
				setTimeout(() => {
					try {
						// 1. 获取 setup.vue 存入的用户信息（包含姓名和八字，用于生成指纹）
						const userInfo = uni.getStorageSync('userInfo');
						if (!userInfo) {
							uni.showToast({ title: '用户信息丢失，请重新测算', icon: 'none' });
							return;
						}

						// 2. 调用适配后的 generateMindMapPlan
						// 传入目标、周期类型、用户信息（用于内部指纹算法）
						const taskList = logic.generateMindMapPlan(
							this.goal, 
							this.selectedDuration.value, 
							userInfo
						);

						// 3. 存储目标和任务数据
						uni.setStorageSync('currentGoal', {
							title: this.goal,
							duration: this.selectedDuration.value,
							createDate: new Date().toISOString().split('T')[0]
						});
						uni.setStorageSync('currentTasks', taskList);

						// 4. 跳转至首页（首页将自动显示当天的任务）
						uni.showToast({ title: '行动路径生成成功', icon: 'success' });
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/index/index'
							});
						}, 1000);

					} catch (e) {
						console.error(e);
						uni.showToast({ title: '路径推演中断', icon: 'none' });
					} finally {
						this.isGenerating = false;
					}
				}, 2000);
			}
		}
	}
</script>

<style>
	.container { padding: 40rpx; background: #f0f2f5; min-height: 100vh; }
	.header { margin-bottom: 60rpx; padding-top: 40rpx; }
	.title { font-size: 48rpx; font-weight: bold; color: #333; display: block; }
	.subtitle { font-size: 26rpx; color: #888; margin-top: 15rpx; display: block; }

	.goal-card { background: #fff; border-radius: 40rpx; padding: 50rpx; box-shadow: 0 15rpx 40rpx rgba(0,0,0,0.05); }
	.input-group { margin-bottom: 45rpx; }
	.label { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; display: block; }
	.goal-input { width: 100%; background: #f8f9fb; padding: 25rpx; border-radius: 20rpx; font-size: 28rpx; height: 200rpx; box-sizing: border-box; border: 1px solid #eee; }
	.picker-val { background: #f8f9fb; height: 100rpx; line-height: 100rpx; padding: 0 30rpx; border-radius: 20rpx; font-size: 28rpx; color: #333; border: 1px solid #eee; }
	
	.switch-row { display: flex; justify-content: space-between; align-items: center; background: #f8f9fb; padding: 20rpx 30rpx; border-radius: 20rpx; }
	.switch-txt { font-size: 26rpx; color: #666; }

	.btn-generate { background: #6b52ae; color: #fff; border-radius: 50rpx; height: 110rpx; line-height: 110rpx; font-weight: bold; margin-top: 60rpx; box-shadow: 0 10rpx 30rpx rgba(107,82,174,0.3); border: none; }

	.tip-box { margin-top: 50rpx; padding: 30rpx; background: rgba(107,82,174,0.05); border-radius: 20rpx; border: 1px dashed #6b52ae; }
	.tip-txt { font-size: 24rpx; color: #6b52ae; line-height: 1.6; }
</style>