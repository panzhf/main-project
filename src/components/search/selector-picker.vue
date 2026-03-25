<template>
  <view class="select-box">
    <picker :value="index" :range="options" :range-key="rangeKey" @change="handleChange">
      {{ currentValue || placeholder }}
      <!-- <text class="icon iconfont icon-arrow-down fs-20 c-2a ml-10"></text> -->
      <text class="picker-icon icon iconfont icon-down-arrow fs-20 c-0 pl-20"></text>
    </picker>
  </view>
</template>

<script>
/*
<!-- 纯数组形式 -->
<selector-picker :options="options" v-model="currentValue"></selector-picker>
options: ['全部','小树', '爱好', '天气']
<!-- 数组对象形式 -->
<selector-picker :options="optionsLabel" v-model="currentValue" rangeKey="label"></selector-picker>
optionsLabel: [
        {
          val: 'all',
          label: '全部'
        },
        {
          val: 'sh',
          label: '上海'
        },
        {
          val: 'bj',
          label: '北京'
        },
        {
          val: 'sz',
          label: '深圳'
        }
      ]
*/
export default {
  name: 'SelectorPicker',
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      default() {
        return []
      }
    },
    rangeKey: {
      type: String,
      default: ''
    },
    rangeValue: {
      type: String,
      default: 'val'
    },
    placeholder: {
      type: String,
      default: '请选择'
    }
  },
  data() {
    return {
      index: 0
    }
  },
  computed: {
    currentValue() {
      if (this.rangeKey) {
        return this.options[this.index][this.rangeKey]
      } else {
        return this.options[this.index]
      }
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.index = this.rangeKey
          ? this.options.findIndex(item => item[this.rangeValue] === newVal)
          : this.options.findIndex(item => item === newVal)
      },
      immediate: true
    }
  },
  methods: {
    handleChange(e) {
      this.index = e.target.value
      let currentValue = this.rangeKey ? this.options[this.index][this.rangeValue] : this.options[this.index]
      this.$emit('input', currentValue)
      this.$emit('change', currentValue)
    }
  }
}
</script>


<style lang="scss" scoped>
.select-box {
  text-align: center;
  background: #fff;
  padding: 0 30rpx;
  height: 76rpx;
  border-radius: 35rpx;
  line-height: 76rpx;
}
</style>

