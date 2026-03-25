<template>
  <view class="record">
    <view class="record-box">
      <view v-for="(item, index) in list" :key="index" class="record-content">
        <view class="flex flex-middle">
          <view class="flex-1">
            <template v-for="(field, fdx) in fieldHeads">
              <view v-if="type === 1 || item.showMore || fdx < 4" :key="field.prop" class="record-item">
                <view class="record-key">{{ field.label }}</view>
                <view class="split"></view>
                <view v-if="field.prop === 'prizedesc'" class="record-val">
                  {{ showPrize(item) }}
                </view>
                <view v-else-if="field.prop === 'code'" class="record-val">
                  {{ item.code }}（{{ item.serialnumber }}）
                </view>
                <view v-else class="record-val">
                  {{ item[field.prop] }}
                </view>
              </view>
            </template>
          </view>
          <text
            v-if="type === 0"
            class="icon iconfont icon-more fs-20 c-3"
            :class="item.showMore ? 'icon-more-hidden' : 'icon-more-show'"
            @tap="changeShowMore(index)"
          ></text>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  mixins: [],
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    },
    type: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {}
  },

  computed: {
    itemTitle() {
      const o = {
        0: '开瓶时间',
        1: '领奖时间'
      }
      return o[this.type]
    },
    nicknameLabel() {
      const o = {
        0: '扫码人',
        1: '领奖人'
      }
      return o[this.type]
    },
    fieldHeads() {
      return [
        { prop: 'opentime', label: this.itemTitle },
        { prop: 'productname', label: '商品名称' },
        { prop: 'sybatchno', label: '生产批次' },
        { prop: 'code', label: '瓶码' },
        { prop: 'nickname', label: this.nicknameLabel },
        { prop: 'awardstatusdesc', label: '中奖状态' },
        {
          prop: 'prizedesc',
          label: '奖项内容'
        }
      ]
    }
  },
  methods: {
    showPrize(item) {
      let prizes = item.prizedesc || []
      return prizes.map(item => item.name).join('，') || '-'
    },
    changeShowMore(index) {
      this.$emit('showMore', index)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/tag.scss';
// .highlight {
//   color: #ff5e33;
// }
.record-box {
  border-radius: 20rpx;
  .record-content {
    border-radius: 10rpx;
    position: relative;
    margin-bottom: 20rpx;
    margin-top: 20rpx;
    font-size: 28rpx;
    font-weight: 500;
    background-color: #fff;
    padding: 30rpx;

    .icon-more {
      position: absolute;
      right: 30rpx;
      bottom: 50rpx;
      color: #666666;
      padding: 40rpx;
      margin: -40rpx;
    }
    .icon-more-hidden {
      transform: rotate(-90deg);
    }
    .icon-more-show {
      transform: rotate(90deg);
    }
    .record-item {
      display: flex;
      margin-bottom: 10rpx;
      padding-right: 40rpx;
      .record-key {
        width: 120rpx;
        color: #666666;
        text-align: justify;
        text-align-last: justify;
      }
      .split {
        color: #666666;
        width: 20rpx;
      }
      .record-val {
        margin-left: 10rpx;
        flex: 7;
        color: #000000;
      }
    }
  }
  .record-content:first-child {
    margin-top: 0rpx;
  }
}
</style>
