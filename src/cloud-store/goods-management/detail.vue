<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <view v-for="(item, index) in list" :key="index" class="wrapper-content">
        <view class="content-top">
          <text class="gray">规格信息：</text>
          <text class="gray" style="color: #000000">{{ item.FormatNames }}</text>
        </view>
        <view class="content-middle">
          <text class="gray">原价(元)：</text>
          <text class="gray" style="color: #000000">{{ item.SalesInfo.Price }}</text>
        </view>
        <view class="content-bto">
          <text class="gray">库存：</text>
          <input
            type="number"
            :value="item.Stock"
            class="inputValue"
            maxlength="5"
            @input="handleInput"
            @focus="handleFocus(index)"
          />
        </view>
      </view>
    </view>
    <!-- 操作按钮 -->
    <view class="controlBtn">
      <view class="controlBtnFixed">
        <view class="txtChange" @tap="show = true">批量修改</view>
        <view class="btn" style="border-left: 1px solid #fff" @tap="handleAddStock">保存</view>
      </view>
    </view>
    <u-popup v-model="show" mode="center" border-radius="14" width="540rpx" height="auto" closeable="true">
      <view class="inputBox">
        <view class="stock-tabs">
          <view :class="['tabs-item', activiyStockTabIndex == 0 ? 'on' : '']" @tap="handleTab(0)">增加库存</view>
          <view :class="['tabs-item', activiyStockTabIndex == 1 ? 'on' : '']" @tap="handleTab(1)">减少库存</view>
        </view>
        <view class="inputItem">
          <view>库存：</view>
          <input
            v-model="batchSetStock"
            type="number"
            class="inputUibackend"
            placeholder="库存"
            placeholder-style="color: #aaa"
            maxlength="5"
          />
        </view>
        <view class="stock-tips">
          {{ activiyStockTabIndex == 0 ? '输入数字，则表示新加对应库存' : '输入数字，则表示删减对应库存' }}
        </view>
        <view class="btn-box">
          <view class="cancel" @click="show = false">取消</view>
          <view class="sure" @click="handleSure">确定</view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
export default {
  data() {
    return {
      list: [],
      listIndex: 0, //选中的规格输入框
      batchSetStock: '', // 输入库存数量
      activiyStockTabIndex: 0,
      GoodsId: '',
      show: false
    }
  },
  onLoad(ops) {
    let GoodItem = JSON.parse(ops.GoodItem)
    this.GoodsId = +GoodItem[0].GoodsId
    this.list = GoodItem[0].GoodsFormatList
    this.list.map(res => {
      res.FormatNames = res.FormatNames.replace(/,/g, '|')
      res.Stock = +res.SalesInfo.EnableStockCount
    })
  },
  onReachBottom() {},
  methods: {
    handleAddStock() {
      let StocksArr = []
      this.list.map(resT => {
        let obj = {}
        obj.FormatID = resT.ID
        obj.Stock = resT.Stock
        StocksArr.push(obj)
      })
      apiCloud({
        url: '/api/v1/Goods/SetStock',
        method: 'post',
        data: JSON.stringify({ GoodsID: this.GoodsId, Stocks: StocksArr })
      }).then(res => {
        if (this.$ck(res)) {
          this.showToast('操作成功')
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    },
    handleFocus(index) {
      this.listIndex = index
    },
    handleInput(e) {
      this.list[this.listIndex].Stock = +e.detail.value
    },
    handleTab(type) {
      this.activiyStockTabIndex = type
    },
    showToast(connect) {
      uni.showToast({
        title: connect,
        duration: 1500,
        mask: true,
        icon: 'none'
      })
    },
    // 库存弹窗确认按钮的回调
    handleSure() {
      this.BatchStockAdd()
    },
    // 确定按钮-验证
    BatchStockAdd() {
      let Stock = this.batchSetStock - 0
      if (Stock < 1 || Stock > 99999) {
        this.showToast('库存限制1-99999')
        return
      }
      let data = {
        goodList: [this.GoodsId],
        stockCount: Number(this.batchSetStock),
        type: Number(this.activiyStockTabIndex) // 类型（0-追加库存 1-减少库存）
      }
      apiCloud({
        url: '/api/v1/Goods/AlterGoodsRepertory',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          this.showToast('操作成功')
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  min-height: 100%;
  background-color: #fff;
  .wrapper {
    padding: 30rpx;
    .wrapper-content {
      border-bottom: 1rpx solid #eeeeee;
      margin-bottom: 30rpx;
      .content-middle {
        padding: 10rpx 0;
      }
      .content-bto {
        display: flex;
        align-items: center;
        padding: 10rpx 0 30rpx 45rpx;
      }
      .gray {
        font-size: 28rpx;
        color: #666666;
      }
      .inputValue {
        width: 150rpx;
        height: 70rpx;
        line-height: 70rpx;
        border: 1rpx solid #ccc;
        border-radius: 5rpx;
        padding-left: 30rpx;
      }
    }
  }
  .controlBtn {
    height: 100rpx;
    .controlBtnFixed {
      height: 100rpx;
      position: fixed;
      justify-content: space-between;
      align-items: center;
      z-index: 3;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      font-size: 30rpx;
      background-color: #fff;
      border-top: 1px solid #e7e7e7;
      padding: 0 20rpx;
      .txtChange {
        font-size: 30rpx;
        color: #1166ff;
        text-decoration: underline;
      }
    }
    .btn {
      text-align: center;
      width: 140rpx;
      height: 70rpx;
      line-height: 70rpx;
      border-radius: 36rpx;
      padding: 0 20rpx;
      margin: 0 10rpx;
      font-size: 30rpx;
      color: #fff;
      background-color: var(--theme-color, $uni-color-primary);
      &.orange {
        color: #fff;
        background-color: var(--theme-color, $uni-color-primary);
      }
      &.disabled {
        color: #fff;
        background-color: #ccc;
      }
    }
  }
  .btn-box {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40rpx 0;
    .cancel {
      border-radius: 35rpx;
      height: 70rpx;
      line-height: 70rpx;
      width: 150rpx;
      text-align: center;
      border: 1px solid var(--theme-color, $uni-color-primary);
      background: #fff;
      color: var(--theme-color, $uni-color-primary);
      margin-right: 50rpx;
    }
    .sure {
      border-radius: 35rpx;
      height: 70rpx;
      line-height: 70rpx;
      width: 150rpx;
      text-align: center;
      background: var(--theme-color, $uni-color-primary);
      color: #fff;
    }
  }

  .inputBox {
    .stock-tabs {
      width: 100%;
      height: 100rpx;
      display: flex;
      background: #fff;
      z-index: 111;
      .tabs-item {
        flex: 1;
        line-height: 100rpx;
        text-align: center;
        font-size: 30rpx;
        position: relative;
        font-weight: bold;
        &.on {
          color: var(--theme-color, $uni-color-primary);
          &::after {
            content: '';
            width: 46rpx;
            height: 20rpx;
            position: absolute;
            background: var(--theme-color, $uni-color-primary);
            opacity: 0.1;
            border-radius: 10rpx;
            left: 0;
            right: 0;
            margin: 0 auto;
            bottom: 25rpx;
          }
        }
      }
    }
    .inputItem {
      min-height: 120rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      .inputUibackend {
        width: 230rpx;
        height: 70rpx;
        padding-left: 20rpx;
        display: block;
        font-size: 28rpx;
        border: 1px solid #999;
        text-align: left;
      }
      &:not(:nth-of-type(1)) {
        border-top: 1px dashed #eee;
      }
      position: relative;
      z-index: 0;
    }
    .stock-tips {
      font-size: 22rpx;
      font-weight: 500;
      text-align: center;
      color: #999999;
      line-height: 40rpx;
    }
  }
}
</style>
