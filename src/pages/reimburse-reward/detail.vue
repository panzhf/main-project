<template>
  <view class="writeoff-result">
    <info-cell :is-link="false">
      <view slot="left">奖品</view>
      <view slot="right">
        <view class="flex flex-middle">
          <view class="flex-1">
            <text v-if="rewardInfo.prizetype === 14">
              {{ rewardInfo.rewardcontent }}
            </text>
            <text v-else>
              {{ rewardInfo.prizetype !== 1 ? '￥' : '' }}{{ rewardInfo.amount
              }}{{ rewardInfo.prizetype | rewardTypwFilter }}
            </text>
          </view>
          <image
            class="reward-pic"
            :src="
              rewardInfo.prizetype === 1
                ? pointAvatar
                : rewardInfo.prizetype === 14
                ? rewardInfo.voucherimg
                : moneyAvatar
            "
          />
        </view>
      </view>
    </info-cell>
    <info-cell v-if="rewardInfo.prizetype === 14" :is-link="false">
      <view slot="left">数量</view>
      <view slot="right">{{ rewardInfo.amount }}</view>
    </info-cell>
    <info-cell :is-link="false">
      <view slot="left">来源</view>
      <view slot="right">{{ rewardInfo.sourcetype === 1 ? '核销奖励' : '-' }}</view>
    </info-cell>
    <info-cell :is-link="false">
      <view slot="left">核销内容</view>
      <view slot="right">{{ rewardInfo.prizetype === 14 ? '卡券' : rewardInfo.rewardcontent }}</view>
    </info-cell>
    <info-cell :is-link="false">
      <view slot="left">{{ type === 14 ? '码ID' : '券码编号' }}</view>
      <view slot="right">{{ type === 14 ? rewardInfo.code : rewardInfo.voucherno }}</view>
    </info-cell>
    <info-cell :is-link="false">
      <view slot="left">获得时间</view>
      <view slot="right">{{ rewardInfo.writeofftime }}</view>
    </info-cell>
    <info-cell :is-link="false">
      <view slot="left">状态</view>
      <view slot="right">
        <status-text :item="rewardInfo" :tab-id="type" :page="2"></status-text>
        <view class="fs-22 c-9">{{ rewardInfo.message }}</view>
      </view>
    </info-cell>
  </view>
</template>

<script>
import { rewardTypwFilter } from '@/filters'
import StatusText from './comps/status-text.vue'
import { staticURL } from '@/config'
export default {
  components: { StatusText },
  filters: { rewardTypwFilter },
  data() {
    return {
      rewardInfo: {},
      moneyAvatar: staticURL() + 'reward/money.png',
      pointAvatar: staticURL() + 'reward/point.png',
      type: 0
    }
  },
  computed: {},
  onLoad(options) {
    this.rewardInfo = JSON.parse(decodeURIComponent(options.info))

    this.type = Number(options.type)
  },
  onShow() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.writeoff-result {
  background: #fff;
  padding: 30rpx 30rpx 0 30rpx;
}
.reward-pic {
  width: 80rpx;
  height: 80rpx;
  margin-left: 20rpx;
}
</style>
