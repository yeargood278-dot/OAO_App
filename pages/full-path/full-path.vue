<template>
	<view class="container">
		<view class="map-header">
			<text class="map-title">修行全景图</text>
			<text class="map-subtitle">基于天机指纹生成的{{taskList.length}}日行动路径</text>
		</view>

		<scroll-view scroll-y class="path-scroll">
			<view class="path-container">
				<view class="node root-node">
					<view class="node-circle">心之所向</view>
					<text class="node-label">{{currentGoal.title}}</text>
				</view>

				<view v-for="(day, index) in taskList" :key="index" class="path-branch">
					<view class="connector-line" :class="{'line-active': day.isReported}"></view>
					
					<view class="day-node" :class="{'node-active': day.isReported, 'node-today': day.isToday}">
						<view class="day-marker">{{index + 1}}</view>
						<view class="day-content">
							<view class="day-head">
								<text class="day-name">{{day.dayLabel}}</text>
								<text class="day-status" v-if="day.result">{{getResultText(day.result)}}</text>
							</view>
							<view class="action-preview">
								<text v-for="(act, aIdx) in day.actions" :key="aIdx" class="preview-item">
									· {{act.title}}
								</text>
							</view>
						</view>
					</view>
				</view>

				<view class="connector-line"></view>
				<view class="node end-node">
					<view class="node-circle">功德圆满</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentGoal: {},
				taskList: []
			}
		},
		onShow() {
			this.loadPath();
		},
		methods: {
			loadPath() {
				const tasks = uni.getStorageSync('currentTasks');
				const goal = uni.getStorageSync('currentGoal');
				const nowStr = new Date().toISOString().split('T')[0];
				
				if (tasks) {
					this.taskList = tasks.map(t => ({
						...t,
						isToday: t.date === nowStr
					}));
					this.currentGoal = goal;
				}
			},
			getResultText(res) {
				const dict = { all: '圆满', part: '进取', none: '待发' };
				return dict[res] || '';
			}
		}
	}
</script>

<style>
	.container { background: #f0f2f5; min-height: 100vh; padding: 40rpx; }
	.map-header { text-align: center; margin-bottom: 60rpx; }
	.map-title { font-size: 36rpx; font-weight: bold; color: #333; }
	.map-subtitle { font-size: 24rpx; color: #999; margin-top: 10rpx; display: block; }

	.path-container { display: flex; flex-direction: column; align-items: center; padding-bottom: 100rpx; }
	
	/* 核心节点样式 */
	.node-circle { width: 140rpx; height: 140rpx; border-radius: 50%; background: #6b52ae; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24rpx; text-align: center; box-shadow: 0 10rpx 20rpx rgba(107,82,174,0.3); z-index: 2; }
	.node-label { margin-top: 20rpx; font-size: 28rpx; font-weight: bold; color: #6b52ae; max-width: 300rpx; text-align: center; }

	/* 连接线 */
	.connector-line { width: 4rpx; height: 60rpx; background: #ddd; margin: 10rpx 0; }
	.line-active { background: #6b52ae; }

	/* 每日节点卡片 */
	.day-node { width: 90%; background: #fff; border-radius: 20rpx; display: flex; padding: 30rpx; box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.05); position: relative; border: 2rpx solid transparent; }
	.node-today { border-color: #ff9800; background: #fff9f0; transform: scale(1.02); }
	.node-active { border-left: 10rpx solid #6b52ae; }

	.day-marker { width: 50rpx; height: 50rpx; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22rpx; color: #666; margin-right: 25rpx; flex-shrink: 0; }
	.node-active .day-marker { background: #6b52ae; color: #fff; }

	.day-content { flex: 1; }
	.day-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15rpx; }
	.day-name { font-size: 28rpx; font-weight: bold; }
	.day-status { font-size: 20rpx; color: #07c160; background: #e8f5e9; padding: 2rpx 12rpx; border-radius: 4rpx; }
	.action-preview { display: flex; flex-direction: column; gap: 8rpx; }
	.preview-item { font-size: 24rpx; color: #777; }
</style>
