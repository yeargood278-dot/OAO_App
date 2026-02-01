<script>
export default {
    onLaunch: function() {
        // 彻底禁用远程调试/统计可能带来的干扰
        console.log('App Launch - 正在进行本地身份核验');

        const userInfo = uni.getStorageSync('userInfo');
        const tasks = uni.getStorageSync('currentTasks');

        // 如果已经有任务数据，说明是老用户，直接强行跳转首页
        if (userInfo && tasks && tasks.length > 0) {
            uni.reLaunch({
                url: '/pages/index/index',
                success: () => {
                    console.log('老用户身份确认，已成功切入修行模式');
                }
            });
        } else {
            // 新用户去测算页
            uni.reLaunch({
                url: '/pages/setup/setup'
            });
        }
    },
    onShow: function() {
        // 每次切回 App 时再次校准，防止页面停留导致的异常
    }
}
</script>