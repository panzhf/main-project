<template>
  <form>
    <view class="seach-box">
      <view v-if="drownFlag" class="drow-box" @click="show = true">
        <view>{{ drownList[index].label }}</view>
        <view class="iconfont icon-down-arrow"></view>
        <u-select v-model="show" mode="single-column" :list="drownList" @confirm="handleConfirm"></u-select>
      </view>
      <view class="input-box">
        <text class="iconfont icon-sousuoicon"></text>
        <input
          v-model="inputValue"
          type="text"
          class="seach-input"
          :placeholder="placeholder"
          placeholder-style="color: #aaa"
        />
      </view>
      <button formType="submit" class="seach-btn" @tap="seachFn">搜索</button>
    </view>
  </form>
</template>
<script>
export default {
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    drownFlag: {
      //控制是否显示下拉选择框
      type: Boolean,
      default: false
    },
    drownList: {
      //格式必须为 [{value:0,label:'全部'}]
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      inputValue: '',
      show: false,
      index: 0
    }
  },
  created() {
    this.value !== '' ? (this.inputValue = this.value) : ''
  },
  methods: {
    // 状态筛选的回调
    handleConfirm(e) {
      this.index = e[0].value
      this.$emit('handleSearch', this.inputValue, this.index)
    },
    seachFn() {
      this.$emit('handleSearch', this.inputValue, this.index)
    }
  }
}
</script>

<style lang="scss" scoped>
form {
  display: block;
}
button {
  background: transparent;
  border-radius: 0;
  box-sizing: content-box;
}
.drow-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx;
  background-color: #fff;
  border-radius: 35rpx;
  margin-right: 15rpx;
  .icon-down-arrow {
    font-size: 16rpx;
    padding-left: 15rpx;
  }
}
.seach-box {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .input-box {
    position: relative;
    flex: 1;
    .iconfont {
      position: absolute;
      left: 25rpx;
      top: 50%;
      transform: translateY(-50%);
      font-size: 30rpx;
      color: #999;
      z-index: 1;
    }
    .seach-input {
      padding-left: 70rpx;
      height: 78rpx;
      line-height: 78rpx;
      background-color: #fff;
      font-size: 28rpx;
      border-radius: 35rpx;
    }
  }
  .seach-btn {
    line-height: 78rpx;
    margin-left: 10rpx;
    width: 130rpx;
    text-align: center;
    font-size: 30rpx;
    font-weight: 500;
    background: rgba(255, 255, 255, 1);
    border-radius: 35rpx;
    flex-shrink: 0;
  }
}
</style>
