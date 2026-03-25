<template>
  <view v-if="!loading" class="container" :style="themeVars">
    <view class="wrapper">
      <!-- 订单部分 start -->
      <view v-if="CkeckType === 1" class="top-text" style="font-size: 30rpx">请扫描产品条码</view>
      <view v-else class="top-text">请将本次核销的商品打包好交给消费者</view>
      <view class="check-item">
        <view v-if="type !== 1" class="check-item__header">
          <view>订单号：{{ OrderNumber }}</view>
        </view>
        <view class="check-item__body">
          <block v-for="(item, index) in list" :key="index">
            <view style="background-color: #f9f9f9">
              <ProductCard
                :product="item"
                :is-goods-check-order="IsGoodsCheckOrder"
                :check-status="item.CheckStatus"
                :length="list.length"
                :index="index"
                :is-show-check="isShowCheck"
                class="mt-10"
                @check="handleCheck"
              ></ProductCard>
            </view>
          </block>
        </view>
      </view>
      <view v-if="CkeckType === 1" style="padding: 40rpx 20rpx; display: flex; justify-content: space-around">
        <view class="button button--round button--large" style="width: 46%" @tap="handleCanel">取消</view>
        <view class="button button--round button--large" style="width: 46%" @tap="handleConfirmBarcode">扫一扫</view>
      </view>
      <view v-else style="padding: 40rpx 20rpx">
        <view
          :class="['button', 'button--round', 'button--large', btnFlag === 2 ? '' : 'disabled']"
          @tap="handleConfirm"
        >
          确认核销
        </view>
      </view>
      <!-- 订单部分 end -->
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import ProductCard from './comps/product-card'
export default {
  components: {
    ProductCard
  },
  data() {
    return {
      loading: true,
      CheckCode: '', // 订单核销码
      IsGoodsCheckOrder: 1, // 是否商品核销码订单(订单商品是否具体单独核销码)0-否1-是
      CkeckType: 0, // 0：不需要扫产品条码进行核销， 1：需要扫产品条码进行核销
      isShowCheck: true,
      OrderNumber: '',
      type: 0, // 用于判断是否是推荐有礼商品，有推荐有礼则type为1,
      CheckCodeTimestamp: 0, // 时间搓
      scene: 0, // 场景值
      page: {
        index: 1,
        size: 10,
        total: 0
      },
      list: []
    }
  },
  computed: {
    selectList() {
      return this.list && this.list.filter(item => item.checked)
    },
    btnFlag() {
      let flag = 1
      let arr = this.list && this.list.filter(item => item.checked)
      if (arr.length > 0) flag = 2
      return flag
    }
  },
  async onLoad(option) {
    this.OrderNumber = option.orderNumber || ''
    this.CheckCode = option.checkCode || ''
    this.type = Number(option.type) || 0
    this.CheckCodeTimestamp = Number(option.CheckCodeTimestamp) || 0
    this.scene = option.scene || 0
    // 用于判断是否是推荐有礼商品，有推荐有礼则type为1
    if (this.type === 1) {
      await this.handleGetGeneralInfo()
      await this.GetRecommendGiftByCheckCode()
    } else {
      await this.handleGetGeneralInfo()
      await this.getOrderDetail()
    }
  },
  methods: {
    // 选中的回调
    handleCheck(index) {
      if (!this.list[index].CheckStatus && !this.CkeckType && this.IsGoodsCheckOrder) {
        const checked = this.list[index].checked
        this.list[index].checked = !checked
      }
    },
    // 确认核销
    handleConfirm() {
      if (this.loading) return
      if (!this.selectList.length) return
      if (this.IsGoodsCheckOrder) {
        let CheckCodes = []
        this.selectList.forEach(item => {
          CheckCodes.push(item.CheckCode)
        })
        this.loading = true
        // 用于判断是否是推荐有礼商品，有推荐有礼则type为1
        if (this.type === 1) {
          let data = {
            CheckCodes: CheckCodes, // 核销码
            Id: this.OrderNumber // 礼品单号
          }
          apiCloud({
            // 进行核销
            url: '/api/v1/Recommend/CheckGiftItem',
            method: 'post',
            data: JSON.stringify(data)
          }).then(res => {
            this.loading = false
            if (res.return_code === 0 && res.return_data) {
              this.$msg('核销成功')
              const { CheckUserName, WriteOffTime, List } = res.return_data
              List.map(item => (item.IsFreeGift = 1))
              uni.redirectTo({
                url: `./confirm-detail?orderNumber=${
                  this.OrderNumber
                }&type=1&CheckUserName=${CheckUserName}&CheckTime=${WriteOffTime}&List=${JSON.stringify(List)}`
              })
            } else {
              uni.navigateTo({
                url: `./confirm-fail-detail?orderNumber=${this.OrderNumber}&msg=${res.return_msg}&CkeckType=${this.CkeckType}&type=1`
              })
            }
          })
        } else {
          let data = {
            CheckCodes: CheckCodes, // 核销码
            OrderNum: this.OrderNumber // 订单号
          }
          apiCloud({
            // 进行核销
            url: '/api/v1/Order/CheckOrderItem',
            method: 'post',
            data: JSON.stringify(data)
          }).then(async res => {
            this.loading = false
            if (res.return_code === 0) {
              this.$msg('核销成功')
              // 判断是否全部核销
              uni.redirectTo({
                url: `./confirm-detail?orderNumber=${this.OrderNumber}`
              })
            } else {
              uni.navigateTo({
                url: `./confirm-fail-detail?orderNumber=${this.OrderNumber}&msg=${res.return_msg}&CkeckType=${this.CkeckType}`
              })
            }
          })
        }
      } else {
        // 兼容之前的订单,直接核销整个订单
        this.loading = true
        let data = {
          // 进行核销
          CheckCode: this.CheckCode, // 核销码
          OrderNumber: this.OrderNumber, // 订单号
          Source: this.scene || 0 // 微信场景值
        }
        apiCloud({
          url: '/api/v1/Order/CheckOrder',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          this.loading = false
          if (res.return_code === 0) {
            uni.redirectTo({
              url: `./confirm-detail?orderNumber=${this.OrderNumber}`
            })
          } else {
            uni.navigateTo({
              url: `./confirm-fail-detail?orderNumber=${this.OrderNumber}&msg=${res.return_msg}&CkeckType=${this.CkeckType}`
            })
          }
        })
      }
    },
    // 取消
    handleCanel() {
      uni.redirectTo({
        url: '/cloud-store/order-management/index'
      })
    },
    // 商品条形码
    handleConfirmBarcode() {
      this.checkOrderFn()
    },
    // 扫码
    checkOrderFn() {
      uni.scanCode({
        success: res => {
          let { result } = res
          // 自动过滤首尾无效字符（空格、换行、制表符）
          result = result.trim()
          if (!result) return this.$msg('扫码失败，请重试')
          this.checkOrder(result)
        },
        fail: () => {
          this.$msg('扫码失败，请重试')
        }
      })
    },
    checkOrder(data) {
      if (this.type === 1) {
        let dataT = {
          CheckCodes: data,
          Id: Number(this.OrderNumber)
        }
        apiCloud({
          url: '/api/v1/Recommend/CheckGiftItemByBarCode',
          method: 'post',
          data: JSON.stringify(dataT)
        }).then(
          async res => {
            if (res.return_code === 0 && res.return_data) {
              this.$msg('核销成功')
              const { CheckUserName, WriteOffTime, List } = res.return_data
              List.map(item => (item.IsFreeGift = 1))
              uni.redirectTo({
                url: `./confirm-detail?orderNumber=${
                  this.OrderNumber
                }&type=1&CheckUserName=${CheckUserName}&CheckTime=${WriteOffTime}&List=${JSON.stringify(List)}`
              })
            } else {
              uni.navigateTo({
                url: `./confirm-fail-detail?orderNumber=${this.OrderNumber}&msg=${res.return_msg}&CkeckType=${this.CkeckType}&type=1`
              })
            }
          },
          () => {
            this.$msg('网络超时，请重试')
          }
        )
      } else {
        let dataT = {
          CheckCode: data,
          OrderNum: this.OrderNumber
        }
        apiCloud({
          url: '/api/v1/Order/CheckOrderItemByBarCode',
          method: 'post',
          data: JSON.stringify(dataT)
        }).then(
          async res => {
            if (res.return_code === 0) {
              this.$msg('核销成功')
              uni.redirectTo({
                url: `./confirm-detail?orderNumber=${this.OrderNumber}`
              })
            } else {
              uni.navigateTo({
                url: `./confirm-fail-detail?orderNumber=${this.OrderNumber}&msg=${res.return_msg}&CkeckType=${this.CkeckType}`
              })
            }
          },
          () => {
            this.showToast('网络超时，请重试')
          }
        )
      }
    },
    // 获取订单商品
    getOrderDetail() {
      return new Promise(resolve => {
        this.loading = true
        let data = {
          orderNumber: this.OrderNumber,
          CheckCodeTimestamp: this.CheckCodeTimestamp,
          Source: this.scene || 0 // 微信场景值
        }
        apiCloud({
          url: '/api/v1/Order/OrderDetail',
          method: 'get',
          data: JSON.stringify(data)
        }).then(
          res => {
            resolve()
            this.loading = false
            if (res.return_code === 0) {
              if (res.return_data && res.return_data.OrderItems) {
                res.return_data.OrderItems.forEach(item => {
                  if (!item.CheckStatus && !this.CkeckType) {
                    item.checked = true
                  }
                })
              }
              this.list = res.return_data.OrderItems || []
              this.IsGoodsCheckOrder = res.return_data.IsGoodsCheckOrder
            } else {
              this.$msg(res.return_msg)
              setTimeout(() => {
                // 核销失败跳转到首页
                uni.reLaunch({
                  url: '/pages/index/index'
                })
              }, 1500)
            }
          },
          () => {
            this.$msg('网络超时，请重试')
          }
        )
      })
    },
    // 获取推荐有礼商品
    GetRecommendGiftByCheckCode() {
      this.loading = true
      return new Promise((resolve, reject) => {
        let data = {
          Id: Number(this.OrderNumber),
          CheckCode: this.CheckCode,
          CheckCodeTimestamp: this.CheckCodeTimestamp
        }
        apiCloud({
          url: '/api/v1/Recommend/GetRecommendGiftByCheckCode',
          method: 'get',
          data: JSON.stringify(data)
        })
          .then(
            res => {
              this.loading = false
              if (res.return_code === 0) {
                if (!res.return_data) {
                  this.$msg('找不到相关订单，请确认核销码是否正确')
                  setTimeout(() => {
                    uni.navigateBack()
                  }, 2000)
                  return
                }
                if (res.return_data) {
                  res.return_data.forEach(item => {
                    item.IsFreeGift = 1
                    if (!item.CheckStatus && !this.CkeckType) {
                      item.checked = true
                    }
                  })
                }
                this.list = res.return_data || []
                resolve()
              } else {
                this.$msg(res.Return_msg)
              }
            },
            () => {
              this.$msg('网络超时，请重试')
            }
          )
          .catch(err => {
            this.loading = false
            reject(err)
          })
      })
    },
    // 是否需要扫产品条码进行核销
    handleGetGeneralInfo() {
      return new Promise(resolve => {
        apiCloud({
          url: '/api/v1/BaseSet/GetGeneralInfo',
          method: 'get',
          data: JSON.stringify({})
        }).then(res => {
          if (this.$ck(res)) {
            resolve()
            this.CkeckType = res.return_data.CkeckType || 0
            if (this.CkeckType) this.isShowCheck = false
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/styles/tab.scss';
.top-text {
  background-color: #fff;
  padding: 0 20rpx;
  font-size: 24rpx;
  color: var(--theme-color, $uni-color-primary);
  height: 80rpx;
  line-height: 80rpx;
}
.check-item {
  margin-top: 30rpx;
  padding: 30rpx;
  background-color: #fff;
  .check-item__header {
    display: flex;
    padding-bottom: 28rpx;
    border-bottom: 1rpx solid #eee;
    font-size: 24rpx;
    color: #999;
  }
  .check-item__body {
    margin-top: 20rpx;
  }
  .check-item__footer {
    margin-top: 30rpx;
    .check-item__total {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      .check-item__count {
        font-size: 24rpx;
        color: #444;
      }
      .check-item__amount {
        display: flex;
        align-items: flex-end;
        margin-left: 30rpx;
        .check-item__amount__label {
          font-size: 24rpx;
          color: #444;
        }
        .check-item__amount__value {
          line-height: 1;
          font-size: 32rpx;
          color: #ff5e33;
        }
      }
    }
    .check-item__check {
      margin-top: 25rpx;
      line-height: 36rpx;
      text-align: right;
      font-size: 24rpx;
      color: #444;
    }
  }
}
.search {
  margin: 30rpx 20rpx;
}
.disabled {
  color: #fff;
  background-color: #aaa;
}
</style>
