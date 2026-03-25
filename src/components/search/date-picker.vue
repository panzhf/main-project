<template>
  <view>
    <u-popup v-model="popupState" mode="top" border-radius="15" @close="bindClose">
      <view class="filter-box popup-filter" style="position: static">
        <view class="time-pick mt-20">
          <view class="time-item" hover-class="time-itme-action" @tap.stop="handlePickTime(0)">今日</view>
          <view class="time-item" hover-class="time-itme-action" @tap.stop="handlePickTime(-1)">昨日</view>
          <view class="time-item" hover-class="time-itme-action" @tap.stop="handlePickTime(-7)">近7天</view>
          <view class="time-item" hover-class="time-itme-action" @tap.stop="handlePickTime(-30)">近30天</view>
        </view>
        <view class="time-contet mt-20" @tap="timeVisible1 = true">
          <text v-if="filter.starttime">
            {{ filter.starttime }}
            <text class="ml-20 mr-20">-</text>
            {{ filter.endtime }}
          </text>
          <text v-else>请选择时间</text>
          <text
            v-if="filter.starttime"
            class="icon iconfont icon-close-circle clear-time"
            @tap.stop="hanldClearTime"
          ></text>
        </view>
      </view>
    </u-popup>
    <u-picker
      v-model="pickerShow"
      mode="selector"
      :range="columns"
      range-key="label"
      :default-selector="[0]"
      @confirm="handleConfirm"
    ></u-picker>
    <u-picker
      v-model="timeVisible1"
      title="开始时间"
      mode="time"
      :mask-close-able="false"
      @cancel="timePickerClose"
      @confirm="
        e => {
          timeConfirm(e, 'start')
        }
      "
    ></u-picker>
    <u-picker
      v-model="timeVisible2"
      title="结束时间"
      :mask-close-able="false"
      mode="time"
      @cancel="timePickerClose"
      @confirm="
        e => {
          timeConfirm(e, 'end')
        }
      "
    ></u-picker>
  </view>
</template>

<script>
import { getdayScope } from '@/utils/index.js'
export default {
  name: 'DatePicker',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入日期' // placeholder 默认文案
    },
    maxDays: {
      type: Number,
      default: 0 // 最大筛选天数，默认为0表示不限制
    }
  },
  data() {
    return {
      timeVisible1: false,
      timeVisible2: false,
      // popupState: false,
      starttime: Number(new Date()),
      endtime: Number(new Date()),
      filter: {
        starttime: '', //开始时间
        endtime: '' //结束时间
      }
    }
  },
  computed: {
    popupState: {
      get() {
        return this.value
      },
      set(v) {
        this.$emit('input', v)
      }
    }
  },
  // watch: {
  //   value(v) {
  //     this.popupState = v
  //   }
  // },
  methods: {
    handlePickTime(val) {
      //今天特殊处理
      if (val === 0 || val === -1) {
        this.filter.starttime = getdayScope(val)
        this.filter.endtime = getdayScope(val)
      } else {
        this.filter.starttime = getdayScope(val)
        this.filter.endtime = getdayScope(0)
      }
      this.popupState = false
      this.changeData()
    },
    hanldClearTime() {
      this.filter = {
        endtime: '',
        starttime: ''
      }
      this.popupState = false
      this.$emit('confirm', this.filter)
    },
    bindClose() {
      // this.$emit('input', false)
      this.popupState = false
    },
    changeData() {
      // this.$emit('input', false)
      if (!(this.filter.starttime || this.filter.endtime)) return
      this.$emit('confirm', this.filter)
    },
    /** 取消按钮 */
    timePickerClose() {
      this.timeVisible1 = false
      this.timeVisible2 = false
      this.resetTime()
      this.changeData()
    },
    resetTime() {
      this.filter.starttime = ''
      this.filter.endtime = ''
    },
    timeConfirm(e, state) {
      if (state === 'start') {
        this.starttime = e.timestamp
        this.timeVisible1 = false
        this.filter.starttime = `${e.year}-${e.month}-${e.day}`
        this.timeVisible2 = true
      } else {
        this.endtime = e.timestamp
        if (e.timestamp <= this.starttime) {
          setTimeout(() => {
            this.timeVisible2 = true
          }, 1000)
          return this.$msg('结束时间不能小于开始时间')
        }
        // 检查最大天数限制
        if (this.maxDays && this.maxDays > 30) {
          const maxTimestamp = this.maxDays * 24 * 60 * 60 // 天数转秒
          if (e.timestamp - this.starttime > maxTimestamp) {
            setTimeout(() => {
              this.timeVisible2 = true
            }, 1000)
            return this.$msg(`时间区间最大为${this.maxDays}天`)
          }
        }
        this.filter.endtime = `${e.year}-${e.month}-${e.day}`
        this.timeVisible2 = false
        this.popupState = false
        this.changeData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.popup-filter {
  padding: 40rpx 30rpx;
  .time-pick {
    display: flex;
    justify-content: space-between;
    .time-item {
      width: 130rpx;
      height: 60rpx;
      background: #f5f5f5;
      border-radius: 15rpx;
      text-align: center;
      line-height: 60rpx;
    }
    .time-itme-action {
      background: #fdf2e1;
      color: #ff9e01;
    }
  }
  .time-contet {
    width: 100%;
    background: #f5f5f5;
    border-radius: 15rpx;
    text-align: center;
    line-height: 70rpx;
    color: #aaaaaa;
  }
}
.filter-box {
  top: 0;
  position: fixed;
  background-color: #fff;
  width: 100%;
  padding: 0 30rpx 30rpx;
  left: 0;
  .block {
    background: #f5f5f5;
    border-radius: 15rpx;
    font-size: 28rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80rpx;
    .icon {
      font-size: 14rpx;
      margin-left: 10rpx;
    }
  }
  .row {
    display: flex;
    justify-content: space-between;
    .object {
      width: 240rpx;
    }
    .time {
      width: 430rpx;
    }
    .name {
      width: 210rpx;
    }
    .search {
      width: 460rpx;
      display: flex;
      ::v-deep .search-input {
        margin: 0 !important;
      }
      .search-input {
        flex: 1;
      }
    }
    &:nth-child(n + 1) {
      margin-top: 20rpx;
    }
  }
  .clear-time {
    margin-right: 10rpx;
    font-size: 30rpx;
    padding: 20rpx;
  }
}
</style>

