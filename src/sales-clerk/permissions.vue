<template>
  <view class="page-authy pb-40" :style="themeVars">
    <view
      v-for="(wrapItem, wrapIndex) in subperMissions"
      :key="wrapIndex"
      class="list bg-f pl-30 mb-20"
      :class="wrapItem.state == 3 ? 'dp-none-i' : ''"
    >
      <view class="head fs-30 fw-bold c-0" :class="wrapIndex ? 'mt-20' : ''">{{ wrapItem.name }}</view>
      <view class="tips fs-24 mt-20">{{ wrapItem.remark }}</view>
      <view v-for="(item, index) in wrapItem.sublist" :key="item.number">
        <info-cell
          :is-show-line="wrapItem.sublist.length !== index + 1"
          :class="wrapItem.state == 3 ? 'dp-none-i' : ''"
          :is-link="false"
        >
          <view slot="left">
            <view class="flex flex-middle">
              <text class="c-0 fs-28">{{ item.name }}</text>
              <view v-if="item.appauth === 2" class="tag fs-22">云店</view>
            </view>
            <view v-if="item.remark" class="tips fs-24 mt-10">{{ item.remark }}</view>
          </view>
          <view slot="right">
            <u-switch
              v-model="item.show"
              size="40"
              active-color="#58BE6B"
              @change="
                e => {
                  handleChange(item, e)
                }
              "
            ></u-switch>
          </view>
        </info-cell>
        <!-- 先预留下级的下级菜单 -->
        <!-- <info-cell
          v-for="child in item.sublist"
          :key="child.number"
          :class="child.state == 3 ? 'dp-none-i' : ''"
          :is-link="false"
          :is-input="true"
          :is-middle="true"
          class="rows"
        >
          <view slot="left">
            {{ child.name }}
            <text v-if="child.remark" class="fs-26 c-6 ml-10">({{ child.remark }})</text>
          </view>
          <view slot="right">
            <u-switch
              v-model="child.show"
              size="40"
              style="height: 100rpx"
              active-color="#58BE6B"
              @change="
                e => {
                  handleChildChange(item, e)
                }
              "
            ></u-switch>
          </view>
        </info-cell> -->
      </view>
    </view>
    <view style="height: 200rpx"></view>
    <button class="primary-btn round fixed-bottom" hover-class="button-action" @tap="handleBack">选好了</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      subperMissions: []
    }
  },
  onLoad() {
    this.subperMissions = JSON.parse(uni.getStorageSync('subperMissions'))
  },
  methods: {
    handleChange(val, e) {
      if (!e) {
        val.sublist.forEach(item => {
          item.show = false
        })
      }
    },
    handleChildChange(val, e) {
      if (e) val.show = true
    },
    handleBack() {
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2]
      prevPage.$vm.subperMissions = this.subperMissions
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-authy {
  padding: 20rpx;
  .list {
    border-radius: 10rpx;
    padding: 20rpx 20rpx;
  }
  .head {
    position: relative;
    &::after {
      content: '';
      position: absolute;
      background: var(--theme-color, $uni-color-primary);
      width: 60rpx;
      height: 8rpx;
      opacity: 0.5;
      border-radius: 4rpx;
      left: 0rpx;
      top: 30rpx;
    }
  }
}

.audit-bottom {
  position: fixed;
  left: 40rpx;
  right: 40rpx;
  bottom: 30rpx;
  .out-word {
    line-height: 100rpx;
    text-align: center;
  }
}
.tips {
  color: #aaa;
}

.tag {
  border: 1rpx solid var(--theme-color, $uni-color-primary);
  border-radius: 13rpx 13rpx 13rpx 0rpx;
  font-weight: 500;
  color: var(--theme-color, $uni-color-primary);
  padding: 4rpx 8rpx;
  line-height: 1;
  margin-left: 20rpx;
}
.rows {
  background: #f8f8f8;
  display: block;
  padding: 0 30rpx;
  width: 634rpx;
}
::v-deep {
  .cell-line {
    padding: 26rpx 0 20rpx 0 !important;
  }
}
</style>
