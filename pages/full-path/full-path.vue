<template>
	<view class="container">
		<view class="header">
			<text class="title">目标全景图</text>
			<text class="subtitle">共 {{taskList.length}} 天 · 当前第 {{currentDayIdx + 1}} 天</text>
		</view>

		<scroll-view scroll-y class="map-scroll">
			<view class="path-line">
				<view v-for="(day, index) in taskList" :key="index" 
					class="day-node" 
					:class="{ 'is-past': index < currentDayIdx, 'is-today': index === currentDayIdx }">
					
					<view class="node-sidebar">
						<view class="dot"></view>
						<view class="line" v-if="index !== taskList.length - 1"></view>
					</view>

					<view class="node-content">
						<view class="day-info">
							<text class="date-label">{{day.dayLabel}} ({{day.date}})</text>
							<text v-if="index === currentDayIdx" class="badge">今日</text>
						</view>

						<view v-if="day.isRest" class="rest-card">🍀 休息整备，顺势而为</view>
						
						<view v-else class="actions-list">
							<view v-for="(action, aIdx) in day.actions" :key="aIdx" class="action-item">
								<text class="action-dot">└</text>
								<text class="action-title" :class="{ 'text-done': action.done }">
									{{action.title}}
								</text>
							</view>
						</view>
						
						<view v-if="day.feedback" class="node-feedback">
							“ {{day.feedback}} ”
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				taskList: [],
				currentDayIdx: 0
			}
		},
		onLoad() {
			const tasks = uni.getStorageSync('currentTasks');
			if (tasks) {
				this.taskList = tasks;
				const nowStr = new Date().toISOString().split('T')[0];
				this.currentDayIdx = this.taskList.findIndex(t => t.date === nowStr);
			}
		}
	}
</script>

<style>
	.container { padding: 30rpx; background: #f4f6f9; min-height: 100vh; }
	.header { margin-bottom: 40rpx; text-align: center; }
	.title { font-size: 40rpx; font-weight: bold; color: #6b52ae; display: block; }
	.subtitle { font-size: 24rpx; color: #999; }

	.map-scroll { height: calc(100vh - 150rpx); }
	.path-line { padding-left: 20rpx; }

	.day-node { display: flex; margin-bottom: 0; }
	.node-sidebar { width: 40rpx; display: flex; flex-direction: column; align-items: center; }
	.dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: #ddd; z-index: 2; margin-top: 15rpx; }
	.line { width: 4rpx; flex: 1; background: #ddd; }

	/* 状态样式 */
	.is-past .dot { background: #6b52ae; opacity: 0.5; }
	.is-past .line { background: #6b52ae; opacity: 0.3; }
	.is-today .dot { background: #6b52ae; box-shadow: 0 0 15rpx #6b52ae; transform: scale(1.3); }
	.is-today .line { background: #ddd; }

	.node-content { flex: 1; padding-bottom: 60rpx; padding-left: 30rpx; }
	.day-info { display: flex; align-items: center; margin-bottom: 15rpx; }
	.date-label { font-size: 28rpx; font-weight: bold; color: #333; }
	.badge { background: #6b52ae; color: #fff; font-size: 20rpx; padding: 2rpx 10rpx; border-radius: 6rpx; margin-left: 15rpx; }

	.actions-list { background: #fff; border-radius: 12rpx; padding: 20rpx; border: 1px solid #eee; }
	.action-item { font-size: 24rpx; color: #666; margin-bottom: 10rpx; display: flex; }
	.action-dot { color: #ccc; margin-right: 10rpx; }
	.text-done { text-decoration: line-through; color: #bbb; }

	.rest-card { background: #fff9db; color: #f08c00; font-size: 24rpx; padding: 20rpx; border-radius: 12rpx; border: 1px dashed #f08c00; }
	.node-feedback { font-size: 22rpx; color: #999; font-style: italic; margin-top: 15rpx; }
</style>