<template>
  <view class="textarea">
    <textarea
      :value="textVal"
      :style="minHeight"
      :maxlength="maxLength"
      class="textarea"
      :placeholder="placeholder"
      placeholder-class="placeholder"
      auto-height
      :class="showDisabledColor && disabled ? 'color-disabled' : ''"
      :disabled="disabled"
      @input="handChange"
    ></textarea>
    <view class="textarea-count">{{ textVal.length }} / {{ maxLength }}</view>
  </view>
</template>

<script>
export default {
  name: 'Textarea',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    maxLength: {
      type: Number,
      default: 200
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showDisabledColor: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      textVal: this.value
    }
  },
  computed: {
    minHeight() {
      let h = '100rpx'
      if (this.maxLength > 180) {
        h = '150rpx'
      }
      return `min-height: ${h}`
    }
  },
  methods: {
    handChange(e) {
      this.textVal = e.detail.value
      this.$emit('input', this.textVal)
    }
  }
}
</script>

<style lang="scss" scoped>
.textarea {
  width: 100%;
  word-break: break-all;
  text-align: left;
  height: auto;
  color: #000;
  position: relative;
  padding-bottom: 20rpx;
  .textarea-count {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 22rpx;
    color: #666;
  }

  .color-disabled {
    color: #999;
  }
}
</style>
