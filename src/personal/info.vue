<template>
  <view>
    <!-- 个人信息 -->
    <view class="form bg-f">
      <view class="form-item flex flex-middle bd-e" @tap="changeHeadImg">
        <view class="key">头像</view>
        <view class="value flex-1">
          <image
            class="personal-avatar avatar-72"
            :src="personalInfo.headpath ? personalInfo.headpath : defaultHeadImg"
            mode="scaleToFill"
          />
        </view>
        <text class="icon iconfont icon-arrow-right c-6 fs-20 ml-25"></text>
      </view>
      <view class="form-item flex bd-e" @tap="handlePopup">
        <view class="key">姓名</view>
        <view class="value flex-1">{{ personalInfo.leader }}</view>
        <text class="icon iconfont icon-arrow-right c-6 fs-20 ml-25"></text>
      </view>
      <view class="form-item flex bd-e">
        <view class="key">手机号码</view>

        <view class="value flex-1">{{ personalInfo.mobile }}</view>
      </view>
      <view v-if="shouldShowRealnameAuth" class="form-item flex" @tap="navigateToRealnameAuth">
        <view class="key">实名认证</view>
        <view class="value flex-1">{{ realnameAuthStatusText }}</view>
        <text class="icon iconfont icon-arrow-right c-6 fs-20 ml-25"></text>
      </view>
      <view class="form-item flex bd-e">
        <view class="key">最后登录时间</view>
        <view class="value flex-1">{{ personalInfo.lastlogintime }}</view>
      </view>
    </view>
    <!-- 修改密码 -->
    <view v-if="!isSpecialMp" class="form bg-f" @tap="handleNavigation">
      <view class="form-item flex">
        <view class="c-0 flex-1">登录密码设置</view>
        <text class="icon iconfont icon-arrow-right c-6 fs-20 ml-25"></text>
      </view>
    </view>
    <!-- 退出登录 -->
    <view class="form bg-f" @tap="handleLoginExit">
      <view class="form-item flex">
        <view class="c-0 flex-1">退出登录</view>
        <text class="icon iconfont icon-arrow-right c-6 fs-20 ml-25"></text>
      </view>
    </view>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :default-value.sync="popDaultValue"
      :max-length="8"
      tip="最多8个字"
      :content="popContent"
      @confirm="handleConfirm"
    ></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { apiGetPersonalInfo, apiUpdateUserName, apiUpdateUserHeadimg, apiLogout } from '@/api/personal'
import { chooseImg, uploadImg } from '@/utils/upload'
import { personalHeadImage } from '@/utils/default-picture'
import dayjs from 'dayjs'
import { realnameAuthStatusMixin, realnameAuthNavigationMixin } from 'packages/mixins/realname-auth'
export default {
  mixins: [realnameAuthStatusMixin, realnameAuthNavigationMixin],
  data() {
    return {
      operaType: 0, // 1修改姓名 2退出登录
      showPopup: false, //true 显示弹窗
      popDaultValue: '', // 默认显示文字
      popType: 'prompt',
      popTitle: '',
      popContent: '',
      defaultHeadImg: personalHeadImage, // 缺省图片
      personalInfo: {
        headpath: '', //头像
        loginname: '', //登录名称
        mobile: '', // 手机号
        addtime: '', // 最后登录时间
        leader: '' // 负责人姓名
      }
    }
  },
  computed: {
    ...mapState(['isSpecialMp'])
  },
  onLoad(options) {
    this.personalInfo = JSON.parse(uni.getStorageSync('personalInfo'))
  },
  onShow() {
    // 获取实名认证状态
    this.fetchRealnameAuthStatus()
  },
  methods: {
    async fetchPersonalInfo() {
      // 获取个人信息
      let res = await apiGetPersonalInfo()
      uni.stopPullDownRefresh()
      if (this.$ck(res, true)) {
        let personalInfoTemp = {}
        for (let a in res.return_data.accountinfo) {
          personalInfoTemp[a] = res.return_data.accountinfo[a] == null ? '' : res.return_data.accountinfo[a]
        }
        this.personalInfo = personalInfoTemp
        uni.setStorageSync('personalInfo', JSON.stringify(this.personalInfo))
      }
    },
    onPullDownRefresh() {
      this.fetchPersonalInfo()
    },
    handleConfirm(data) {
      // 修改姓名
      if (this.operaType === 1) {
        this.popDaultValue = data && data.trim()
        if (!this.popDaultValue) {
          // 处理返回的数据，目前只做长度控制，不做字符校验
          return this.$msg('请输入姓名')
        }
        this.showPopup = false
        this.updateUserName(this.popDaultValue)
      } else if (this.operaType === 2) {
        //退出登录
        this.logout()
        this.showPopup = false
      }
    },
    async updateUserName(name) {
      // 更新名字
      let res = await apiUpdateUserName({
        name
      })
      if (this.$ck(res, true)) {
        this.fetchPersonalInfo()
        this.$msg('修改成功', { icon: 'success' })
      }
    },
    async logout() {
      // 退出登录
      let res = await apiLogout()
      if (this.$ck(res, true)) {
        const exitTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        let { mobile } = JSON.parse(uni.getStorageSync('accountinfo') || '{}')
        const timeOfLogin = { mobile, ...uni.getStorageSync('timeOfLogin'), exitTime }
        this.$uploadLog({
          type: 'logout',
          desc: '主动退出',
          extend: timeOfLogin
        })
        uni.reLaunch({ url: `/pages/login/index` })
      }
    },
    // 修改姓名
    handlePopup() {
      this.operaType = 1
      this.popDaultValue = this.personalInfo.leader
      this.popType = 'prompt'
      this.popTitle = '修改姓名'
      this.popContent = ''
      this.showPopup = true
    },
    // 退出登录
    handleLoginExit() {
      this.operaType = 2
      this.popType = 'confirm'
      this.popTitle = '温馨提示'
      this.popContent = '确定退出登录吗'
      this.showPopup = true
    },
    handleNavigation() {
      uni.navigateTo({
        url: `/personal/password/edit?isnullpassword=${this.personalInfo.isnullpassword}&mobile=${this.personalInfo.mobile}`
      })
    },
    async changeHeadImg() {
      // 上传头像
      const path = await chooseImg({ mediaType: ['image'] })
      if (path?.length) {
        let res = await uploadImg(path[0])
        if (this.$ck(res, true)) {
          this.changeImage(res.return_data)
        }
      }
    },
    async changeImage(url) {
      // 修改头像
      let res = await apiUpdateUserHeadimg({
        headpath: url
      })
      if (this.$ck(res, true)) {
        this.fetchPersonalInfo()
        this.$msg('修改成功', { icon: 'success' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form {
  margin: 20rpx;
  padding: 0 30rpx;
  border-radius: 10rpx;
  line-height: 40rpx;
  .form-title {
    @include primary-title(32rpx, #000);
  }
  &-item {
    padding: 30rpx 0;
    font-size: 30rpx;
    .key {
      color: $uni-text-color-grey;
    }
    .value {
      margin-left: 30rpx;
      text-align: right;
    }
  }
}
</style>
