<template>
  <view class="flex flex-middle flex-1">
    <view class="search-input flex flex-middle flex-1" :style="customStyle">
      <input
        :value="val"
        class="search-value flex-1"
        placeholder-class="placeholder"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :focus="autoFocus"
        @blur="handleBlur"
        @input="handleInput"
        @confirm="handleSearch"
      />
      <view
        v-show="val"
        class="icon iconfont icon-close-circle fs-30 c-9 pt-30 pb-30 pl-30 pr-30"
        @tap="handleClearVal"
      />
    </view>
    <view v-if="showSearchBtn" class="search-btn" :style="btnStyle" @tap="handleSearch">搜索</view>
  </view>
</template>

<script>
/*
父页面的调用：
<search-input v-model="keyValue" :placeholder="searchPlacehoder" @search="handleSearch"></search-input>
*/
export default {
  name: 'SearchInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入关键字'
    },
    maxLength: {
      type: Number,
      default: 100
    },
    showSearchBtn: {
      type: Boolean,
      default: true
    },
    customStyle: {
      type: String,
      default: ''
    },
    btnStyle: {
      type: String,
      default: ''
    },
    useBlur: Boolean // 失焦触发搜索，默认false
  },
  data() {
    return {
      val: this.value,
      oldValue: '',
      autoFocus: false
    }
  },
  methods: {
    handleClearVal() {
      this.val = ''
      this.searchCallback()
      this.$emit('clearKeyword')
    },
    handleInput(e) {
      this.autoFocus = true
      if (this.useBlur) return
      const v = e.detail.value || ''
      const newV = v.trim()
      this.val = newV
      this.$emit('input', newV)
      // 输入框显示
      return newV
    },
    handleBlur(e) {
      this.autoFocus = false
      if (!this.useBlur) return
      const v = e.detail.value || ''
      const newV = v.trim()
      this.val = newV
      if (this.oldValue === newV) return
      setTimeout(() => {
        this.searchCallback(true)
      }, 50)
    },
    handleSearch() {
      // this.$emit('search')
      setTimeout(() => {
        this.searchCallback(true)
      }, 80)
    },
    searchCallback(emitSearch = false) {
      this.oldValue = this.val
      this.$emit('input', this.val)
      emitSearch && this.$emit('search')
    },
    handleScan() {
      this.$emit('scan')
    },
    clearAndFocus() {
      this.val = ''
      setTimeout(() => {
        this.autoFocus = true
      }, 100)
    }
  }
}
</script>

<style lang="scss" scoped>
.search-input {
  background: #fff;
  padding: 0 0 0 32rpx;
  height: 76rpx;
  text-align: left;
  border-radius: 35rpx;
  line-height: 76rpx;
}
.search {
  &-value {
    flex: 1;
    display: block;
    line-height: 76rpx;
    height: 76rpx;
  }
  .icon-close-circle {
    padding: 20rpx;
  }
}
.search-btn {
  width: 120rpx;
  height: 76rpx;
  margin-left: 20rpx;
  text-align: center;
  line-height: 76rpx;
  background: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 35rpx;
}
</style>

