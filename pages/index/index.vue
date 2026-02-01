<template>
	<view class="container">
		<view class="header">
			<view>
				<text class="greet">{{greetText}}，{{uName}}</text>
				<text class="goal-now">🎯 {{uGoal}}</text>
			</view>
			<view class="p-circle">
				<text class="p-val">{{progress}}%</text>
			</view>
		</view>

		<view class="task-box" v-if="todayTask">
			<view class="task-head">
				<text>今日行动建议</text>
				<text class="day-tag">{{todayTask.dayLabel}}</text>
			</view>
			<view class="item" v-for="(a, i) in todayTask.actions" :key="i">
				<text class="idx">{{i+1}}</text>
				<view class="cont">
					<text class="t">{{a.title}}</text>
					<text class="d">{{a.desc}}</text>
				</view>
			</view>
		</view>

		<view class="review-box">
			<text class="rev-title">今日行动评定</text>
			<view class="btns">
				<view v-for="o in opts" :key="o.v" @click="res=o.v" :class="['btn', res==o.v?'active':'']">
					{{o.n}}
				</view>
			</view>
			<button class="save-btn" @click="save">保存今日进展</button>
		</view>

		<button class="map-btn" @click="navMap">查看思维导图全景</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			uName: '', uGoal: '', progress: 0, greetText: '',
			todayTask: null, res: '',
			opts: [{n:'全部完成',v:'all'},{n:'部分完成',v:'part'},{n:'未开始',v:'none'}]
		}
	},
	onShow() {
		const user = uni.getStorageSync('userInfo');
		const tasks = uni.getStorageSync('currentTasks');
		const goal = uni.getStorageSync('currentGoal');

		if (!user || !tasks) {
			uni.reLaunch({ url: '/pages/setup/setup' });
			return;
		}

		this.uName = user.name;
		this.uGoal = goal.title;
		
		const now = new Date();
		const hr = now.getHours();
		this.greetText = hr < 12 ? '早安' : (hr < 18 ? '午安' : '晚安');

		// 匹配今日
		const nowStr = now.toISOString().split('T')[0];
		const idx = tasks.findIndex(t => t.date === nowStr);
		this.todayTask = tasks[idx !== -1 ? idx : 0];
		this.res = this.todayTask.result || '';

		const done = tasks.filter(t => t.isReported).length;
		this.progress = Math.round((done / tasks.length) * 100);
	},
	methods: {
		save() {
			if(!this.res) return;
			let tasks = uni.getStorageSync('currentTasks');
			let idx = tasks.findIndex(t => t.date === this.todayTask.date);
			tasks[idx].result = this.res;
			tasks[idx].isReported = true;
			uni.setStorageSync('currentTasks', tasks);
			uni.showToast({title: '已存入修行志'});
			this.progress = Math.round((tasks.filter(t => t.isReported).length / tasks.length) * 100);
		},
		navMap() { uni.navigateTo({ url: '/pages/full-path/full-path' }); }
	}
}
</script>

<style>
.container { padding: 40rpx; background: #0f0f1d; min-height: 100vh; color: #fff; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60rpx; }
.greet { font-size: 40rpx; font-weight: bold; display: block; }
.goal-now { font-size: 24rpx; color: #d4af37; margin-top: 10rpx; }
.p-circle { width: 100rpx; height: 100rpx; border: 4rpx solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.p-val { font-size: 24rpx; color: #d4af37; }

.task-box { background: rgba(255,255,255,0.05); border-radius: 20rpx; padding: 30rpx; margin-bottom: 40rpx; }
.task-head { display: flex; justify-content: space-between; font-size: 26rpx; color: #888; margin-bottom: 30rpx; }
.day-tag { color: #d4af37; }
.item { display: flex; margin-bottom: 30rpx; }
.idx { width: 36rpx; height: 36rpx; background: #d4af37; color: #000; border-radius: 50%; text-align: center; line-height: 36rpx; font-size: 22rpx; margin-right: 20rpx; flex-shrink: 0; }
.t { font-size: 28rpx; font-weight: bold; display: block; }
.d { font-size: 24rpx; color: #999; margin-top: 4rpx; display: block; }

.review-box { margin-top: 40rpx; }
.rev-title { font-size: 28rpx; color: #d4af37; margin-bottom: 30rpx; display: block; }
.btns { display: flex; gap: 20rpx; margin-bottom: 40rpx; }
.btn { flex: 1; height: 80rpx; line-height: 80rpx; text-align: center; background: #1a1a2e; border-radius: 10rpx; font-size: 24rpx; color: #888; }
.btn.active { background: #d4af37; color: #000; }
.save-btn { background: #6b52ae; color: #fff; border-radius: 50rpx; border: none; }
.map-btn { margin-top: 40rpx; background: none; border: 1px solid #6b52ae; color: #6b52ae; font-size: 24rpx; border-radius: 50rpx; }
</style>
