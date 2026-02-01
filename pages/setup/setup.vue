<template>
	<view class="container">
		<view class="header-box">
			<text class="gold-title">天机测算 · 初始化</text>
			<text class="sub-hint">输入生辰信息，系统将为您生成唯一的修行指纹</text>
		</view>

		<view class="glass-card" v-if="!analysisResult">
			<view class="input-group">
				<text class="label">姓名 / 昵称</text>
				<input class="uni-input" v-model="form.name" placeholder="用于生成唯一命理指纹" placeholder-style="color:#bbb" />
			</view>
			
			<view class="input-group">
				<text class="label">当前身份</text>
				<picker @change="onProfChange" :range="professions">
					<view class="picker-val">{{ form.profession || '点击选择身份' }}</view>
				</picker>
			</view>

			<view class="input-group">
				<text class="label">出生日期</text>
				<picker mode="date" @change="onDateChange">
					<view class="picker-val">{{ form.date || '选择公历生日' }}</view>
				</picker>
			</view>

			<view class="input-group">
				<text class="label">出生时刻</text>
				<picker mode="time" @change="onTimeChange">
					<view class="picker-val">{{ form.time || '选择出生时间' }}</view>
				</picker>
			</view>

			<button class="btn-calculate" :loading="isCalculating" @click="startCalculate">
				{{ isCalculating ? '正在拨动星盘...' : '开始天机测算' }}
			</button>
		</view>

		<view class="result-scroll-view" v-else>
			<view class="analysis-card">
				<view class="section-box">
					<view class="section-head">
						<text class="icon">🌟</text>
						<text class="section-title">星座命理深度解析</text>
					</view>
					<text class="section-content">{{analysisResult.zodiacAnalysis}}</text>
				</view>
				
				<view class="section-box">
					<view class="section-head">
						<text class="icon">☯️</text>
						<text class="section-title">八字乾坤深度解析</text>
					</view>
					<text class="section-content">{{analysisResult.baziAnalysis}}</text>
				</view>

				<view class="section-box">
					<view class="section-head">
						<text class="icon">📜</text>
						<text class="section-title">性格特质与修身建议</text>
					</view>
					<text class="section-content">{{analysisResult.summary}}</text>
				</view>

				<view class="luck-row">
					<view class="luck-item">吉位：<text class="luck-val">{{analysisResult.lucky_direction}}</text></view>
					<view class="luck-item">开运色：<text class="luck-val">{{analysisResult.lucky_color}}</text></view>
				</view>

				<button class="btn-next" @click="goToSetGoal">解析完成，去设定目标</button>
			</view>
		</view>
	</view>
</template>

<script>
	import logic from '@/common/logic.js';

	export default {
		data() {
			return {
				isCalculating: false,
				analysisResult: null,
				professions: ['学生', '白领', '创业者', '自由职业', '无业'],
				form: {
					name: '',
					date: '',
					time: '12:00',
					profession: ''
				}
			}
		},
		methods: {
			onDateChange(e) { this.form.date = e.detail.value; },
			onTimeChange(e) { this.form.time = e.detail.value; },
			onProfChange(e) { this.form.profession = this.professions[e.detail.value]; },
			
			startCalculate() {
				// 基础校验
				if (!this.form.name || !this.form.date || !this.form.profession) {
					uni.showToast({ title: '信息尚未完整', icon: 'none' });
					return;
				}

				this.isCalculating = true;

				// 模拟深度演算过程
				setTimeout(() => {
					try {
						const dateParts = this.form.date.split('-');
						const hour = parseInt(this.form.time.split(':')[0]);
						
						// 1. 调用 logic.js 中的工具函数获取星座和八字基本信息
						const zodiac = logic.getZodiac(parseInt(dateParts[1]), parseInt(dateParts[2]));
						const bazi = logic.getBaZi(parseInt(dateParts[0]), dateParts[1], dateParts[2], hour);
						
						// 2. 生成深度智能分析 (因人而异的核心)
						const result = logic.generateFateAnalysis(
							this.form.name, 
							zodiac, 
							bazi, 
							this.form.profession
						);
						
						this.analysisResult = result;

						// 3. 存储用户信息及测算结果，供后续目标页调用
						uni.setStorageSync('userInfo', {
							name: this.form.name,
							profession: this.form.profession,
							zodiac: zodiac,
							bazi: bazi,
							fate: result
						});
					} catch (e) {
						console.error("测算失败:", e);
						uni.showToast({ title: '演算逻辑波动，请重试', icon: 'none' });
					} finally {
						this.isCalculating = false;
					}
				}, 1500);
			},
			
			goToSetGoal() {
				uni.navigateTo({ url: '/pages/goal/goal' });
			}
		}
	}
</script>

<style>
	.container { padding: 40rpx; background-color: #0f0f1d; min-height: 100vh; }
	
	.header-box { margin-bottom: 50rpx; padding-top: 40rpx; }
	.gold-title { font-size: 52rpx; font-weight: bold; color: #d4af37; display: block; text-shadow: 0 4rpx 20rpx rgba(212,175,55,0.3); }
	.sub-hint { font-size: 24rpx; color: #888; margin-top: 15rpx; display: block; }

	/* 输入卡片样式 */
	.glass-card { background: rgba(255, 255, 255, 0.95); border-radius: 40rpx; padding: 45rpx; box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.3); }
	.input-group { margin-bottom: 35rpx; }
	.label { font-size: 26rpx; color: #666; font-weight: bold; margin-bottom: 15rpx; display: block; }
	.uni-input, .picker-val { background: #f5f6fa; height: 100rpx; line-height: 100rpx; padding: 0 30rpx; border-radius: 20rpx; font-size: 30rpx; color: #333; border: 1px solid #eee; }

	.btn-calculate { background: linear-gradient(135deg, #d4af37, #b8860b); color: #fff; font-weight: bold; border-radius: 50rpx; margin-top: 50rpx; height: 110rpx; line-height: 110rpx; box-shadow: 0 10rpx 30rpx rgba(212,175,55,0.4); border: none; }

	/* 结果页样式 */
	.analysis-card { background: #fff; border-radius: 40rpx; padding: 40rpx; margin-bottom: 60rpx; }
	.section-box { margin-bottom: 40rpx; }
	.section-head { display: flex; align-items: center; margin-bottom: 15rpx; }
	.section-title { font-size: 32rpx; font-weight: bold; color: #6b52ae; margin-left: 10rpx; }
	.section-content { font-size: 28rpx; color: #444; line-height: 1.8; text-align: justify; display: block; background: #fcfaff; padding: 20rpx; border-radius: 12rpx; }

	.luck-row { display: flex; justify-content: space-around; background: #6b52ae; padding: 25rpx; border-radius: 20rpx; margin: 40rpx 0; }
	.luck-item { color: rgba(255,255,255,0.8); font-size: 26rpx; }
	.luck-val { color: #fff; font-weight: bold; margin-left: 10rpx; }

	.btn-next { background: #6b52ae; color: #fff; border-radius: 50rpx; height: 100rpx; line-height: 100rpx; font-weight: bold; border: none; }
</style>
