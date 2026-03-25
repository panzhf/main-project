<template>
  <view class="containter">
    <view :class="['iconfont', isFail ? 'icon-fail' : 'icon-success']"></view>
    <view class="tips">{{ msg }}</view>
    <view class="btn">
      <u-button v-if="type === '1'" type="error" shape="circle" @click="handleNext">点击跳转</u-button>
      <u-button v-else :disabled="isSubscribe" type="error" shape="circle" @click="handleSubscribe">
        {{ isSubscribe ? '已订阅' : '审核后通知我结果' }}
      </u-button>
    </view>
  </view>
</template>

<script>
import { apiGetSubscribeTemplateId } from '@/api/cloud-store'
import { getJsCode, hideHomeButton } from '@/utils/set-mp.js'
import subscribeMsg from '@/mixins/subscribe-msg.js'
export default {
  mixins: [subscribeMsg],
  data() {
    return {
      msg: '注册资料提交成功，请等待审核~',
      isSubscribe: false,
      type: '',
      isFail: false
    }
  },
  async onLoad(options) {
    hideHomeButton()
    this.type = options.type
    this.type === '1' ? (this.msg = '激活成功~') : (this.msg = '注册资料提交成功，请等待审核~')
    if (options.msg && options.msg !== '注册资料提交成功，请等待审核~') {
      this.msg = options.msg
      this.isFail = true
    }
    await this.handleGetSubId()
  },
  methods: {
    async handleSubscribe() {
      const res = await this.requestSubscribeMsg(this.noticeTempId)
      if (res[this.noticeTempId] === 'accept') {
        this.$msg('订阅成功')
        this.isSubscribe = true
      }
    },
    // 获取消息订阅模板ID
    async handleGetSubId() {
      let data = {
        js_code: await getJsCode(),
        type: 2 //1-提现审核消息,2-注册审核消息
      }
      let res = await apiGetSubscribeTemplateId(data)
      if (this.$ck(res)) this.noticeTempId = res.return_data || ''
    },
    handleNext() {
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
.containter {
  background-color: #fff;
  height: 100%;
  text-align: center;
  .iconfont {
    padding-top: 180rpx;
    font-size: 100rpx;
  }
  .icon-success {
    color: #02c567;
  }
  .icon-fail {
    color: #ed7342;
  }
  .tips {
    margin-top: 39rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #000;
  }
  .btn {
    margin-top: 115rpx;
    padding: 0 90rpx;
  }
}
</style>
