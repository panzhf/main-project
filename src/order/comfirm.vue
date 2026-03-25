<template>
  <view class="page-comfirm" :style="themeVars">
    <view class="order-ralation flex flex-between" @tap="handleChooseRelation">
      <view v-if="dealerInfo.dealerid !== -1" class="flex-1">
        所属上级：
        <text class="mr-30">{{ dealerInfo.dealername }}</text>
        <text>{{ dealerInfo.mobile }}</text>
      </view>
      <view v-else class="flex-1">请选择所属上级</view>
      <text class="iconfont icon-arrow-right fs-22"></text>
    </view>
    <view class="flex flex-between flex-middle common-wrap order-address" @tap="handlechooseAddress">
      <view v-if="choosedAddress.id !== -1" class="flex-1 fs-28 fw-700">
        <view>
          <text class="iconfont icon-dizhi fs-24 c-3 mr-10"></text>
          {{ choosedAddress.consignee }}
          <text class="ml-30">{{ choosedAddress.mobile }}</text>
        </view>
        <view class="fs-24 c-6 mt-10">
          {{ address }}
        </view>
      </view>
      <view v-else class="flex-1 fs-28 fw-700">
        <text class="iconfont icon-dizhi fs-24 c-3 mr-10"></text>
        请选择收货地址
      </view>
      <text class="iconfont icon-arrow-right fs-22"></text>
    </view>
    <view class="common-wrap order-products">
      <view v-for="(item, index) in list" :key="index" class="product flex flex-middle bd-e">
        <image class="product-size" :src="item.picurl || defaultProductPic" />
        <view class="product-content flex flex-1 flex-column flex-between ml-20">
          <view class="fs-26 fw-bold ellipsis-1">{{ item.productname }}</view>
          <view class="fs-22 c-9 mt-5">{{ item.productformatname }}</view>
          <view class="fs-24 c-3">
            <text v-if="showOrderPrice" class="mr-20">订货价：￥{{ item.storeorderprice }}</text>
            <text>数量：{{ item.value }}</text>
          </view>
        </view>
      </view>
      <view class="order-total fs-28 fw-bold tx-r">
        <text>
          商品总数：
          <text class="primary-color">{{ totalCount }}</text>
        </text>
        <text v-if="showOrderPrice" class="ml-20">
          合计：
          <text class="primary-color">￥{{ totalPrice }}</text>
        </text>
      </view>
    </view>
    <view class="common-wrap order-remark">
      <textarea
        v-model.trim="orderRemark"
        class="remark"
        placeholder="请输入订单留言"
        placeholder-class="placeholder"
        placeholder-style="color: #999;font-size: 28rpx"
        maxlength="80"
      ></textarea>
    </view>
    <view v-if="isUploadPayVoucher" class="common-wrap order-pay">
      <view class="title fw-bold">支付凭证</view>
      <view v-if="orderPayRecordUrl" class="upload-image" @tap="handlePreview(orderPayRecordUrl)">
        <image class="upload-pic" :src="orderPayRecordUrl" />
        <image class="pic-dele" :src="iconDele" mode="scaleToFill" @tap.stop="orderPayRecordUrl = ''" />
      </view>
      <view v-else class="upload-image" @tap="handleUploadImage">
        <view class="plus"></view>
        <view class="upload-text">点击上传</view>
      </view>
    </view>
    <dealer-picker
      ref="dealerRef"
      v-model="dealerPickerState"
      :dealer-id.sync="dealerInfo.dealerid"
      @submit="handleGetDealerInfo"
    />
    <view style="height: 150rpx"></view>
    <button
      :class="btnDiabled ? 'disabled' : ''"
      class="primary-btn size-small fixed-bottom fixed-wide"
      hover-class="button-action"
      @tap="handleCreateOrder"
    >
      提交订单
    </button>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { chooseImg, uploadImg } from '@/utils/upload'
import { getJsCode } from '@/utils/set-mp'
import subscribeMsg from '@/mixins/subscribe-msg.js'
import DealerPicker from '@/components/people-picker/order-dealer-picker.vue'
import { apiCreateOrder } from '@/api/order'
import { apiGetSubscribeTemplateId } from '@/api/cloud-store'
import { apiAddresslist } from '@/packages/src/api/address.js'
import { mapGetters } from 'vuex'
import { staticURL } from '@/config'
export default {
  name: 'OrderComfirm',
  components: { DealerPicker },
  mixins: [subscribeMsg],
  data() {
    return {
      iconDele: staticURL() + 'common/icon-dele.png',
      defaultProductPic: staticURL() + 'common/default-pic.png',
      orderPayRecordUrl: '',
      orderRemark: '',
      dealerPickerState: false, // 经销商弹窗
      dealerInfo: {
        dealerid: -1,
        mobile: '',
        dealername: ''
      }, // 选择的经销商信息
      isSubscribe: false,
      loading: false,
      choosedAddress: {
        id: -1,
        provincename: '',
        cityname: '',
        countyname: '',
        address: '',
        consignee: '',
        mobile: ''
      }, // 已选地址
      totalPrice: ''
    }
  },
  computed: {
    isUploadPayVoucher() {
      return this.$store.state.fcBasicSet?.isuploadpayvoucher
    },
    btnDiabled() {
      let isOrderPay = true
      if (!this.orderPayRecordUrl && this.isUploadPayVoucher) isOrderPay = false
      return !(this.dealerInfo.dealerid !== -1 && this.choosedAddress.id !== -1 && isOrderPay)
    },
    address() {
      //  收货地址
      let { provincename, cityname, countyname, address } = this.choosedAddress
      return `${provincename || ''}${cityname || ''}${countyname || ''}${address || ''}`
    },
    list() {
      return this.$store.state.choosedGoodsList
    },
    totalCount() {
      // 显示数量
      let totalCount = 0
      this.list.forEach(element => {
        if (element.checked) totalCount = totalCount + element.value
      })
      return totalCount
    },
    ...mapGetters(['showOrderPrice'])
  },
  onLoad(options) {
    options.price && (this.totalPrice = options.price)
    this.handleGetSubId()
    this.$store.dispatch('getFcBasicInfo')
    this.$refs.dealerRef.getData(1)
    this.getAddressList()
  },
  async onShow() {
    uni.$once('selectRess', res => {
      this.choosedAddress = res
    })
    this.$refs.privacyPopup.refresh()
  },
  methods: {
    handleGetDealerInfo(e) {
      if (!e) return
      this.dealerInfo = e
    },
    async handleUploadImage() {
      // 上传
      const paths = await chooseImg({ mediaType: ['image'] })
      if (paths?.length) {
        let res = await uploadImg(paths[0])
        if (this.$ck(res, true)) {
          //上传凭证
          this.orderPayRecordUrl = res.return_data
        }
      }
    },
    handlechooseAddress() {
      //选择收货地址
      uni.navigateTo({
        url: `/packages/src/address/list?entryType=1&chooseAdressdId=${this.choosedAddress.id}`
      })
    },
    handleChooseRelation() {
      //  选择所属上级
      this.dealerPickerState = true
    },
    async handleSubscribe() {
      // 点击提交订单，先进行消息订阅
      this.isSubscribe = true
      await this.requestSubscribeMsg(this.noticeTempId)

      uni.redirectTo({
        url: `/order/order-list`
      })
    },
    formatList() {
      return this.list.map(({ productno, value: count, storeorderprice: orderprice }) => ({
        productno,
        count,
        orderprice
      }))
    },
    async handleCreateOrder() {
      if (this.dealerInfo.dealerid === -1) {
        return this.$msg('请选择所属上级')
      }
      if (this.choosedAddress.id === -1) {
        return this.$msg('请选择收货地址')
      }
      if (this.isUploadPayVoucher && !this.orderPayRecordUrl) {
        return this.$msg('亲，请上传支付凭证')
      }
      const prolist = this.formatList()
      let data = {
        isopenorderprice: +this.showOrderPrice,
        prolist,
        receivename: this.choosedAddress.consignee, //收货人
        mobile: this.choosedAddress.mobile, //收货人手机号
        receiveaddress: this.address, //收获地址
        remark: this.orderRemark, //订单备注
        payvoucharurl: this.orderPayRecordUrl, //支付凭证
        updealerid: this.dealerInfo.dealerid //门店下单指定的经销商ID(仅门店下单使用)
      }
      if (this.loading) return
      this.loading = true
      try {
        const { return_code: code, return_msg: msg } = await apiCreateOrder(data)
        if (code === 0) {
          this.$msg('提交订单成功')
          this.handleSubscribe()
        } else if ([-2, -3].includes(code)) {
          // -2.金额不一致 -3状态不一致
          uni.showModal({
            content: msg,
            showCancel: false,
            confirmColor: '#FF7640',
            success: () => {
              uni.$emit('refresh-products')
              code === -3 && this.$store.dispatch('getFcBasicInfo')
              uni.navigateBack()
            }
          })
        } else {
          this.$msg(msg)
        }
      } finally {
        this.loading = false
      }
    },
    async getAddressList() {
      let res = await apiAddresslist()
      if (this.$ck(res, true)) {
        let list = res.return_data.filter(item => item.isdefault)
        if (list.length) this.choosedAddress = list[0]
      }
    },
    // 获取消息订阅模板ID
    async handleGetSubId() {
      let data = {
        js_code: await getJsCode(),
        type: 3
        // type: 3 //1-提现审核消息,2-注册审核消息,3-商品订单通知
      }
      let res = await apiGetSubscribeTemplateId(data)
      if (this.$ck(res)) this.noticeTempId = res.return_data || ''
    },
    handlePreview(url) {
      let urls = [url]
      uni.previewImage({
        current: url, // 当前显示图片的 http 链接
        urls: urls // 需要预览的图片 http 链接列表
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-comfirm {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
  .order-ralation {
    background: #fff;
    padding: 20rpx 30rpx;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    line-height: 40rpx;
  }
  .common-wrap {
    border-radius: 10rpx;
    background: #ffffff;
    margin: 20rpx;
  }
  .order-address {
    padding: 20rpx;
  }
  .order-products {
    padding: 0 30rpx;
    .product {
      padding: 20rpx 30rpx 20rpx 0;
      &-size {
        width: 120rpx;
        height: 120rpx;
      }
      &-content {
        height: 120rpx;
      }
    }
  }
  .order-total {
    padding: 20rpx 0;
  }
  .order-remark {
    padding: 20rpx 30rpx;
    .remark {
      margin-top: 20rpx;
      display: block;
      width: 100%;
      border: none;
      font-size: 32rpx;
      line-height: 52rpx;
      height: 200rpx;
      z-index: 0;
    }
  }
  .order-pay {
    background: #fff;
    padding: 20rpx 30rpx;
    .upload-image {
      margin: 20rpx auto;
      width: 150rpx;
      height: 150rpx;
      position: relative;
      border: 1px solid #e5e5e5;
      .pic-dele {
        position: absolute;
        right: -25rpx;
        top: -15rpx;
        padding: 10rpx;
        width: 24rpx;
        height: 24rpx;
      }
      .upload-pic {
        width: 148rpx;
        height: 148rpx;
        .pic-dele {
          position: absolute;
          right: -20rpx;
          top: -20rpx;
          padding: 10rpx;
          width: 24rpx;
          height: 24rpx;
        }
      }
      .plus {
        width: 150rpx;
        height: 150rpx;
        position: relative;
        &::before {
          position: absolute;
          content: '';
          width: 50rpx;
          height: 4rpx;
          left: 50rpx;
          top: 50rpx;
          background: #e5e5e5;
        }
        &::after {
          position: absolute;
          content: '';
          height: 50rpx;
          width: 4rpx;
          left: 70rpx;
          top: 30rpx;
          background: #e5e5e5;
        }
      }
      .upload-text {
        font-size: 24rpx;
        font-weight: 500;
        color: #999999;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40rpx;
        font-weight: 700;
        text-align: center;
        background: #fff;
      }
    }
  }
}
</style>
