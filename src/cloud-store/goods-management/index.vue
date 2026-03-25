<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <view class="search">
        <u-search
          v-model="keyword"
          height="70"
          :show-action="false"
          placeholder="搜索商品"
          @search="handleSearch"
        ></u-search>
      </view>
      <view class="tabs">
        <tab
          :tab="activiyTab"
          :draw-height="5"
          :draw-width="70"
          :active-index.sync="activiyTabIndex"
          :active-bag-color="themeInfo.color"
          @change="handSwichNav"
        ></tab>
      </view>
      <view class="sort-content">
        <view class="sort-left">
          <view
            v-for="(item, index) in listName"
            :key="index"
            :class="['sort-itemL', tabIndexL === item.ID ? 'on' : '']"
            @tap="swichList(item)"
          >
            {{ item.Name }}
          </view>
        </view>
        <view class="sort-right">
          <block v-if="secondCategoryList.length">
            <view class="second-list">
              <scroll-view :scroll-left="toIndexWidth" :scroll-x="true" :show-scrollbar="false" class="scroll-view_H">
                <view
                  v-for="(item, index) in secondCategoryList"
                  :id="item.ID"
                  :key="index"
                  :class="['scroll-view-item', activeId == item.ID ? 'active' : '']"
                  @tap="swichSecondNav(item)"
                >
                  {{ item.Name }}
                </view>
              </scroll-view>
            </view>
            <view class="second-list-height"></view>
          </block>
          <block v-for="(item, index) in list" :key="index">
            <view :class="['sort-itemR', item.checked ? 'list-item-active' : '']" @tap="handleSelect(index)">
              <view class="img-wrap">
                <image :src="item.PicUrl" class="head-img" />
                <text v-if="item.EnableStockCount <= 0">已售罄</text>
              </view>
              <view class="right-content">
                <view class="title">{{ item.GoodsName }}</view>
                <view v-if="item.MaxPrice > item.Price" class="price">￥{{ item.Price }}~￥{{ item.MaxPrice }}</view>
                <view v-else class="price">￥{{ item.Price }}</view>
                <view class="count">剩余库存：{{ item.EnableStockCount }}</view>
              </view>
              <view class="content-wrap">
                <text :class="['iconfont', item.checked ? 'icon-checked' : '']"></text>
              </view>
            </view>
          </block>
          <view v-if="list.length === 0 && finished" class="vh-70 flex flex-column flex-middle flex-center">
            <none-data style="padding: 0" :icon="noneIcon" msg="暂无商品~" icon-width="256" icon-height="190" />
          </view>
        </view>
      </view>
    </view>
    <!-- 操作按钮 -->
    <view v-if="list.length" class="controlBtn">
      <view class="controlBtnFixed">
        <view class="btn plain" @tap="updateGoodsSalesStatus(true)">立即{{ activiyTabIndex ? '上架' : '下架' }}</view>
        <view :class="['btn']" style="border-left: 1px solid #fff" @tap="addStore">修改库存</view>
      </view>
    </view>
    <u-popup v-model="show" mode="center" border-radius="14" width="540rpx" height="auto" closeable="true">
      <view class="inputBox">
        <view class="stock-tabs">
          <view :class="['tabs-item', activiyStockTabIndex == 0 ? 'on' : '']" @tap="swichStockNav(0)">增加库存</view>
          <view :class="['tabs-item', activiyStockTabIndex == 1 ? 'on' : '']" @tap="swichStockNav(1)">减少库存</view>
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
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      @confirm="handleConfirm"
    />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import Tab from '@/components/tab/index.vue'
import { staticURL } from '@/config'
import { simplePopupMixin } from 'packages/mixins/common-popup'
export default {
  components: {
    Tab
  },
  mixins: [simplePopupMixin],
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      show: false,
      keyword: '',
      activiyTab: ['销售中', '仓库中'],
      activiyTabIndex: 0,
      formL: {
        PageIndex: 1,
        PageSize: 999
      },
      tabIndexL: 0,
      listName: [],
      list: [],
      sForm: {
        PageIndex: 1,
        PageSize: 10
      },
      finished: false,
      secondCategoryList: [],
      activeId: 0,
      batchSetStock: '', // 输入库存数量
      total: 0,
      activiyStockTabIndex: 0,
      popTipType: '' // 操作内容
    }
  },
  computed: {
    selectList() {
      return this.list.filter(item => item.checked)
    },
    goodstList() {
      let arr = []
      this.list.forEach(item => {
        if (item.checked) {
          arr.push(item.GoodsId)
        }
      })
      return arr
    }
  },
  onShow() {
    this.CategoryList()
    this.resetData()
    this.getData()
  },
  onReachBottom() {
    if (!this.finished) {
      this.sForm.PageIndex++
      this.getData()
    }
  },
  methods: {
    // 搜索回调
    handleSearch(val) {
      this.keyword = val
      this.refresh()
    },
    handleSelect(index) {
      this.list[index].checked = !this.list[index].checked
    },
    /** 关闭提示框 */
    handleConfirm() {
      // 点击确定
      this.showPopup = false
      if (this.popTipType === 'updateStatusConfirm') {
        this.updateGoodsSalesStatus()
      }
    },
    updateGoodsSalesStatus(confirm) {
      if (!this.selectList.length) return this.$msg('请至少选择一件商品')
      const data = {
        saleStatus: this.activiyTabIndex,
        goodsIdList: this.selectList.map(item => item.GoodsId)
      }
      if (confirm) {
        // 需要提示
        this.popTipType = 'updateStatusConfirm'
        this.showTips({
          type: 'confirm',
          content: `是否确认${data.saleStatus ? '上架' : '下架'}所选商品`
        })
        return
      }
      apiCloud({
        url: '/api/v1/Goods/AlterGoodsSalesStatus',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res) && res.return_data) {
          this.refresh()
          this.showToast('操作成功')
        }
      })
    },
    // 添加库存弹窗
    addStore() {
      if (!this.selectList.length) return this.$msg('请至少选择一件商品')
      if (this.selectList.length === 1 && this.selectList[0].IsFormat === 1) {
        apiCloud({
          url: '/api/v1/Goods/GoodsDetail',
          method: 'get',
          data: JSON.stringify({ GoodsId: this.selectList[0].GoodsId })
        }).then(res => {
          if (this.$ck(res)) {
            let GoodItem = [res.return_data]
            uni.navigateTo({
              url: `./detail?GoodItem=${JSON.stringify(GoodItem)}`
            })
          }
        })
        return
      } else {
        this.show = true
      }
      this.batchSetStock = ''
    },
    // 库存弹窗确认按钮的回调
    handleSure() {
      this.BatchStockAdd()
    },
    swichStockNav(index) {
      if (this.activiyStockTabIndex === index) return
      this.activiyStockTabIndex = index
    },
    swichSecondNav(item) {
      if (this.activeId === item.ID) return
      this.activeId = item.ID
      this.resetData()
      this.getData()
    },
    // 头部类目切换
    handSwichNav() {
      this.resetData()
      this.getData()
    },
    async swichList(item) {
      // 左边类目切换
      if (this.tabIndexL === item.ID) return
      this.tabIndexL = item.ID
      this.resetData()
      this.activeId = 0
      this.secondCategoryList = []
      if (item.ID !== 0) {
        await this.getSecondCategoryList(item.ID)
      }
      this.getData()
    },
    CategoryList() {
      // 获取左边目录
      this.listName = []
      let data = {
        ...this.formL,
        ParentId: 0
      }
      apiCloud({
        url: '/api/v1/Goods/CategoryList',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          let all = [
            {
              ID: 0,
              Name: '全部'
            }
          ]
          this.listName = [...all, ...res.return_data.Results]
        }
      })
    },
    getSecondCategoryList(id) {
      // 获取二级分类
      this.secondCategoryList = []
      let data = {
        ...this.formL,
        ParentId: id
      }
      apiCloud({
        url: '/api/v1/Goods/CategoryList',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          if (res.return_data.Results && res.return_data.Results.length > 0) {
            let all = [
              {
                ID: 0,
                Name: '全部'
              }
            ]
            this.secondCategoryList = [...all, ...res.return_data.Results]
          }
        }
      })
    },
    resetData() {
      this.list = []
      this.sForm.PageIndex = 1
      this.finished = false
    },
    refresh() {
      this.total = 0
      this.sForm.PageIndex = 1
      this.list = []
      this.finished = false
      this.getData()
    },
    getData() {
      let data = {
        ...this.sForm,
        SaleStatus: this.activiyTabIndex === 0 ? 1 : 0,
        CategoryId: this.tabIndexL,
        SysSecondCategoryId: this.activeId,
        GoodsName: this.keyword
      }
      apiCloud({
        url: '/api/v1/Goods/GoodsList',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          let result = res.return_data.Results || []
          result.map(item => (item.checked = false))
          this.total = res.return_data.TotalCount || 0
          this.list = [...this.list, ...result]
          this.finished = result.length < this.sForm.PageSize
        }
      })
    },
    showToast(connect) {
      uni.showToast({
        title: connect,
        duration: 1500,
        mask: true,
        icon: 'none'
      })
    },
    // 添加库存
    BatchStockAdd() {
      let Stock = this.batchSetStock - 0
      if (Stock < 1 || Stock > 99999) {
        this.showToast('库存限制1-99999')
        return
      }
      let isWarehouse = 0
      this.activiyTabIndex === 0 ? (isWarehouse = 0) : (isWarehouse = 1)
      let data = {
        goodList: this.goodstList,
        stockCount: Number(this.batchSetStock),
        isWarehouse, // 0-销售中 1-仓库中
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
            this.show = false
            this.activiyStockTabIndex = 0
            this.refresh()
          }, 1500)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/tab.scss';
.tabs {
  position: fixed;
  width: 100%;
  z-index: 111;
  left: 0;
  top: 130rpx;
}
.sort-content {
  display: flex;
  margin-top: 200rpx;
  .sort-left {
    width: 170rpx;
    line-height: 86rpx;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    overflow-y: auto;
    padding-top: 236rpx;
    padding-bottom: 102rpx;
    box-sizing: border-box;
    background: #fff;
    .sort-itemL {
      font-size: 28rpx;
      text-align: center;
      &.on {
        background: #f7f7f7;
      }
    }
  }
  .sort-right {
    flex: 1;
    margin: 30rpx 25rpx 0 190rpx;
    .sort-itemR {
      position: relative;
      width: 100%;
      background: #fff;
      border-radius: 10rpx;
      display: flex;
      margin-top: 20rpx;
      .head-img {
        width: 200rpx;
        height: 200rpx;
      }
      .right-content {
        flex: 1;
        padding: 25rpx 20rpx 0 23rpx;
        .title {
          font-size: 26rpx;
          word-break: break-all;
          line-height: 34rpx;
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          text-overflow: ellipsis;
          -webkit-line-clamp: 1;
        }
        .price {
          font-size: 30rpx;
          color: var(--theme-color, $uni-color-primary);
          margin-top: 30rpx;
        }
        .count {
          font-size: 24rpx;
          color: #999;
          margin-top: 15rpx;
        }
      }
      &:nth-of-type(1) {
        margin-top: 0rpx !important;
      }
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
.second-list {
  position: fixed;
  width: 100%;
  left: 170rpx;
  top: 230rpx;
  display: flex;
  z-index: 111;
  background: #f5f5f5;
  .scroll-view_H {
    width: 600rpx;
    height: 90rpx;
    line-height: 90rpx;
    background: #f5f5f5;
    border-radius: 10rpx;
    padding: 0 30rpx 0 10rpx;
    white-space: nowrap;
    background-color: #f5f5f5;
    box-sizing: border-box;
    .scroll-view-item {
      display: inline-block;
      text-align: center;
      line-height: 42rpx;
      font-size: 26rpx;
      font-weight: 500;
      color: #999;
      padding: 4rpx 32rpx;
      margin: 0 10rpx;
      position: relative;
      background: #ffffff;
      border-radius: 22rpx;
    }
    .active {
      color: var(--theme-color, $uni-color-primary);
      font-weight: bold;
      border: 1rpx solid var(--theme-color, $uni-color-primary);
    }
  }
}
.second-list-height {
  height: 90rpx;
  background: #f5f5f5;
}
.controlBtn {
  height: 100rpx;
  .controlBtnFixed {
    height: 100rpx;
    position: fixed;
    justify-content: flex-end;
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
  }
  .btn {
    width: 165rpx;
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
    &.plain {
      color: var(--theme-color, $uni-color-primary);
      background-color: #fff;
      border: 1px solid var(--theme-color, $uni-color-primary);
    }
  }
  .checkboxWrapper {
    width: 130rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.list-item-active {
  border: 1px solid var(--theme-color, $uni-color-primary);
}
.content-wrap {
  position: absolute;
  right: 0rpx;
  bottom: -2rpx;
  .icon-checked {
    transform: translateY(-50%);
    bottom: 5rpx;
    font-size: 40rpx;
    color: var(--theme-color, $uni-color-primary);
  }
}
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
  &:not(:nth-of-type(1)) {
    border-top: 1px dashed #eee;
  }
  position: relative;
  z-index: 0;
}
.inputUibackend {
  width: 230rpx;
  height: 70rpx;
  padding-left: 20rpx;
  display: block;
  font-size: 28rpx;
  border: 1px solid #999;
  text-align: left;
}
.stock-tips {
  font-size: 22rpx;
  font-weight: 500;
  text-align: center;
  color: #999999;
  line-height: 40rpx;
}
.img-wrap {
  position: relative;
  text {
    position: absolute;
    left: 0rpx;
    top: 0rpx;
    display: inline-block;
    width: 90rpx;
    height: 36rpx;
    opacity: 0.9;
    background: #999999;
    border-radius: 10rpx 0rpx 18rpx 0rpx;
    text-align: center;
    color: #ffffff;
    line-height: 40rpx;
    font-size: 22rpx;
  }
}
.search {
  position: fixed;
  width: 100%;
  height: 130rpx;
  left: 0;
  top: 0;
  z-index: 998;
  padding: 35rpx;
  background: #fff;
}
</style>
