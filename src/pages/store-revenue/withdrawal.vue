<template>
  <view v-if="isLoading" class="container" :style="themeVars">
    <view class="top-Wrapper" style="background: #f7f7f7; line-height: 1.5; text-align: right" @tap="show = true">
      <text style="margin-right: 10rpx">提现说明</text>
      <u-icon name="question-circle" color="#666" size="32"></u-icon>
    </view>
    <view class="itemWrapper">
      <view class="item border-b">
        <view class="label">提现到</view>
        <view class="content" style="display: flex; align-items: center">
          <text style="margin-right: 8rpx">{{ assetInfo.NickName || '' }}</text>
          <image class="face" :src="assetInfo.Headpath || defaultAvatar" mode="aspectFill" lazy-load="false" />
        </view>
      </view>
      <view class="item border-b">
        <view class="label">入账方式</view>
        <view class="content" style="display: flex; align-items: center">
          <view v-if="isCompanyHb" class="iconfont icon-gongzhonghao" style="color: #1fc821"></view>
          <u-icon v-else name="weixin-circle-fill" color="#1fc821" size="38"></u-icon>

          <text style="margin-left: 8rpx">{{ isCompanyHb ? '公众号拆红包' : '微信零钱' }}</text>
        </view>
      </view>
      <view class="item" style="padding: 0">
        <view class="label">提现金额</view>
      </view>
      <view class="item border-b" style="padding: 0">
        <view class="label" style="font-size: 48rpx">￥</view>
        <view class="content">
          <view class="loginInput">
            <input
              v-model="Amount"
              :placeholder="
                isCompanyHb ? '单次为1元~200元，单日最高可提现1000元' : '单次为1元~500元，单日最高可提现2万元'
              "
              placeholder-style="color: #bfbfbf; font-size: 30rpx;"
              @input="handleInput"
            />
          </view>
        </view>
      </view>
      <view class="item" style="padding: 0; font-size: 24rpx">
        <view v-if="(Amount && Amount < 1) || Amount > onceWidthdrawMax" class="label" style="color: #ff5e33">
          每次提现金额范围：1～{{ onceWidthdrawMax }}
        </view>
        <view v-else-if="Amount && Amount > assetInfo.Balance" class="label" style="color: #ff5e33">
          输入金额超过可提现余额
        </view>
        <view v-else class="label">可提现余额￥{{ assetInfo.Balance }}</view>
      </view>
      <view class="item check">
        <view :class="['button', 'button--large', disabled ? 'disabled' : '']" @tap="handleWithdrawa">确认提现</view>
      </view>
    </view>
    <u-popup v-model="show" mode="center" width="600rpx" height="auto" border-radius="20" closeable="true">
      <view style="font-size: 26rpx; padding: 50rpx">
        <view class="title" style="font-weight: bold; font-size: 32rpx; text-align: center; margin-bottom: 20rpx">
          提现说明
        </view>
        <view style="padding: 10rpx 0">
          <view>
            1、{{
              isCompanyHb
                ? '提现金额将以红包的形式推送至公众号聊天窗口或微信服务通知，领取过程为微信原生红包拆包流程，请注意查收并在24小时内领取，避免错过红包的领取有效期。'
                : '提现金额将入账到绑定的微信号零钱账户，提现成功后，微信支付将同步推送零钱入账通知，请注意查收。'
            }}
          </view>
        </view>
        <view style="padding: 10rpx 0">
          <view>
            2、{{
              isCompanyHb
                ? '单次及单日限额最多1000元，每日最多可提现10次，当日限额已满，请次日再试。'
                : `单次至少提现1元最多提现${onceWidthdrawMax}元，单日最高可提现2万元，若单日限额已满，请次日再试。`
            }}
          </view>
        </view>
        <view style="padding: 10rpx 0">
          <view>3、由于微信支付需实名制，非实名用户无法提现，请确保提现的微信号已实名认证。</view>
        </view>
        <view style="padding: 10rpx 0">
          <view>
            4、若由于微信号异常、微信号被限制打款、微信号未实名等情况导致的提现失败，所提现金额将会返还至可提现余额。
          </view>
        </view>
      </view>
    </u-popup>
    <common-popup
      ref="commonPopup"
      v-model="showPopup"
      placeholder="请输入您绑定的微信实名"
      type="prompt"
      :title="popTitle"
      :content="popContent"
      :default-value="RealName"
      @confirm="confirm"
    >
      <p slot="footer" class="tips">根据相关法律法规要求，超出2000元需实名认证，请输入您绑定的微信实名</p>
    </common-popup>
    <common-popup
      v-model="commonPopup.showPopup"
      :type="commonPopup.type"
      :title="commonPopup.title"
      :content="commonPopup.content"
      @confirm="operator"
    ></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>
<script>
import { staticURL } from '@/config'
import { apiCloud, apiGetSubscribeTemplateId } from '@/api/cloud-store'
import { getJsCode } from '@/utils/set-mp.js'
import subscribeMsg from '@/mixins/subscribe-msg.js'
export default {
  mixins: [subscribeMsg],
  data() {
    return {
      defaultAvatar: staticURL() + 'personal/defaultHeading.jpg',
      Amount: '',
      isLoading: false,
      show: false,
      assetInfo: {},
      type: 0, // 0-代表从首页门店营收进来   1-代表从活动分类渠道推广进来
      showPopup: false,
      popTitle: '实名认证',
      popContent: '',
      RealName: '',
      templateId: [],
      commonPopup: {
        showPopup: false,
        type: 'confirm',
        title: '提示',
        content: ''
      }
    }
  },
  computed: {
    onceWidthdrawMax() {
      return this.isCompanyHb ? 200 : 500
    },
    isCompanyHb() {
      // 是否企业红包
      return this.assetInfo.OperationType === 3
    },
    disabled() {
      return (
        !this.Amount || this.Amount < 1 || this.Amount > this.onceWidthdrawMax || this.Amount > this.assetInfo.Balance
      )
    }
  },
  onLoad(option) {
    this.type = Number(option.type) || 0
    apiCloud({
      url: `/api/v1/Withdrawa/GetRealName`,
      method: 'get',
      data: JSON.stringify({
        roleType: 0
      })
    }).then(res => {
      if (this.$ck(res)) {
        this.RealName = res.return_data
      }
    })
  },

  onShow() {
    this.GetCloudAssetInfo()
  },

  methods: {
    confirm(val) {
      if (!val) {
        return this.$msg('请输入您绑定的微信实名')
      }
      this.RealName = val
      this.operator()
    },
    async handleWithdrawa() {
      if (
        !this.Amount ||
        this.Amount < 1 ||
        this.Amount > this.onceWidthdrawMax ||
        this.Amount > this.assetInfo.Balance
      ) {
        return
      }
      if (this.Amount >= 2000) {
        this.$refs.commonPopup.changeValue = this.RealName
        this.showPopup = true
        return
      }
      if (this.isCompanyHb) {
        this.commonPopup = {
          showPopup: true,
          type: 'confirm',
          title: '提示',
          content: '提现将以红包的形式发放至公众号聊天窗口或微信服务通知，请在发放成功后的24小时内拆包领取！'
        }
        return
      }
      this.operator()
    },
    /** 执行操作 */
    async operator() {
      this.commonPopup.showPopup = false
      let res = await this.Withdrawa()
      if (this.$ck(res)) {
        if (this.assetInfo.WithdrawalAudit === 0 && this.type === 0) {
          await this.requestSubscribeMsg(this.templateId)
        }
      }
      this.Amount = ''
      setTimeout(() => {
        uni.navigateTo({
          url: `./withdrawal-detail?id=${res.return_data}&type=${this.type}`
        })
      }, 500)
    },
    GetCloudAssetInfo() {
      let data = {}
      this.type === 2 ? (data.roleType = 3) : ''
      const urlY = this.type === 1 ? 'ChannelReward' : this.type === 2 ? 'DirectlyAssets' : 'Withdrawa'
      apiCloud({
        url: `/api/v1/${urlY}/GetCloudAssetInfo`,
        method: 'get',
        data: JSON.stringify(data)
      }).then(async res => {
        this.isLoading = true
        if (this.$ck(res)) {
          this.assetInfo = res.return_data || {}
          if (this.assetInfo.WithdrawalAudit === 0) {
            this.templateId = await this.GetWithdrawaNotice()
          }
        }
      })
    },
    Withdrawa() {
      return new Promise((resolve, reject) => {
        let data = {
          Amount: this.Amount,
          RoleType: 0
        }
        if (this.Amount >= 2000) {
          data.RealName = this.RealName
        }
        this.type === 1 ? (data.RoleType = 4) : this.type === 2 ? (data.RoleType = 3) : (data.RoleType = 0)
        apiCloud({
          url: `/api/v1/Withdrawa/Withdrawa`,
          method: 'post',
          data: JSON.stringify(data)
        })
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            this.$msg(error.return_msg)
            reject(error)
          })
      })
    },
    // 获取订阅消息模板ID
    async GetWithdrawaNotice() {
      try {
        let res = await apiGetSubscribeTemplateId({
          type: 1,
          js_code: await getJsCode()
        })
        return Promise.resolve(res.return_data)
      } catch (err) {
        return Promise.reject(err)
      }
    },
    // 提现金额正则限制
    handleInput(e) {
      let value = e.detail.value
      value = value.replace(/[^\d.]/g, '')
      value = value.replace(/\.{2,}/g, '.')
      value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
      value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
      value = value.replace(/^\./g, '')
      if (value.indexOf('.') < 0 && value !== '') {
        value = parseFloat(value)
      }
      this.$nextTick(() => {
        this.Amount = value
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/tab.scss';
button {
  background: transparent;
  border-radius: 0;
  box-sizing: content-box;
  text-align: left;
}
.container {
  background-color: #f7f7f7;
  overflow: hidden;
  padding-bottom: 30rpx;
}
.itemWrapper {
  background: #fff;
  border-radius: 10rpx;
  margin: 30rpx 30rpx 0;
  padding: 30rpx;
}
.top-Wrapper {
  padding: 20rpx 30rpx 0;
}
.item {
  line-height: 80rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  position: relative;
  padding: 20rpx 0;
}
.face {
  display: block;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}
.loginInput {
  font-size: 50rpx;
  margin: 0 auto;
  box-sizing: border-box;
  width: 600rpx;
  margin-left: 10rpx;
  input {
    border: none;
    width: 100%;
    height: 90rpx;
  }
}
.label {
  flex: 1;
  color: #333;
}
.content {
  color: v#666;
}
.iconshuoming {
  font-size: 32rpx;
  color: #666;
}
.iconweixinlingqian {
  font-size: 36rpx;
  color: #1fc821;
  margin-top: 5rpx;
}
.click {
  color: #579bfb;
}
.border-b {
  border-bottom: 1px solid #eee;
}
.check {
  padding: 50rpx 0 20rpx;
  margin: 0 auto;
  width: 520rpx;
}
.disabled {
  background-color: #ccc;
}
.tips {
  font-size: 22rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #999999;
  text-align: left;
  margin-top: 27rpx;
}
</style>
