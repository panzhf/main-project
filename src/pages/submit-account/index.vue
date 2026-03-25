<template>
  <view class="container" :style="themeVars">
    <!-- 顶部 -->
    <view class="container-header" :style="{ height: activiyTabIndex === 0 ? '380rpx' : '85rpx' }">
      <tab
        v-if="type !== 2"
        :tab="activiyTab"
        :draw-height="5"
        :draw-width="70"
        :active-index.sync="activiyTabIndex"
        :active-bag-color="themeInfo.color"
        @change="handleTabChange"
      ></tab>
      <!-- =========0已报销 搜索============= -->
      <view v-if="activiyTabIndex === 0">
        <view class="search-box">
          <selector-picker
            v-model="typeValue"
            class="selector-width"
            :options="rewardTypeOPtion"
            :value="typeValue"
            range-key="label"
          ></selector-picker>
          <SelectorDate v-model="dateValue" class="flex-1 ml-20"></SelectorDate>
        </view>
        <view class="search-box">
          <selector-picker
            v-model="statusValue"
            class="selector-width"
            :options="statusOptions"
            range-key="label"
          ></selector-picker>
          <search-input
            v-model="keyValue"
            class="ml-20"
            placeholder=" 请输入报销订单号"
            @search="handleSearch"
          ></search-input>
        </view>
        <view class="fs-28 pl-20 pr-20 pt-20 pb-20 flex j-c-s-b">
          <view class="fw-bold">
            <text v-if="showConfirm" class="mr-20">
              已确认：
              <text class="primary-color">{{ ConfirmNumber }}</text>
            </text>
            <text v-if="showNotConfirm">
              待确认：
              <text class="primary-color">{{ NoConfirmNumber }}</text>
            </text>
          </view>
          <view v-if="showByNoBtn" class="edit-color" @click="handleTrigger">
            <text
              class="iconfont fs-24 mr-10"
              :class="showByNo ? 'icon-anquanchakanicon' : 'icon-andanchakanicon'"
            ></text>
            按{{ showByNo ? '券' : '单号' }}查看
          </view>
        </view>
      </view>
    </view>
    <view :style="{ height: activiyTabIndex === 0 ? '380rpx' : '85rpx' }"></view>
    <!-- 内容 -->
    <!-- =====0 已确认========= -->
    <view v-if="activiyTabIndex === 0">
      <!-- 0 购物券 1赠品 -->
      <CouponItem
        v-if="typeValue === 0 || typeValue === 1"
        :list="list"
        :prize-type="typeValue"
        @comfirm="handleWriteoffCoupon"
      ></CouponItem>
      <!--2 提领券 3实物 -->
      <Item
        v-if="[2, 3, 4].includes(typeValue)"
        :list="list"
        :show-by-no="showByNo"
        :prize-type="typeValue"
        @comfirm="handleWriteoffCoupon"
      ></Item>
      <none-data v-if="list.length === 0 && !isLoading" msg="暂无记录~" icon-width="256" icon-height="190" />
      <load-more v-if="list.length" :has-more="!finished" />
    </view>
    <!-- =====1 未报销========= -->
    <view v-if="activiyTabIndex === 1" class="noConfirm-wrap">
      <view class="top mb-20">
        <u-icon name="hourglass" color="#ff655b" size="32"></u-icon>
        <text class="top-text">
          奖品的报销由门店的直属上级或业务员进行线下报销再通过线上确认。
          <!-- 奖品的报销由你的直属上级{{ SuperiorName }}进行线下报销再通过线上确认，请联系相关人员咨询。 -->
        </text>
      </view>
      <UnsubmitPickupItem :info="unsubmitPickupInfo" type="pickup"></UnsubmitPickupItem>
      <UnsubmitCloundItem :list="list2" type="clound"></UnsubmitCloundItem>
      <UnsubmitProductItem :info="unsubmitProductInfo" type="product"></UnsubmitProductItem>
    </view>

    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
    ></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>
<script>
import Tab from '@/components/tab/index.vue'
import { filterRmb } from '@/filters'
import SelectorDate from '@/components/search/selector-date'
import CouponItem from './comps/coupon-item'
import Item from './comps/item'
import UnsubmitItem from './comps/unsubmit-item'
import { apiCloud } from '@/api/cloud-store'
import SearchInput from '@/components/search/search-input'
import SelectorPicker from '@/components/search/selector-picker'
import AssetsInfo from '@/mixins/assets-info'
import overdueMixin from 'packages/mixins/overdue'
import LoadMore from '@/components/load-more'
import {
  apiPickupListRecord,
  apiGiftListRecord,
  apiPickupConfirm,
  apiGiftConfirm,
  apiNotConfirmPickup,
  apiNotConfirmGift,
  apiGetStorePageByAsset
} from '@/api/pick-coupon'
export default {
  components: {
    Tab,
    SearchInput,
    SelectorPicker,
    SelectorDate,
    CouponItem,
    Item,
    UnsubmitCloundItem: UnsubmitItem,
    UnsubmitPickupItem: UnsubmitItem,
    UnsubmitProductItem: UnsubmitItem,
    LoadMore
  },
  filters: { filterRmb },
  mixins: [AssetsInfo, overdueMixin],
  data() {
    return {
      isLoading: false,
      customStyle: {
        width: '120rpx',
        height: '70rpx',
        fontSize: '30rpx'
      },
      typeValue: 2, // 奖励类型,默认奖项类型是提领券
      statusValue: -1, // 报销状态
      keyValue: '', // 关键字
      dateValue: '', // 日期
      reimburseInfo: {}, // 需要核销的信息
      showPopup: false, // true 显示弹窗
      popType: 'tip', //弹窗类型
      popTitle: '', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '去设置', // 弹窗确认按钮文案
      popCancelText: '跳过', // 弹窗取消按钮文案
      show: false,
      ConfirmNumber: 0,
      NoConfirmNumber: 0,
      SuperiorName: '',
      searchStamp: 0,
      activiyTab: ['已报销', '未报销'],
      rewardTypeOPtion: [
        //  奖品类型
        {
          val: 2,
          label: '提领券'
        },
        {
          val: 4,
          label: '返货券'
        },
        {
          val: 0,
          label: '购物券'
        },
        {
          val: 1,
          label: '赠品'
        },
        {
          val: 3,
          label: '实物'
        }
      ],
      cloundStatusOPtion: [
        //  云店 报销状态
        {
          val: -1,
          label: '报销状态'
        },
        {
          val: 1,
          label: '待确认'
        },
        {
          val: 0,
          label: '已确认'
        }
      ],
      noCloundStatusOPtion: [
        //非云店  报销状态
        {
          val: -1,
          label: '报销状态'
        },
        {
          val: 0,
          label: '待确认'
        },
        {
          val: 1,
          label: '已确认'
        },
        {
          val: 4,
          label: '处理中'
        },
        {
          val: 5,
          label: '处理失败'
        }
      ],
      activiyTabIndex: 0,
      list: [],
      list2: [],
      maxId: 0,
      totalCount: 0,
      form: {
        PageIndex: 1,
        PageSize: 10
      },
      finished: false,
      unsubmitPickupInfo: {}, // 提领券未 报销数据
      unsubmitProductInfo: {}, // 实物未 报销数据
      showByNo: true, // 是否显示按单号查看
      showByNoBtn: true
    }
  },
  computed: {
    startDate() {
      if (!this.dateValue) return ''
      let dateArr = this.dateValue.split(',')
      return dateArr[0]
    },
    endDate() {
      if (!this.dateValue) return ''
      let dateArr = this.dateValue.split(',')
      return dateArr[1]
    },
    statusOptions() {
      return this.typeValue === 0 || this.typeValue === 1 ? this.cloundStatusOPtion : this.noCloundStatusOPtion
    },
    showNotConfirm() {
      let val = false
      if ((this.typeValue === 0 || this.typeValue === 1) && this.statusValue !== 0) {
        val = true
      } else if ([2, 3, 4].includes(this.typeValue) && this.statusValue !== 1) {
        val = true
      }
      return val
    },
    showConfirm() {
      let val = false
      if ((this.typeValue === 0 || this.typeValue === 1) && this.statusValue !== 1) {
        val = true
      } else if ([2, 3, 4].includes(this.typeValue) && this.statusValue !== 0) {
        val = true
      }
      return val
    },
    isParaChange() {
      return `${this.typeValue}${this.statusValue}${this.dateValue}`
    }
  },
  watch: {
    typeValue(val) {
      this.showByNoBtn = [2, 4].includes(val)
      this.showByNo = true
      // 选择类型
      this.resetSearch()
    },
    isParaChange() {
      this.handleSearch()
    }
  },
  async onLoad() {
    if (this.isGetAssetsInfo) {
      await this.$store.dispatch('getAssetInfo')
    }
    this.handleTabChange()
    // 更新是否需要升级提示
    this.$store.dispatch('upgradeTip/updateNeedUpgradeTip')
  },
  onReachBottom() {
    if (this.finished || this.activiyTabIndex === 1) return
    this.form.PageIndex++
    // 赠品 购物券
    if (this.typeValue === 0 || this.typeValue === 1) this.getData()
    // 提领券
    if (this.typeValue === 2 || this.typeValue === 4) this.fetchData(1)
    // 实物
    if (this.typeValue === 3) this.fetchData(2)
  },
  methods: {
    // 一级tab栏的回调
    async handleTabChange() {
      if (this.activiyTabIndex === 0) await this.resetSearch('init')
      this.handleSearch()
    },
    resetSearch(type) {
      return new Promise(resolve => {
        if (type === 'init') {
          this.typeValue = this.returnCouponFirst ? 4 : 2
        }
        this.statusValue = -1
        this.keyValue = ''
        this.dateValue = ''
        resolve()
      })
    },
    // 搜索按钮的回调
    handleSearch() {
      setTimeout(() => {
        this.list = []
        this.list2 = []
        this.maxId = 0
        this.form.PageIndex = 1
        this.finished = false
        if (this.activiyTabIndex === 0) {
          // 赠品 购物券
          if (this.typeValue === 0 || this.typeValue === 1) this.getData()
          // 提领券
          if (this.typeValue === 2 || this.typeValue === 4) this.fetchData(1)
          // 实物
          if (this.typeValue === 3) this.fetchData(2)
        } else {
          this.getNotReimburseStatistical()
        }
      }, 200)
    },
    previewImg(item, e) {
      const index = e
      const imgArr = item
      uni.previewImage({
        current: imgArr[index], // 当前图片地址
        urls: imgArr, // 所有要预览的图片的地址集合 数组形式
        success: function (res) {},
        fail: function (res) {},
        complete: function (res) {}
      })
    },
    handleDetail(t) {
      uni.navigateTo({
        url: t
      })
    },
    handleWriteoffCoupon(e) {
      if (!this.overdueChecked()) return

      this.reimburseInfo = e || {}
      // 报销
      this.handleOpen()
    },
    // 打开报销的弹窗
    handleOpen() {
      this.popType = 'confirm'
      this.popTitle = '报销？'
      this.popContent = '确认报销后无法撤销！您是否确定报销明细已全部报销？'
      this.popConfirmText = '确定'
      this.popCancelText = '取消'
      this.showPopup = true
    },
    // 弹窗确认报销的回调
    handleConfirm() {
      if (this.typeValue === 0 || this.typeValue === 1) {
        // 购物券和赠品报销
        apiCloud({
          url: '/api/v1/Reimburse/ConfirmReimburse',
          method: 'post',
          data: JSON.stringify({ ReimburseNo: this.reimburseInfo.expenseNo })
        })
          .then(res => {
            if (this.$ck(res)) {
              this.reimburerSuccess()
            }
          })
          .catch(() => {
            // 接口异常重置
          })
      } else if (this.typeValue === 2 || this.typeValue === 4) {
        // 报销提领券 返货券
        this.pickupConfirm()
      } else if (this.typeValue === 3) {
        // 报销实物
        this.giftConfirm()
      }
    },

    reimburerSuccess() {
      this.$msg('报销成功', { icon: 'success' })
      this.showPopup = false
      setTimeout(() => {
        this.handleSearch()
      }, 2000)
    },

    pickupConfirm() {
      // 提领券返货券 报销
      apiPickupConfirm({
        expenseno: this.reimburseInfo.expenseNo,
        type: this.typeValue === 2 ? 1 : 14
      }).then(res => {
        if (this.$ck(res)) {
          this.reimburerSuccess()
        }
      })
    },
    giftConfirm() {
      // 实物报销
      apiGiftConfirm({
        expenseno: this.reimburseInfo.expenseNo,
        id: this.reimburseInfo.id
      }).then(res => {
        if (this.$ck(res)) {
          this.reimburerSuccess()
        }
      })
    },
    fetchData(mode) {
      // 2 实物   1 提领券 返货券
      // 提领券 返货券 按券查看拆分了2个接口
      const requestApi = mode === 1 ? (this.showByNo ? apiPickupListRecord : apiGetStorePageByAsset) : apiGiftListRecord
      let type = mode === 1 ? { type: this.typeValue === 2 ? 1 : 14 } : {}
      if (this.isLoading) return
      this.isLoading = true
      // 按券查看换了入参字段名
      let query =
        mode === 1 && !this.showByNo
          ? {
              pageindex: this.form.PageIndex,
              pagesize: this.form.PageSize,
              starttime: this.startDate || '',
              endtime: this.endDate || '',
              status: this.statusValue,
              expensenokeyword: this.keyValue,
              ...type
            }
          : {
              pageindex: this.form.PageIndex,
              pagesize: this.form.PageSize,
              dealerid: -1, //经销商id  -1全部
              starttime: this.startDate || '',
              endtime: this.endDate || '',
              maxid: 0,
              status: this.statusValue,
              keyword: this.keyValue,
              ...type
            }
      requestApi(query)
        .then(res => {
          this.isLoading = false
          if (this.$ck(res)) {
            let { totalcount, adconfirmcount, maxid, list, unconfirmcount, extend } = res.return_data
            this.totalCount = totalcount
            this.ConfirmNumber = mode === 1 && !this.showByNo ? extend.confirmcount : adconfirmcount
            this.NoConfirmNumber = mode === 1 && !this.showByNo ? extend.waitconfirmcount : unconfirmcount
            this.maxId = maxid
            this.list = [...this.list, ...list]
            this.finished = list.length < this.form.PageSize
          }
        })
        .catch(() => {
          this.isLoading = false
        })
    },
    // 查看切换
    handleTrigger() {
      this.list = []
      this.showByNo = !this.showByNo
      this.handleSearch()
    },
    getData() {
      // 赠品  购物券
      if (this.isLoading) return
      this.isLoading = true
      let data = {
        ...this.form,
        keyword: this.keyValue,
        ReimburseStatus: this.statusValue,
        PrizeType: this.typeValue,
        ReimburseObjectType: -1,
        ReimburseTimeStart: this.startDate || '',
        ReimburseTimeEnd: this.endDate || ''
      }
      apiCloud({
        url: '/api/v1/Reimburse/MyReimburseRecordList',
        method: 'post',
        data: JSON.stringify(data)
      })
        .then(res => {
          this.isLoading = false
          if (this.$ck(res)) {
            let result = res.return_data.ReimburseRecordResponseList.Results || []
            this.ConfirmNumber = res.return_data.ConfirmNumber || 0
            this.NoConfirmNumber = res.return_data.NoConfirmNumber || 0
            this.list = [...this.list, ...result]
            this.list.forEach(item => {
              if (item.ReimburseCredentials) {
                item.imgArr = item.ReimburseCredentials.split(',')
              }
            })
            this.finished = result.length < this.form.PageSize
          }
        })
        .catch(() => {
          this.isLoading = false
        })
    },

    getNotReimburseStatistical() {
      // 获取未报销的赠品与购物券的数据
      apiCloud({
        url: '/api/v1/Reimburse/NotReimburseStatistical',
        method: 'post',
        data: JSON.stringify({})
      }).then(res => {
        if (this.$ck(res, false)) {
          let result = res.return_data.AmountReimburseList || []
          this.list2 = result
          this.SuperiorName = res.return_data.SuperiorName || ''
        } else if (res.return_msg !== '未找到店铺数据') {
          // 接口返回问题，无数据不应该提示报错
          this.$msg(res.return_msg)
        }
      })

      let param = {
        starttime: this.startDate || '',
        endtime: this.endDate || '',
        keyword: this.keyValue,
        pageindex: this.form.PageIndex,
        pagesize: this.form.PageSize,
        maxid: 0
      }
      apiNotConfirmPickup(param).then(res => {
        if (this.$ck(res)) {
          this.unsubmitPickupInfo = res.return_data
        }
      })

      apiNotConfirmGift(param).then(res => {
        if (this.$ck(res)) {
          this.unsubmitProductInfo = res.return_data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  background: #f5f5f5;
}
.search-box {
  display: flex;
  margin: 20rpx 30rpx 20rpx 30rpx;
}

.setCustomTime {
  background-color: #fff;
  padding: 20rpx 0;
  position: relative;
  .pickerWrapper {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 15rpx;
    height: 100%;
    .picker-box {
      display: block;
      height: 63rpx;
      border-radius: 32rpx;
      background-color: #f0f0f0;
      color: #666;
      font-size: 26rpx;
      padding: 0 65rpx;
      margin: 0 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.drop-box {
  background-color: #fff;
  font-weight: 700;
}

.seach {
  position: relative;
}

.noConfirm-wrap {
  .top {
    padding: 20rpx 40rpx;
    background-color: #fff5f1;
    color: #ff5e33;
    font-size: 24rpx;
    display: flex;
    .top-text {
      margin-left: 10rpx;
    }
  }
}
.selector-width {
  width: 250rpx;
  flex-shrink: 0;
}
.j-c-s-b {
  justify-content: space-between;
}
.edit-color {
  color: #0f80ff;
}
</style>
