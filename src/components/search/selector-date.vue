<template>
  <view class="select-box">
    <view class="picker-box" @tap="show = true">
      <view class="picker">
        <text :class="date ? 'c-0' : 'c-9'">{{ date || timeStr }}</text>
      </view>
      <view
        v-if="date"
        class="picker-icon icon iconfont icon-close-circle fs-30 c-9 pl-30 pr-30"
        @tap.stop="clearDate"
      ></view>
      <view v-else class="picker-icon icon iconfont icon-down-arrow fs-20 c-0 pl-30 pr-30"></view>
    </view>
    <date-picker ref="datePicker" v-model="show" class="flex-1" @confirm="handleTime"></date-picker>
  </view>
</template>



<script>
import DatePicker from '@/components/search/date-picker'
import dayjs from 'dayjs'
export default {
  name: 'SearchDate',
  components: {
    DatePicker
  },
  props: {
    timeStr: {
      type: String,
      default: '核销时间'
    }
  },
  data() {
    return {
      date: '',
      show: false
    }
  },
  watch: {
    value(val) {
      this.val = val
    },
    show(val) {
      if (val && !this.date) {
        this.$refs.datePicker.filter = {
          starttime: '',
          endtime: ''
        }
      }
    }
  },

  methods: {
    // 时间选择器的回调
    handleTime(e) {
      let dateString = ''
      if (e.starttime && e.endtime) {
        this.date = e.starttime + '-' + e.endtime
        // 开始时间
        let starttime = dayjs(e.starttime).format('YYYY-MM-DD HH:mm:ss')
        // 结束时间
        let endtime = dayjs(e.endtime).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        dateString = `${starttime},${endtime}`
      } else {
        this.date = ''
      }

      this.$emit('input', dateString)
      this.$emit('change', dateString)
    },
    clearDate() {
      this.date = ''
      this.$emit('input', '')
      this.$emit('change', '')
    }
  }
}
</script>
<style lang="scss" scoped>
.select-box {
  text-align: center;
  background: #fff;
  padding: 0 0 0 32rpx;
  height: 76rpx;
  border-radius: 35rpx;
  line-height: 76rpx;
}
.picker-box {
  position: relative;
  .picker {
    padding-right: 30rpx;
    text-align: left;
  }
  .picker-icon {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>

