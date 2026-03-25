<template>
  <view class="logistics bg-f" :style="themeVars">
    <view class="container-header" :style="{ height: topHeight }">
      <view class="search-box">
        <selector-picker
          v-model="tagId"
          class="selector-width mr-20"
          :options="columns"
          range-key="label"
        ></selector-picker>
        <search-input
          v-model="keywordOri"
          class="search-input"
          placeholder="请输入物流码"
          @search="handleSearch"
        ></search-input>
      </view>
      <view class="total-count">
        剩余库存：
        <text class="primary-color">{{ productTotalCount }}</text>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <view class="content">
      <view v-if="list.length" class="th">
        <view class="row fs-32">物流码</view>
        <view class="row fs-32">标签类型</view>
        <view class="row fs-32">商品数量</view>
      </view>
      <div v-for="(item, index) in list" :key="index" class="th item">
        <div class="row fs-30">{{ item.serialnumber }}</div>
        <div class="row fs-30 content-info">{{ item.tagstype | tagstyleFilter }}</div>
        <div class="row fs-30 content-info edit-color" @click="handleDetail(item)">{{ item.productcount }}</div>
      </div>
      <none-data v-if="!list.length && !loading" msg="没有相关记录" />
      <load-more v-if="!loading && list.length" :has-more="hasMore" />
    </view>
    <code-list
      ref="codePicker"
      v-model="pickerState"
      :table-data="tableData"
      @showLogisticsPopup="showLogisticsPopup"
    />
    <u-mask
      :show="showLogistics"
      class="popup-content"
      :z-index="1000"
      :mask-click-able="true"
      :zoom="false"
      :custom-style="{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }"
      @click="closeLogistics"
    >
      <view class="close-btn" @tap.stop="closeLogistics">
        <text class="iconfont icon-close fs-32"></text>
      </view>
      <view class="logistics-card" @tap.stop="() => {}">
        <view v-if="currentBarcodeIndex !== -1" class="barcode-content">
          <view class="barcode-image-wrapper">
            <image v-if="currentBarcodeImage" :src="currentBarcodeImage" class="barcode-image" mode="aspectFit" />
          </view>
          <view class="barcode-text">{{ currentSerialNumber }}</view>
          <view class="barcode-navigation">
            <view
              v-if="currentBarcodeIndex > 0"
              class="nav-arrow iconfont icon-more prev"
              @tap.stop="prevBarcode"
            ></view>
            <view class="nav-counter">
              <text class="primary-color">{{ currentBarcodeIndex + 1 }}</text>
              <text class="ml-10 mr-10">/</text>
              {{ barcodeData.length }}
            </view>
            <view
              v-if="currentBarcodeIndex < barcodeData.length - 1"
              class="nav-arrow iconfont icon-more next"
              @tap.stop="nextBarcode"
            ></view>
          </view>
        </view>
      </view>
    </u-mask>
    <canvas canvas-id="barcodeCanvas" class="barcode-canvas"></canvas>
  </view>
</template>

<script>
import { tagstyleFilter } from '@/filters'
import { apiGetStockDetail, apiGetSmallscaleDetail } from '@/api/stock'
import { nonDataDefault } from '@/utils/default-picture'
import SearchInput from '@/components/search/search-input.vue'
import LoadMore from '@/components/load-more'
import CodeList from './comps/code-list'
import SelectorPicker from '@/components/search/selector-picker'
import wxbarcode from 'wxbarcode'

export default {
  components: {
    SearchInput,
    LoadMore,
    SelectorPicker,
    CodeList
  },
  filters: { tagstyleFilter },
  data() {
    return {
      showLogistics: false,
      barcodeImageUrl: '',
      barcodeImageMap: {}, // 存储生成的条形码图片 {serialnumber: imageUrl}
      barcodeData: [], // 条形码数据数组
      currentBarcodeIndex: -1, // 当前显示的条形码索引
      tableData: [],
      pickerState: false,
      productTotalCount: 0,
      topHeight: '160rpx',
      keywordOri: '',
      keyword: '',
      tagId: -1,
      columns: [
        {
          val: -1,
          label: '全部'
        },
        {
          val: 0,
          label: '大标'
        },
        {
          val: 1,
          label: '中标'
        },
        {
          val: 2,
          label: '小标'
        },
        {
          val: 3,
          label: '垛标'
        }
      ],
      list: [], // 列表数据
      loading: true,
      hasMore: true, // 还有更多数据标记
      busy: false, // 防重复标记
      page: {
        pageIndex: 0,
        pageSize: 20
      },
      nonDataDefault,
      productId: 0,
      productFormatId: 0
    }
  },
  computed: {
    currentBarcodeImage() {
      if (this.currentBarcodeIndex === -1) return ''
      const serialnumber = this.barcodeData[this.currentBarcodeIndex]
      return this.barcodeImageMap[serialnumber] || ''
    },
    currentSerialNumber() {
      if (this.currentBarcodeIndex === -1) return ''
      return this.barcodeData[this.currentBarcodeIndex]
    }
  },
  watch: {
    tagId() {
      this.restData()
      this.handleSearch()
    },
    showLogistics(newVal) {
      if (!newVal) {
        this.barcodeImageUrl = ''
        this.barcodeImageMap = {}
        this.barcodeData = []
        this.currentBarcodeIndex = -1
        // 弹窗关闭时清理 Canvas
        this.$nextTick(() => {
          const ctx = uni.createCanvasContext('barcodeCanvas', this)
          ctx.clearRect(0, 0, 560, 260)
          ctx.draw()
        })
      }
    }
  },
  onLoad(option) {
    this.productId = option.productId
    this.productFormatId = option.productFormatId
    this.getData()
  },

  onPullDownRefresh() {
    this.restData()
    this.handleSearch()
  },
  onReachBottom() {
    // 上拉加载
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    closeLogistics() {
      this.showLogistics = false
      this.barcodeImageUrl = ''
      // 清理 Canvas
      this.$nextTick(() => {
        const ctx = uni.createCanvasContext('barcodeCanvas', this)
        ctx.clearRect(0, 0, 560, 260)
        ctx.draw()
      })
    },
    // 显示条形码弹窗
    async showLogisticsPopup(index) {
      // 收集所有物流码
      this.barcodeData = this.tableData.map(item => item.serialnumber)
      this.currentBarcodeIndex = index

      // 先显示弹窗
      this.showLogistics = true

      // 然后在弹窗中生成第一个条形码
      this.$nextTick(async () => {
        this.$loading.show()
        try {
          await this.generateBarcodeImage(this.currentBarcodeIndex)
        } catch (err) {
          // 生成失败
        } finally {
          this.$loading.hide()
        }
      })
    },
    // 生成条形码图片
    async generateBarcodeImage(index) {
      if (index < 0 || index >= this.barcodeData.length) {
        return
      }

      const serialnumber = this.barcodeData[index]

      // 如果已经生成过，直接返回
      if (this.barcodeImageMap[serialnumber]) {
        return Promise.resolve()
      }

      // 生成新的条形码图片
      return new Promise((resolve, reject) => {
        try {
          wxbarcode.barcode('barcodeCanvas', serialnumber, 560, 260)
          setTimeout(() => {
            uni.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: 560,
              height: 260,
              destWidth: 560,
              destHeight: 260,
              canvasId: 'barcodeCanvas',
              success: res => {
                this.$set(this.barcodeImageMap, serialnumber, res.tempFilePath)
                resolve()
              },
              fail: err => {
                reject(err)
              }
            })
          }, 300)
        } catch (err) {
          reject(err)
        }
      })
    },
    // 上一张
    async prevBarcode() {
      if (this.currentBarcodeIndex <= 0) return

      this.currentBarcodeIndex--

      // 如果还没有生成图片，先生成
      if (!this.barcodeImageMap[this.currentSerialNumber]) {
        this.$loading.show()
        await this.generateBarcodeImage(this.currentBarcodeIndex)
        this.$loading.hide()
      }
    },
    // 下一张
    async nextBarcode() {
      if (this.currentBarcodeIndex >= this.barcodeData.length - 1) return

      this.currentBarcodeIndex++

      // 如果还没有生成图片，先生成
      if (!this.barcodeImageMap[this.currentSerialNumber]) {
        this.$loading.show()
        await this.generateBarcodeImage(this.currentBarcodeIndex)
        this.$loading.hide()
      }
    },
    restData() {
      this.page = {
        pageIndex: 0,
        pageSize: 10
      }
      this.list = [] // 列表数据
      this.loading = true
      this.hasMore = true // 还有更多数据标记
      this.busy = false // 防重复标记
    },
    handleSearch() {
      this.restData()
      this.keyword = this.keywordOri
      this.getData()
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      let res = await apiGetStockDetail({
        productid: this.productId,
        productformatid: this.productFormatId,
        tagstype: this.tagId,
        keyword: this.keyword,
        pageindex: this.page.pageIndex + 1,
        pagesize: 20
      })
      uni.stopPullDownRefresh()
      if (this.$ck(res, true)) {
        this.page.pageIndex++
        let { list, producttotalcount, totalcount } = res.return_data
        this.list = [...this.list, ...list]
        this.hasMore = totalcount > this.list.length
        this.productTotalCount = producttotalcount
        this.busy = false
        this.loading = false
      } else {
        this.busy = false
        this.loading = false
      }
    },
    async handleDetail(item) {
      let res = await apiGetSmallscaleDetail({
        tagstype: item.tagstype,
        serialnumber: item.serialnumber
      })
      if (this.$ck(res)) {
        this.tableData = res.return_data.list
        this.pickerState = true
      }
    }
  }
}
</script>

<style>
page {
  background-color: #fff;
}
</style>
<style lang="scss" scoped>
.container-header {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;

  width: 100%;

  background: #f5f5f5;
}

.logistics {
  .search-box {
    display: flex;

    margin: 0 auto;
    padding: 20rpx 30rpx 30rpx;

    background: #f5f5f5;
    ::v-deep .search-input {
      margin: 0 !important;
    }
    .search-input {
      flex: 1;
    }
  }
  .total-count {
    padding: 0 30rpx 20rpx;

    background: #f5f5f5;

    font-weight: 700;
  }
  .content {
    margin-top: 40rpx;
    padding: 0 20rpx;
    .th {
      display: flex;
      .row {
        width: 33.3%;

        text-align: center;
        word-wrap: break-word;

        font-weight: bold;
      }
      .content-info {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .item {
      padding: 30rpx 0;

      border-bottom: 1rpx solid #e5e5e5;
      .row {
        font-weight: 400;
      }
      &:last-child {
        border: none;
      }
    }
  }
}
.logistics-card {
  position: relative;
  z-index: 103;
  width: 620rpx;
  padding: 30rpx;

  border-radius: 10rpx;
  background: #fff;
  .barcode-image-wrapper {
    position: relative;
    width: 560rpx;
    height: 260rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .barcode-image {
    width: 560rpx;
    height: 260rpx;
  }

  .barcode-text {
    margin-top: 20rpx;
    font-size: 36rpx;
    color: #333;
    text-align: center;
    letter-spacing: 16rpx;
  }

  .barcode-navigation {
    position: relative;
    width: 100%;
    padding: 30rpx 0;
    text-align: center;
  }

  .nav-arrow {
    position: absolute;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20rpx;
    font-size: 30rpx;
    border: 1px solid #e5e5e5;
    border-radius: 50%;
    &.prev {
      left: 0;
      transform: translateY(-50%) rotate(180deg);
    }
    &.next {
      right: 0;
      transform: translateY(-50%);
    }
  }

  .nav-counter {
    font-size: 28rpx;
    color: #666;
  }
}
.barcode-canvas {
  position: fixed;
  z-index: -1;
  left: -99999px;

  width: 560rpx;
  height: 260rpx;

  pointer-events: none;

  opacity: 0;
  // border: 1px solid #c3c3c3;
}
.close-btn {
  position: fixed;
  z-index: 102;
  top: 70rpx;
  right: 70rpx;

  color: #fff;
}
</style>
