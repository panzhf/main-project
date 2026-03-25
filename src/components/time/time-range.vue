<template>
  <view :style="themeVars">
    <block v-if="isCloudShop">
      <view class="timeWrapper cloud-shop" catchtouchmove="return false">
        <view class="timeConstant">
          <view :class="['timeConstantItem', seachTimeIndex == 3 ? 'on' : '']" @tap="changeTime(3)">今日</view>
          <view :class="['timeConstantItem', seachTimeIndex == 4 ? 'on' : '']" @tap="changeTime(4)">本月</view>
          <view :class="['timeConstantItem', seachTimeIndex == 1 ? 'on' : '']" @tap="changeTime(1)">全部</view>
        </view>
        <view :class="['timeCustom', seachTimeIndex == 2 ? 'on' : '']" @tap="changeTime(2)">
          <text>自定义时间</text>
          <i :class="showCustomPicker ? '' : 'rotate'"></i>
        </view>
      </view>
      <!-- set custom time -->
      <view :class="['setCustomTimeWrapper', showCustomPicker ? 'on' : '', 'cloud-shop']" catchtouchmove="return false">
        <view class="setCustomTime">
          <timePicker
            :time.sync="pickerTime"
            :is-cloud-shop.sync="isCloudShop2"
            @timePickerChange="timePickerChange"
          ></timePicker>
        </view>
      </view>
    </block>
    <block v-else>
      <view class="timeWrapper" catchtouchmove="return false">
        <view class="timeConstant">
          <button
            v-if="showLastThirty"
            :class="['timeConstantItem', seachTimeIndex == 0 ? 'on' : '']"
            @tap="changeTime(0)"
          >
            最近30天
          </button>
          <button :class="['timeConstantItem', seachTimeIndex == 1 ? 'on' : '']" @tap="changeTime(1)">全部</button>
        </view>
        <view :class="['timeCustom', seachTimeIndex == 2 ? 'on' : '']" @tap="changeTime(2)">
          <text>自定义时间</text>
          <i :class="showCustomPicker ? '' : 'rotate'"></i>
        </view>
      </view>
      <!-- set custom time -->
      <view :class="['setCustomTimeWrapper', showCustomPicker ? 'on' : '']" catchtouchmove="return false">
        <view class="setCustomTime">
          <timePicker :time.sync="pickerTime"></timePicker>
        </view>
      </view>
    </block>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import timePicker from './time-picker'
export default {
  components: {
    timePicker
  },
  props: {
    isCloudShop: {
      type: Boolean,
      default: false
    },
    showLastThirty: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isCloudShop2: true,
      seachTimeIndex: 0,
      changeTimeStamp: 0,
      showCustomPicker: false,
      pickerTime: [],
      pickerTime2: []
    }
  },
  created() {
    if (!this.showLastThirty) {
      this.seachTimeIndex = 1
    }
    if (this.isCloudShop) {
      this.seachTimeIndex = 4
      this.GetTimeRange2()
    } else {
      this.GetTimeRange()
    }
  },
  methods: {
    changeTime(time) {
      // 防抖
      let newStamp = +new Date()
      if (newStamp - this.changeTimeStamp < 300) return
      this.changeTimeStamp = newStamp

      this.seachTimeIndex = time >> 0
      // 返回顶部
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0
        })
      }
      // 控制自定义弹窗
      this.showCustomPicker = time === 2 ? !this.showCustomPicker : 0
      if (time !== 2) {
        if (this.isCloudShop) {
          this.GetTimeRange2()
        } else {
          this.GetTimeRange()
        }
      }
    },
    // 获取对应搜索时间
    GetTimeRange() {
      let startTime = ''
      let endTime = ''
      let nowTime = ''
      switch (this.seachTimeIndex) {
        case 0:
          nowTime = dayjs(new Date())
          endTime = nowTime.format('YYYY-MM-DD')
          startTime = nowTime.subtract(30, 'days').format('YYYY-MM-DD')
          break
        case 2:
          startTime = this.pickerTime[0] || ''
          endTime = this.pickerTime[1] || ''
          break
      }
      this.pickerTime = [startTime, endTime]
      this.$emit('timeRange', this.pickerTime)
    },

    GetTimeRange2() {
      let startTime = ''
      let endTime = ''
      let startTime2 = ''
      let endTime2 = ''
      switch (this.seachTimeIndex) {
        case 2:
          startTime = (this.pickerTime[0] && dayjs(this.pickerTime[0]).format('YYYY-MM-DD')) || ''
          endTime = (this.pickerTime[1] && dayjs(this.pickerTime[1]).format('YYYY-MM-DD')) || ''
          startTime2 = (this.pickerTime[0] && dayjs(this.pickerTime[0]).format('YYYY-MM-DD HH:mm:ss')) || ''
          endTime2 = (this.pickerTime[1] && dayjs(this.pickerTime[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')) || ''
          break
        case 3:
          endTime2 = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss') || ''
          startTime2 = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss') || ''
          break
        case 4:
          endTime2 = dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss') || ''
          startTime2 = dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss') || ''
          break
      }
      this.pickerTime = [startTime, endTime]
      this.pickerTime2 = [startTime2, endTime2]
      this.$emit('timeRange', this.pickerTime2)
    },
    // 日期选择器的回调
    timePickerChange(e, value) {
      this.pickerTime = e
      let index = value.target.dataset.index >> 0
      this.pickerTime[index] = value.detail.value || ''
      if (this.isCloudShop) {
        this.GetTimeRange2()
      } else {
        this.GetTimeRange()
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.timeWrapper {
  height: 93rpx;
  display: flex;
}
.timeConstant {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #fff;
  position: relative;
  z-index: 0;
  &::after {
    content: '';
    position: absolute;
    display: block;
    height: 0;
    width: 0;
    right: 0;
    top: 0;
    transform: translateX(100%);
    border-top: 93rpx solid #fff;
    border-right: 30rpx solid transparent;
  }
}
.timeConstantItem {
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 42rpx;
  border-radius: 30rpx;
  border: 1px solid #f0f0f0;
  background-color: #f0f0f0;
  font-size: 26rpx;
  color: #333;
  margin-left: 30rpx;
  &.on {
    background-color: #fff;
    border-color: var(--theme-color, $uni-color-primary);
    color: var(--theme-color, $uni-color-primary);
  }
}
.timeCustom {
  margin: 0 30rpx 0 50rpx;
  color: #666;
  font-size: 26rpx;
  padding-right: 35rpx;
  position: relative;
  z-index: 0;
  text {
    line-height: 93rpx;
  }
  i {
    content: '';
    position: absolute;
    right: 10%;
    top: 50%;
    display: block;
    width: 11rpx;
    height: 11rpx;
    border-right: 1px solid #999;
    border-bottom: 1px solid #999;
    transform: translateY(-50%) rotate(45deg);
    transition: all 0.5s;
  }
  .rotate {
    transform: translateY(-50%) rotate(226deg);
  }
  &.on {
    color: var(--theme-color, $uni-color-primary);
  }
}
.setCustomTimeMask {
  background-color: rgba(0, 0, 0, 0.8);
  position: absolute;
  z-index: 0;
  left: 0;
  top: 93rpx;
  bottom: -5rpx;
  right: 0;
}
.setCustomTimeWrapper {
  display: none;
  opacity: 0;
  &.on {
    display: block;
    animation: showCustomTimer 0.3s forwards;
  }
}
@keyframes showCustomTimer {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.setCustomTime {
  background-color: #f9f9f9;
  position: relative;
  z-index: 2;
  margin-top: 30rpx;
}
.timePicker {
  input {
    width: 200rpx;
    background-color: #000;
  }
}
.cloud-shop {
  border-top: 1px solid #f7f7f7;
  border-bottom: 4rpx solid #f7f7f7;
  .timeConstantItem {
    flex: 1;
    position: relative;
    height: 60rpx;
    line-height: 60rpx;
    text-align: center;
    border-radius: 0;
    border: none;
    border-right: 1px solid #f7f7f7;
    background-color: #fff;
    font-size: 26rpx;
    color: #333;
    margin-left: 0;
    padding: 0;
    &.on {
      background-color: #fff;
      color: var(--theme-color, $uni-color-primary);
      &::after {
        background: var(--theme-color, $uni-color-primary);
      }
    }
    &::after {
      position: absolute;
      bottom: -20rpx;
      left: 0;
      right: 0;
      margin: 0 auto;
      display: block;
      width: 70%;
      height: 6rpx;
      content: '';
      border-radius: 4rpx 4rpx 0 0;
    }
  }
  .timeCustom {
    margin: 0;
    color: #666;
    font-size: 26rpx;
    padding: 0 45rpx;
    position: relative;
    background-color: #fff;
    z-index: 0;
    text {
      line-height: 93rpx;
    }
    &.on {
      color: var(--theme-color, $uni-color-primary);
      &::before {
        position: absolute;
        bottom: -2rpx;
        left: 0;
        right: 0;
        margin: 0 auto;
        display: block;
        width: 70%;
        height: 6rpx;
        content: '';
        border-radius: 4rpx 4rpx 0 0;
        background-color: var(--theme-color, $uni-color-primary);
      }
    }
    &::after {
      right: 20rpx;
    }
  }
  .setCustomTime {
    height: 120rpx;
    background-color: #fff;
    position: relative;
    z-index: 2;
    margin: 0 !important;
  }
}
</style>
