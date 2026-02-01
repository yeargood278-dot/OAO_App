<template>
	<view class="container">
		<view class="header-box" v-if="step === 1">
			<text class="title">开启命理规划</text>
			<text class="sub-title">系统将为您生成专属思维导图任务</text>
		</view>

		<view class="form-box" v-if="step === 1">
			<view class="input-item">
				<text class="label">昵称</text>
				<input class="input" v-model="form.nickname" placeholder="输入您的称呼" />
			</view>

			<view class="input-item" @click="showPicker = true">
				<text class="label">出生日期</text>
				<view class="input picker-text">
					{{ form.birthDate ? form.birthDate : '请选择年月日' }}
				</view>
			</view>

			<view class="input-item">
				<text class="label">出生时间</text>
				<picker mode="time" :value="form.birthTime" @change="e => form.birthTime = e.detail.value">
					<view class="input picker-text">{{ form.birthTime || '点击选择时间' }}</view>
				</picker>
			</view>

			<view class="input-item">
				<text class="label">当前职业</text>
				<input class="input" v-model="form.profession" placeholder="例如：学生、程序员、销售" />
			</view>
			
			<button class="btn-submit" @click="submitInfo">开始天机测算</button>
		</view>

		<view class="result-box" v-if="step === 2">
			<view class="fate-card">
				<view class="fate-header">
					<text class="zodiac-text">{{analysis.zodiac}}</text>
					<text class="bazi-text">{{analysis.bazi}}</text>
				</view>
				<view class="divider"></view>
				<view class="fate-body">
					<text class="fate-summary">{{analysis.result.summary}}</text>
					<view class="fate-quote">
						<text class="quote-icon">“</text>
						<text>{{analysis.result.yijing}}</text>
					</view>
				</view>
				<view class="lucky-grid">
					<view class="lucky-item">吉位：{{analysis.result.lucky_direction}}</view>
					<view class="lucky-item">幸色：{{analysis.result.lucky_color}}</view>
				</view>
			</view>
			<button class="btn-next" @click="finishSetup">开启我的目标计划</button>
		</view>

		<view class="mask" v-if="showPicker" @click="showPicker = false"></view>
		<view class="date-picker-pop" :class="{ 'pop-show': showPicker }">
			<view class="picker-header">
				<text @click="showPicker = false">取消</text>
				<text class="picker-title">选择出生日期</text>
				<text class="confirm" @click="confirmDate">确定</text>
			</view>
			<picker-view class="picker-view" :value="dateValue" @change="onDateChange">
				<picker-view-column>
					<view class="item" v-for="item in years" :key="item">{{item}}年</view>
				</picker-view-column>
				<picker-view-column>
					<view class="item" v-for="item in months" :key="item">{{item}}月</view>
				</picker-view-column>
				<picker-view-column>
					<view class="item" v-for="item in days" :key="item">{{item}}日</view>
				</picker-view-column>
			</picker-view>
		</view>
	</view>
</template>

<script>
	import logic from '@/common/logic.js';

	export default {
		data() {
			const date = new Date();
			const years = [];
			const months = [];
			const days = [];
			for (let i = 1950; i <= date.getFullYear(); i++) years.push(i);
			for (let i = 1; i <= 12; i++) months.push(i);
			for (let i = 1; i <= 31; i++) days.push(i);

			return {
				step: 1,
				showPicker: false,
				years, months, days,
				dateValue: [years.length - 30, 0, 0], // 默认选择 1990-1-1
				tempDate: [1990, 1, 1],
				form: {
					nickname: '',
					birthDate: '',
					birthTime: '12:00',
					profession: ''
				},
				analysis: { zodiac: '', bazi: '', result: {} }
			}
		},
		methods: {
			onDateChange(e) {
				const val = e.detail.value;
				this.tempDate = [this.years[val[0]], this.months[val[1]], this.days[val[2]]];
			},
			confirmDate() {
				const [y, m, d] = this.tempDate;
				this.form.birthDate = `${y}年${m}月${d}日`;
				this.showPicker = false;
			},
			submitInfo() {
				if (!this.form.nickname || !this.form.birthDate || !this.form.profession) {
					uni.showToast({ title: '信息不全，天机难测', icon: 'none' });
					return;
				}
				uni.showLoading({ title: '演算中...' });
				
				// 解析日期计算
				const dateMatch = this.form.birthDate.match(/(\d+)年(\d+)月(\d+)日/);
				const year = parseInt(dateMatch[1]);
				const month = parseInt(dateMatch[2]);
				const day = parseInt(dateMatch[3]);
				const hour = parseInt(this.form.birthTime.split(':')[0]);

				const zodiac = logic.getZodiac(month, day);
				const bazi = logic.getBaZi(year, month, day, hour);
				const result = logic.generateFateAnalysis(this.form.nickname, zodiac, bazi, this.form.profession);

				this.analysis = { zodiac, bazi, result };
				uni.setStorageSync('userInfo', { ...this.form, zodiac, bazi, fate: result });
				
				setTimeout(() => {
					uni.hideLoading();
					this.step = 2;
				}, 1000);
			},
			finishSetup() {
				uni.redirectTo({ url: '/pages/goal/goal' });
			}
		}
	}
</script>

<style>
	.container { padding: 40rpx; background: #1a1a1a; min-height: 100vh; color: #fff; }
	.header-box { margin: 60rpx 0; }
	.title { font-size: 48rpx; font-weight: bold; display: block; color: #d4af37; }
	.sub-title { font-size: 24rpx; color: #888; margin-top: 10rpx; }

	.input-item { margin-bottom: 40rpx; }
	.label { font-size: 28rpx; color: #d4af37; margin-bottom: 20rpx; display: block; font-weight: bold; }
	
	/* 关键修改：调整输入框颜色和背景 */
	.input { 
		background: #ffffff;        /* 背景改为纯白，确保对比度 */
		border: 2px solid #d4af37;  /* 金色边框 */
		height: 100rpx; 
		line-height: 100rpx; 
		padding: 0 30rpx; 
		border-radius: 16rpx; 
		color: #333333;             /* 字体改为深灰色，清晰可见 */
		font-size: 32rpx; 
	}
	
	/* 针对选择器的特殊处理 */
	.picker-text { 
		color: #333333; 
		display: flex;
		align-items: center;
	}
    
    /* 占位符颜色调整 */
    .input-placeholder {
        color: #999999;
    }

	.btn-submit { background: #d4af37; color: #1a1a1a; font-weight: bold; border-radius: 50rpx; margin-top: 60rpx; height: 100rpx; line-height: 100rpx; }

	/* 结果卡片等其他样式保持不变... */
	.fate-card { background: #fff; color: #333; border-radius: 30rpx; padding: 40rpx; margin-top: 40rpx; }
	.fate-header { display: flex; justify-content: space-between; align-items: baseline; }
	.zodiac-text { font-size: 44rpx; font-weight: bold; color: #6b52ae; }
	.bazi-text { font-size: 28rpx; color: #666; }
	.divider { height: 2rpx; background: #eee; margin: 30rpx 0; }
	.fate-summary { font-size: 30rpx; line-height: 1.6; display: block; }
	.fate-quote { background: #f9f9f9; padding: 20rpx; border-left: 6rpx solid #d4af37; margin-top: 30rpx; position: relative; }
	.lucky-grid { display: flex; gap: 20rpx; margin-top: 30rpx; }
	.lucky-item { flex: 1; background: #f0edff; color: #6b52ae; font-size: 24rpx; padding: 15rpx; text-align: center; border-radius: 10rpx; }
	.btn-next { background: #6b52ae; color: #fff; border-radius: 50rpx; margin-top: 50rpx; height: 100rpx; line-height: 100rpx;}

	/* 日期选择器弹出层样式保持不变... */
	.mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 998; }
	.date-picker-pop { position: fixed; bottom: -600rpx; left: 0; right: 0; height: 600rpx; background: #fff; z-index: 999; transition: all 0.3s; border-radius: 30rpx 30rpx 0 0; }
	.pop-show { bottom: 0; }
	.picker-header { display: flex; justify-content: space-between; padding: 30rpx; border-bottom: 1px solid #eee; color: #333; font-size: 32rpx; }
	.confirm { color: #6b52ae; font-weight: bold; }
	.picker-view { width: 100%; height: 450rpx; }
	.item { line-height: 80rpx; text-align: center; font-size: 32rpx; color: #333; }
</style>

