<template>
  <view class="people-picker fs-28">
    <u-popup v-model="showPicker" :z-index="100" mode="bottom" border-radius="30" @close="$emit('input', false)">
      <view class="title">小标详情</view>
      <scroll-view class="list" :scroll-y="true" scroll-left="120" :show-scrollbar="false">
        <view v-for="(item, index) in tableData" :key="index" class="item" :class="[ji ? '' : 'bor-no']">
          <view class="info fs-24 edit-color" @tap="handleItemClick(index)">
            {{ item.serialnumber }}
          </view>
        </view>
        <none-data v-if="!tableData.length" class="noda" :view-height="300" :msg="msg" />
      </scroll-view>
    </u-popup>
  </view>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    tableData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      msg: '暂无数据',
      dealer: {
        dealerid: 0, //本部经销商ID
        dealername: '' //本部经销商名称
      },
      showPicker: this.value,
      hasMore: true, // 还有更多数据标记
      busy: false // 防重复标记
    }
  },
  computed: {
    // 判断基偶数
    ji() {
      return this.tableData.length % 2 === 0
    }
  },
  watch: {
    value(val) {
      this.showPicker = val
    }
  },
  methods: {
    // 点击物流码项
    handleItemClick(index) {
      this.$emit('showLogisticsPopup', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  padding: 40rpx;

  color: #000000;

  font-family: PingFang SC;
  font-size: 30rpx;
  font-weight: 500;
}
.list {
  box-sizing: border-box;
  height: 650rpx;
  margin: 30rpx 0;
  padding: 0 18rpx;
  padding-right: 0;
  ::-webkit-scrollbar {
    width: 0;
    height: 0;

    color: transparent;
  }
  .item {
    display: inline-block;

    width: 50%;
    padding-bottom: 38rpx;

    text-align: center;

    border-bottom: 1rpx solid #e5e5e5;

    .name {
      width: 660rpx;
      margin-top: 30rpx;

      color: #000000;

      font-weight: bold;
    }
    .info {
      margin-top: 18rpx;

      word-wrap: break-word;

      font-size: 28rpx;
      .phone {
        margin-left: 20rpx;

        color: #000000;

        font-weight: 500;
      }
    }
  }
  .bor-no {
    &:last-child {
      border: none;
    }
  }
}
</style>
