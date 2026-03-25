<template>
  <view class="detail" :style="themeVars">
    <view class="bulk">
      <view class="row">
        <view class="left">姓名</view>
        <view class="right"><input v-model="info.leader" type="text" disabled /></view>
      </view>
      <view class="row">
        <view class="left">手机号</view>
        <view class="right">{{ info.mobile }}</view>
      </view>
      <view class="tips">姓名与手机号仅限店员本人登录后修改</view>
      <view class="row">
        <view class="left">权限</view>
        <view class="right" @click="handleRule">
          <view class="rule">
            <view class="lable">修改店员权限</view>
            <text class="iconfont icon-arrow-right fs-24"></text>
          </view>
          <view class="rule-list">
            <view v-for="(item, index) in subperMissionsList" :key="index" class="tag">{{ item.name }}</view>
          </view>
          <view v-if="!subperMissionsList.length && !authorLoading" class="rule-list">
            <view class="title">此店员未配置权限</view>
          </view>
        </view>
      </view>
    </view>
    <template v-if="type === 'audit'">
      <button class="button mt-60" @click="handleAudit(1)">同意</button>
      <button class="button white mt-30" @click="showPopup = true">拒绝</button>
    </template>
    <template v-if="type === 'detail'">
      <button class="button mt-60" @click="handleSubmit">保存</button>
      <button class="button white mt-30" @click="tipsPopup = true">删除此店员</button>
    </template>

    <common-popup
      v-model="showPopup"
      placeholder="请填写审核不通过的理由，限50字"
      input-type="textarea"
      type="prompt"
      title="提示"
      :max-length="50"
      :show-title="false"
      @confirm="confirm"
    ></common-popup>
    <common-popup
      v-model="tipsPopup"
      content="确定删除店员？"
      input-type="textarea"
      type="confirm"
      title="提示"
      :max-length="50"
      @confirm="confirmDelete"
    ></common-popup>
    <common-popup
      v-model="commonPopup.showPopup"
      :content="commonPopup.content"
      :type="commonPopup.type"
    ></common-popup>
  </view>
</template>

<script>
import {
  apiGetclerkReviewDetail,
  apiGetclerkDetail,
  apiGetUserInfoRule,
  apiGetclerkEdid,
  apiGetclerkDelete,
  apiGetclerkReviewClerk
} from '@/api/sales.js'
export default {
  data() {
    return {
      showPopup: false,
      tipsPopup: false,
      id: 0,
      info: {},
      subperMissions: [],
      commonPopup: {
        showPopup: false,
        content: '',
        type: 'tip'
      },
      type: 'audit',
      authorLoading: true
    }
  },
  computed: {
    subperMissionsList() {
      // 获取权限列表
      let listArr = []
      this.subperMissions.length && (listArr = this.getSubMission('getName'))
      // console.log('listArr', listArr)
      return listArr
    }
  },
  /*
   * type detail、audit
   */
  onLoad(options) {
    this.id = options.id
    this.type = options.type || 'audit'
    uni.setNavigationBarTitle({
      title: this.type === 'audit' ? '审核店员' : '店员详情'
    })
    this.getData()
    this.getAuthority()
    uni.removeStorageSync('subperMissions')
  },
  methods: {
    getSubMission(type) {
      let listArr = []
      this.subperMissions.forEach(item => {
        if (item.state === 1) {
          let list = this.dealSubperMissions(item.sublist, type)
          listArr = [...listArr, ...list]
        }
      })
      return listArr.flat()
    },
    permissionsIds() {
      // 获取权限id
      if (!this.subperMissions.length) return []
      let listArr = this.getSubMission('getId')
      return listArr
    },
    async confirmDelete() {
      this.tipsPopup = false
      let res = await apiGetclerkDelete({ sysclerkid: this.id })
      if (this.$ck(res, false)) {
        this.$msg(res.return_msg)
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      } else {
        this.commonPopup.showPopup = true
        this.commonPopup.content = res.return_msg
        this.commonPopup.type = 'tip'
      }
    },
    dealSubperMissions(oriList, type) {
      const list = []
      for (const item of oriList) {
        if (item.show) {
          if (type === 'getName') {
            list.push({ name: item.name, number: item.number })
            for (const child of item.sublist) {
              if (child.show) {
                list.push({ name: child.name, number: child.number })
              }
            }
          } else if (type === 'getId') {
            list.push(item.number)
            for (const child of item.sublist) {
              if (child.show) list.push(child.number)
            }
          }
        }
        if (item.state !== 3 && type === 'set') {
          for (const child of item.sublist) {
            child.show = child.state === 1
          }
          list.push({ ...item, show: item.state === 1 })
        }
      }
      return list
    },
    async getAuthority() {
      // reviewtype： 0待审核, 1审核通过, 2审核不通过
      let res = await apiGetUserInfoRule({ clerkid: this.id, reviewtype: this.type === 'audit' ? 0 : 1 })
      this.authorLoading = false
      if (this.$ck(res)) {
        let { return_data: list } = res
        list.forEach(item => {
          item.sublist = this.dealSubperMissions(item.sublist, 'set')
        })
        this.subperMissions = list
      }
    },
    async getData() {
      let func = this.type === 'audit' ? apiGetclerkReviewDetail : apiGetclerkDetail
      let res = await func({ sysclerkid: this.id })
      if (this.$ck(res)) {
        this.info = res.return_data
      }
    },
    async handleRule() {
      uni.setStorageSync('subperMissions', JSON.stringify(this.subperMissions))
      uni.navigateTo({
        url: `/sales-clerk/permissions`
      })
    },
    confirm(val) {
      if (!val.trim()) {
        return this.$msg('请输入审核不通过的理由')
      }
      this.showPopup = false
      this.handleAudit(2, val)
    },
    async handleSubmit() {
      let query = {
        sysclerkid: this.id, //系统级店员ID
        clerkname: this.info.leader,
        headpath: this.info.headpath,
        authority: this.permissionsIds() //对应权限对应的数字，数组
      }
      let res = await apiGetclerkEdid(query)
      if (this.$ck(res)) {
        this.$msg(res.return_msg)
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    },
    async handleAudit(state, reviewremark = '') {
      let res = await apiGetclerkReviewClerk({
        sysclerkid: this.id, //审核表店员ID
        authority: this.permissionsIds(), //对应权限对应的数字，数组
        reviewresult: state, //审核结果 2：不通过 1：通过
        reviewremark: reviewremark
      })
      if (this.$ck(res)) {
        this.$msg(res.return_msg)
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bulk {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx 20rpx;
  .head {
    font-size: 30rpx;
    font-weight: bold;
    color: #000000;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      background: #ff7640;
      width: 60rpx;
      height: 8rpx;
      opacity: 0.5;
      border-radius: 4rpx;
      left: 0rpx;
      top: 30rpx;
    }
  }
  .row {
    display: flex;
    justify-content: space-between;
    padding-bottom: 40rpx;
    border-bottom: 1rpx solid #e5e5e5ff;
    margin-top: 40rpx;
    .left {
      width: 130rpx;
    }
    .right {
      flex: 1;
      .rule {
        align-items: center;
        display: flex;
        justify-content: space-between;
        font-size: 30rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #000000;
      }
      .rule-list {
        margin-top: 12rpx;
        display: flex;
        flex-wrap: wrap;
        .title {
          font-size: 24rpx;
          font-family: PingFang SC;
          font-weight: 500;
          color: #999999;
        }
        .tag {
          margin-top: 12rpx;
          border: 1rpx solid #cccccc;
          border-radius: 20rpx;
          padding: 2rpx 16rpx;
          margin-left: 10rpx;
          color: #666666;
          font-size: 24rpx;
        }
      }
    }
    &:last-child {
      border: none;
      padding-bottom: 20rpx;
    }
    &:first-child {
      margin-top: 20rpx;
    }
  }
  .tips {
    margin-top: 18rpx;
    font-size: 24rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #999999;
  }
}
.detail {
  padding: 20rpx;
}
.button {
  width: 690rpx;
  height: 90rpx;
  // background: #ff7640;
  background: var(--theme-color, $uni-color-primary);
  border-radius: 45rpx;
  line-height: 90rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}
.white {
  background: #ffffff;
  border: 1rpx solid #aaaaaa;
  color: #000;
}
</style>
