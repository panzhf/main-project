<template>
  <view class="record">
    <view class="record-box">
      <view v-for="(item, index) in list" :key="index" class="record-content">
        <view class="flex flex-column">
          <template v-for="(field, fdx) in fieldHeads">
            <view
              v-if="item.showMore || fdx < 4"
              :key="field.prop"
              class="record-item flex"
              :class="{ 'flex-middle': fdx === 3 }"
            >
              <view class="record-key">{{ field.label }}</view>
              <view class="split">：</view>
              <view v-if="field.prop === 'prizedesc'" class="record-val">
                {{ showPrize(item) }}
              </view>
              <view v-else-if="field.prop === 'relationcode'" class="record-val">
                {{ item.relationcode }}（{{ item.relationserialnumber }}）
              </view>
              <view v-else class="record-val">
                {{ item[field.prop] || '-' }}
              </view>
              <view
                v-if="(item.showMore && fdx === 5) || (!item.showMore && fdx === 3)"
                class="iconfont icon-more fs-20"
                :class="item.showMore ? 'icon-more-hidden' : 'icon-more-show'"
                @tap="changeShowMore(index)"
              ></view>
            </view>
          </template>
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
    }
  },

  data() {
    return {}
  },

  computed: {
    fieldHeads() {
      return [
        { prop: 'opentime', label: '开箱时间' },
        { prop: 'productname', label: '商品名称' },
        { prop: 'relationcode', label: '箱码' },
        { prop: 'mdsalername', label: '扫码人' },
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
.record-box {
  border-radius: 20rpx;
  .record-content {
    border-radius: 10rpx;
    position: relative;
    font-size: 28rpx;
    font-weight: 500;
    background-color: #fff;
    padding: 30rpx 10rpx 30rpx 30rpx;
    & + .record-content {
      margin-top: 20rpx;
    }

    .icon-more {
      color: #666;
      padding: 20rpx;
    }
    .icon-more-hidden {
      transform: rotate(-90deg);
    }
    .icon-more-show {
      transform: rotate(90deg);
    }
    .record-item {
      & + .record-item {
        margin-top: 10rpx;
      }
      .record-key {
        width: 120rpx;
        color: #666;
        text-align: justify;
        text-align-last: justify;
      }
      .split {
        color: #666;
      }
      .record-val {
        margin-left: 10rpx;
        flex: 1;
        color: #000;
      }
    }
  }
}
</style>
