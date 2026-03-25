<template>
  <u-mask
    :show="showPopup"
    :mask-click-able="false"
    :zoom="false"
    z-index="999"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.7)' }"
  >
    <view class="wrap-popup flex flex-middle flex-center" :style="themeVars" @tap.stop="() => {}">
      <!-- 弹窗有input，加上css动画会导致input内容变形，尽量控制动画幅度 -->
      <!-- 阻止touchmove滑动导致底层元素跟着滑动 -->
      <view class="common-popup" :class="sizeClass" :style="customStyle">
        <view v-if="showTitle && title" class="header fw-bold fs-32 text-center">- {{ title }} -</view>
        <view v-else class="pb-20"></view>
        <view class="content fs-30 text-center">
          <view v-if="content" class="mb-10">{{ content }}</view>
          <slot></slot>
          <template v-if="type === 'prompt'">
            <scroll-view
              v-if="isTextarea || inputType === 'textarea'"
              :key="textareaScrollKey"
              scroll-y
              class="textarea-scroll br-10"
              show-scrollbar="false"
            >
              <textarea
                :value="changeValue"
                type="text"
                :maxlength="maxLength"
                :placeholder="placeholder"
                :cursor-spacing="50"
                :adjust-position="true"
                auto-height
                class="textarea text-left"
                @input="handleInput"
              ></textarea>
            </scroll-view>
            <view v-else class="flex flex-middle">
              <input
                :value="changeValue"
                :type="inputType === 'number' ? 'digit' : 'text'"
                :placeholder="placeholder"
                :maxlength="maxLength"
                :cursor-spacing="180"
                class="flex-1 flex flex-middle input br-10 text-left"
                @input="handleInput"
              />
              <text v-if="suffixText" class="input-suffix">{{ suffixText }}</text>
            </view>
            <view v-if="tip" class="tip mt-20 text-left">{{ tip }}</view>
          </template>
          <slot name="footer" />
        </view>
        <view v-if="!popHideButton" class="footer" :class="[type]">
          <button
            v-if="(type === 'confirm' || type === 'prompt') && cancelText !== ''"
            class="primary-btn plain size-small"
            @tap.stop="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button :disabled="confirmCountdown" class="primary-btn size-small" @tap.stop="handleConfirm">
            {{ confirmText }}{{ confirmCountdown ? `(${confirmCountdown}s)` : '' }}
          </button>
        </view>
      </view>
    </view>
  </u-mask>
</template>

<script>
/**
 * 通用弹窗，使用v-model控制显示/隐藏
 * <common-popup v-model="showPopup" type="tip" content="提示内容" />
 * <common-popup v-model="showPopup" type="confirm" content="提示内容？" @confirm="" />
 *
 * prompt输入模式，defaultValue结合sync修饰符，可以重置绑定变量
 * <common-popup v-model="showPopup" type="prompt" :default-value.sync="storeName" @confirm="" />
 */
export default {
  name: 'CommonPopup',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'tip', // tip常规提示 confirm二次确认 prompt带输入
      validator(v) {
        return ['tip', 'confirm', 'prompt'].includes(v)
      }
    },
    title: {
      type: String,
      default: '提示'
    },
    content: {
      type: String,
      default: '' // tip/confirm的提示文字
    },
    tip: {
      type: String,
      default: '' // prompt模式的提示文字
    },
    maxSize: Boolean,
    defaultValue: {
      type: String,
      default: '' // prompt模式初始显示
    },
    maxLength: {
      type: Number,
      default: 8 // prompt模式输入的最大长度
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    inputType: {
      type: String,
      default: 'input' // prompt模式输入框类型 input / textarea
    },
    isTextarea: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    popHideButton: {
      type: Boolean,
      default: false
    },
    customStyle: {
      type: String,
      default: ''
    },
    confirmDelay: {
      type: Number,
      default: 0 // 延迟秒数，0为不延迟
    },
    suffixText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showPopup: false,
      changeValue: '',
      confirmDisabled: false,
      confirmCountdown: 0,
      timer: null,
      textareaScrollKey: 0
    }
  },
  computed: {
    sizeClass() {
      return this.type === 'prompt' || this.maxSize ? 'big' : 'small'
    }
  },
  watch: {
    value(v) {
      this.showPopup = v
      if (v) {
        // 弹窗打开时，初始化输入值为 defaultValue
        this.changeValue = this.defaultValue || ''
        if (this.confirmDelay > 0) {
          this.startConfirmDelay()
        }
        if (this.isTextarea || this.inputType === 'textarea') {
          this.$nextTick(() => {
            this.textareaScrollKey += 1
          })
        }
      } else {
        // 弹窗关闭时，立即清空输入值，避免下次打开时显示旧值
        this.changeValue = ''
        this.clearConfirmDelay()
      }
    },
    defaultValue(v) {
      // 当弹窗显示时，同步更新输入值
      if (this.showPopup) {
        this.changeValue = v || ''
      }
    }
  },
  beforeDestroy() {
    this.clearConfirmDelay()
  },
  methods: {
    handleInput(e) {
      let v = e.target.value
      v = v.trim()
      this.changeValue = v.substring(0, this.maxLength)
    },
    handleClose() {
      this.$emit('input', false)
      this.changeValue = ''
      this.$emit('update:defaultValue', '')
      this.clearConfirmDelay()
    },
    handleConfirm() {
      if (this.confirmDisabled) return
      if (this.type === 'prompt') {
        this.$emit('confirm', this.changeValue)
      } else if (this.type === 'confirm') {
        this.$emit('confirm')
      } else {
        this.handleClose()
        this.$emit('close')
      }
      this.clearConfirmDelay()
    },
    handleCancel() {
      this.handleClose()
      this.$emit('cancel')
    },
    handleMove() {},
    startConfirmDelay() {
      this.clearConfirmDelay() // 先清理旧定时器，防止多次触发
      this.confirmDisabled = true
      this.confirmCountdown = this.confirmDelay
      this.timer = setInterval(() => {
        if (this.confirmCountdown > 1) {
          this.confirmCountdown--
        } else {
          this.confirmCountdown = 0
          this.confirmDisabled = false
          this.clearConfirmDelay()
        }
      }, 1000)
    },
    clearConfirmDelay() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.confirmDisabled = false
      this.confirmCountdown = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap-popup {
  // position: fixed;
  // top: 0;
  // right: 0;
  // bottom: 0;
  // left: 0;
  // z-index: 999;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  width: 100%;
  height: 100%;
  // background-color: rgba(0, 0, 0, 0.7);
}
.common-popup {
  background-color: #fff;
  border-radius: 10rpx;
  overflow: hidden;
  animation-name: scale;
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
  @include box;
  &.big {
    width: 600rpx;
  }
  &.small {
    width: 540rpx;
  }
  .header {
    border-radius: 10px 10px 0 0;
    background: linear-gradient(0deg, #ffffff 0%, #fff5f1 65%);
    @include lh(100rpx);
  }
  .content {
    padding: 15rpx 46rpx 59rpx;
    line-height: 40rpx;
    .input {
      padding: 12rpx 20rpx;
      border: 1px solid $uni-border-color-tag;
      height: 56rpx;
    }
    .input-suffix {
      margin-left: 12rpx;
      font-size: 28rpx;
      color: #333;
    }
    .textarea-scroll {
      max-height: 360rpx;
      border: 1px solid $uni-border-color-tag;
    }
    .textarea {
      min-height: 300rpx;
      width: 100%;
      padding: 25rpx 22rpx;
      box-sizing: border-box;
    }
    .tip {
      color: $uni-border-color-tag;
      font-size: 24rpx;
      line-height: 30rpx;
    }
  }
  .footer {
    margin: 0 60rpx 50rpx;
    &:not(.check) {
      .primary-btn + .primary-btn {
        margin-left: 40rpx;
      }
    }
    &.confirm,
    &.prompt {
      display: flex;
      justify-content: space-between;
      .primary-btn {
        flex: 1;
      }
    }
  }
}
@keyframes scale {
  0% {
    transform: scale(0.96);
  }
  50% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}
</style>
