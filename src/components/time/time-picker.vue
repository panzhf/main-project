<template>
  <view :class="['pickerWrapper', isCloudShop ? 'cloud-shop' : '']">
    <picker mode="date" :value="time[0]" :end="startLimit.end" data-index="0" @change="bindDateChange">
      <view class="picker">
        <text>{{ start }}</text>
        <text v-if="isCloudShop" class="iconfont iconriliicon"></text>
      </view>
    </picker>
    <picker mode="date" :value="end" :start="endLimit.start" data-index="1" @change="bindDateChange">
      <view class="picker">
        <text>{{ end }}</text>
        <text v-if="isCloudShop" class="iconfont iconriliicon"></text>
      </view>
    </picker>
  </view>
</template>
<script>
export default {
  props: {
    isCloudShop: {
      type: Boolean,
      default: false
    },
    time: {
      twoWay: true,
      type: Array,
      default() {
        return ['', '']
      }
    }
  },
  data() {
    return {
      startLimit: {
        end: ''
      },
      endLimit: {
        start: ''
      }
    }
  },
  computed: {
    start() {
      return this.time[0] || '开始时间'
    },
    end() {
      return this.time[1] || '结束时间'
    }
  },
  watch: {
    start() {
      this.endLimit.start = this.time[0] || ''
    },
    end() {
      this.startLimit.end = this.time[1] || ''
    }
  },
  methods: {
    bindDateChange(e) {
      this.$emit('timePickerChange', this.time, e)
    }
  }
}
</script>

<style lang="scss" scoped>
.pickerWrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 15rpx;
  height: 100%;
}
picker {
  display: block;
  flex: 1;
  height: 63rpx;
  border-radius: 32rpx;
  background-color: #f0f0f0;
  color: #666;
  font-size: 26rpx;
  padding: 0 30rpx;
  margin: 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.picker {
  position: relative;
  display: block;
  width: 100%;
  flex: 1;
}
.cloud-shop {
  picker {
    background-color: #fff;
    border: 1px solid #f0f0f0;
  }
  .iconriliicon {
    font-size: 29rpx;
    position: absolute;
    right: -58rpx;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>

