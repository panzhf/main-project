<template>
  <view :style="mergedStyle" class="register-store-page">
    <TitleBar
      :title="registerPageTitle"
      :bgcolor="registerBgColor"
      :bg-pic="registerBgUrl"
      :textcolor="registerTextColor"
    />
    <image v-if="registerBgUrl" :src="registerBgUrl" mode="widthFix" class="register-bg" />
    <!-- <invite-tip v-if="[1, 2].includes(step)" :from="dealerName" :memberlogin="memberloginName" /> -->
    <template v-if="step === 1 || showAll">
      <view class="form-box">
        <view v-if="showAll" class="form-title">负责人信息</view>
        <template v-if="isYzmMode">
          <info-cell is-middle is-needed is-input>
            <view slot="left">手机号</view>
            <input
              slot="right"
              v-model.trim="form.mobile"
              type="number"
              placeholder-class="placeholder"
              placeholder="请输入手机号"
              :maxlength="11"
              :focus="autoFocus"
              class="input"
            />
          </info-cell>
          <info-cell is-middle is-needed is-input>
            <view slot="left" class="text-left">验证码</view>
            <view slot="right" class="flex flex-middle">
              <input
                v-model.trim="yzm"
                type="number"
                placeholder="请输入验证码"
                placeholder-class="placeholder"
                :maxlength="6"
                class="flex-1 input"
                @focus="toggleBlur(0)"
                @blur="toggleBlur(1)"
              />
              <VerifyCode :mobile="form.mobile" />
            </view>
          </info-cell>
          <CodeTip :value="yzm" :is-blur="isCodeBlur" custom-style="padding-left: 202rpx" />
        </template>
        <info-cell v-else is-middle is-needed :is-two-line="false">
          <view slot="left">手机号</view>
          <view slot="right" class="flex">
            <view class="tx-l flex-1">{{ form.mobile }}</view>
            <button
              class="mobile-btn"
              :open-type="openType"
              :phone-number-no-quota-toast="false"
              hover-class="button-action"
              @getphonenumber="handleGetPhoneNumber"
            >
              微信授权手机号
            </button>
          </view>
        </info-cell>
        <VerifyCodeChange v-if="!isYzmMode" v-model="byYzm" custom-class="pt-10 pb-20" />
        <info-cell v-if="rules.Name.show" is-middle is-input :is-needed="rules.Name.required">
          <view slot="left">{{ leaderTitle }}</view>
          <input
            slot="right"
            v-model.trim="form.leader"
            type="text"
            class="input"
            :maxlength="16"
            placeholder-class="placeholder"
            :placeholder="leaderPlaceholder"
          />
        </info-cell>
      </view>
    </template>
    <template v-if="step === 2 || showAll">
      <view id="basic-info-form" class="form-box">
        <view class="form-title">基本信息</view>
        <info-cell v-if="rules.ShopNo.show" is-middle is-input :is-needed="rules.ShopNo.required">
          <view slot="left">门店编号</view>
          <input
            slot="right"
            v-model.trim="form.storeno"
            type="text"
            class="input"
            :maxlength="20"
            :disabled="form.isreuse || disabledStoreno"
            placeholder-class="placeholder"
            placeholder="20个字，仅含英文、数字、- _"
          />
        </info-cell>
        <view
          v-if="rules.ShopName.show"
          id="store-name-wrap"
          class="store-name-wrap"
          :class="{ 'store-name-wrap--list-visible': showStoreSuggestionsList }"
        >
          <info-cell is-middle is-input :is-needed="rules.ShopName.required">
            <view slot="left">门店名称</view>
            <view slot="right" class="flex flex-middle flex-1">
              <input
                v-model.trim="form.storename"
                type="text"
                class="input flex-1"
                :maxlength="30"
                placeholder-class="placeholder"
                placeholder="最多30个字"
                @focus="onStoreNameFocus"
                @blur="onStoreNameBlur"
                @input="onStoreNameInput"
              />
              <u-loading
                v-if="storeSuggestionsLoading"
                mode="flower"
                size="32"
                color="#FF7640"
                class="store-name-loading ml-10"
              />
            </view>
          </info-cell>
          <!-- 门店搜索建议列表：输入超过 2 字且过滤结果有值时才显示；超过 3 条显示滚动条 -->
          <view
            v-if="showStoreSuggestionsList"
            class="store-suggestions"
          >
            <scroll-view
              scroll-y
              show-scrollbar="true"
              class="store-suggestions-scroll"
            >
              <view
                v-for="item in storeSuggestionsList"
                :key="item.id"
                class="store-suggestion-item"
                @tap="onSelectStoreSuggestion(item)"
              >
                <text class="store-suggestion-name">{{ item.name }}</text>
                <text class="store-suggestion-address">{{ item.address }}</text>
              </view>
            </scroll-view>
          </view>
        </view>
        <info-cell v-if="rules.PartShopName.show" is-middle is-input :is-needed="rules.PartShopName.required">
          <view slot="left">分店名</view>
          <input
            slot="right"
            v-model.trim="form.branchname"
            type="text"
            class="input"
            :maxlength="10"
            placeholder-class="placeholder"
            placeholder="最多10个字"
          />
        </info-cell>
        <info-cell
          v-if="rules.ShopAddress.show"
          is-middle
          :is-needed="rules.ShopAddress.required"
          @tap="handleEditAdress"
        >
          <view slot="left">门店地址</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ fullAddress || '选择省市区' }}
            </view>
            <view class="icon iconfont icon-arrow-right fs-20"></view>
          </view>
        </info-cell>
        <view v-if="rules.ShopFor.show">
          <info-cell is-middle :is-show-line="false" :is-needed="rules.ShopFor.required">
            <view slot="left">
              门头照
              <text class="fs-22 c-9 ml-10">(需要看到完整的门店名称和招牌)</text>
            </view>
          </info-cell>
          <info-cell is-middle :is-two-line="false" is-input :is-show-left="false">
            <view slot="right" class="pb-20" style="margin-left: -30rpx">
              <!-- <upload v-model="shopFor"></upload> -->
              <UploadImages v-model="shopFor" />
            </view>
          </info-cell>
        </view>
        <view v-if="rules.BusinessLicense.show">
          <info-cell is-middle :is-show-line="false" :is-needed="rules.BusinessLicense.required">
            <view slot="left">
              营业执照
              <text class="fs-22 c-9 ml-10">(彩色照片，并在有效期内)</text>
            </view>
          </info-cell>
          <info-cell is-middle :is-two-line="false" is-input :is-show-left="false">
            <view slot="right" class="pb-20" style="margin-left: -30rpx">
              <!-- <upload v-model="license"></upload> -->
              <UploadImages v-model="license" />
            </view>
          </info-cell>
        </view>
        <info-cell
          v-if="rules.TheirDealer.show"
          is-middle
          :is-needed="rules.TheirDealer.required"
          @tap="showDealer = true"
        >
          <view slot="left">所属经销商</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ dealerInfo.dealername || '请选择' }}
            </view>
            <view class="icon iconfont icon-arrow-right fs-20"></view>
          </view>
        </info-cell>
        <info-cell v-if="rules.Remark.show" is-middle is-input :is-needed="rules.Remark.required">
          <view slot="left">备注</view>
          <input
            slot="right"
            v-model.trim="form.remark"
            class="input"
            :maxlength="50"
            placeholder-class="placeholder"
            :placeholder="remarkPlaceholder"
          />
        </info-cell>
        <info-cell v-if="rules.StoreType.show" is-middle :is-needed="rules.StoreType.required" @tap="showStore = true">
          <view slot="left">门店类型</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ storeInfo.name || '选择门店类型' }}
            </view>
            <view class="icon iconfont icon-arrow-right fs-20"></view>
          </view>
        </info-cell>
        <info-cell v-if="rules.ShopSize.show" is-middle :is-needed="rules.ShopSize.required" @tap="showShopSize = true">
          <view slot="left">店铺面积</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ shopSize.name || '选择店铺面积' }}
            </view>
            <view class="icon iconfont icon-arrow-right fs-20"></view>
          </view>
        </info-cell>

        <info-cell v-if="rules.WeChat.show" is-middle is-input :is-needed="rules.WeChat.required">
          <view slot="left">微信号</view>
          <input
            slot="right"
            v-model.trim="form.wxno"
            class="input"
            :maxlength="20"
            placeholder-class="placeholder"
            placeholder="最多20个字"
          />
        </info-cell>
        <info-cell v-if="rules.QQ.show" is-middle is-input :is-needed="rules.QQ.required">
          <view slot="left">QQ号</view>
          <input
            slot="right"
            v-model.trim="form.qqno"
            class="input"
            type="number"
            :maxlength="15"
            placeholder-class="placeholder"
            placeholder="最多15个字"
          />
        </info-cell>
        <info-cell v-if="rules.Email.show" is-middle is-input :is-needed="rules.Email.required">
          <view slot="left">邮箱</view>
          <input
            slot="right"
            v-model.trim="form.email"
            class="input"
            :maxlength="50"
            placeholder-class="placeholder"
            placeholder="最多50个字"
          />
        </info-cell>
      </view>
      <view v-if="showServiceBlock" class="form-box">
        <view class="form-title">服务信息</view>
        <view v-if="rules.ShopPic.show">
          <info-cell is-middle :is-show-line="false" :is-needed="rules.ShopPic.required">
            <view slot="left">
              门店图片
              <text class="fs-22 c-9 ml-10">(最多9张)</text>
            </view>
          </info-cell>
          <info-cell is-middle :is-two-line="false" is-input :is-show-left="false">
            <view slot="right" class="pb-20" style="margin-left: -30rpx">
              <!-- <upload v-model="shopPic" :max-length="9"></upload> -->
              <UploadImages v-model="shopPic" :max-length="9" multiple />
            </view>
          </info-cell>
        </view>
        <info-cell v-if="rules.ShopPhone.show" is-middle is-input :is-needed="rules.ShopPhone.required">
          <view slot="left">门店电话</view>
          <input
            slot="right"
            v-model.trim="form.phoneno"
            class="input"
            :maxlength="20"
            placeholder-class="placeholder"
            placeholder="最多20个字"
          />
        </info-cell>
        <info-cell v-if="rules.PerPrice.show" is-middle is-input :is-needed="rules.PerPrice.required">
          <view slot="left">人均价格</view>
          <input
            slot="right"
            v-model.trim="form.percapita"
            class="input"
            :maxlength="16"
            placeholder-class="placeholder"
            placeholder="单位（元），例如88.88"
          />
        </info-cell>
        <info-cell v-if="rules.BusinessHours.show" is-middle is-input :is-needed="rules.BusinessHours.required">
          <view slot="left">营业时间</view>
          <input
            slot="right"
            v-model.trim="form.businesshours"
            class="input"
            :maxlength="20"
            placeholder-class="placeholder"
            placeholder="10:00~21:00"
          />
        </info-cell>
        <info-cell
          v-if="rules.Recommend.show"
          is-input
          cell-style="padding-top: 30rpx"
          :is-needed="rules.Recommend.required"
        >
          <view slot="left">推荐</view>
          <md-textarea slot="right" v-model="form.recommend" placeholder="如：推荐菜、商品、房间" />
        </info-cell>
        <info-cell
          v-if="rules.SellingPoint.show"
          is-input
          cell-style="padding-top: 30rpx"
          :is-needed="rules.SellingPoint.required"
        >
          <view slot="left">特色服务</view>
          <md-textarea ref="characteristicTextareaRef" slot="right" v-model="form.characteristic" placeholder="如：免费停车、WIFI" :max-length="50" />
        </info-cell>
        <info-cell
          v-if="rules.BriefIntro.show"
          is-input
          cell-style="padding-top: 30rpx"
          :is-needed="rules.BriefIntro.required"
        >
          <view slot="left">简介</view>
          <md-textarea
            slot="right"
            v-model="form.introduction"
            placeholder="对品牌或门店的简单介绍"
            :max-length="300"
          />
        </info-cell>
      </view>
    </template>
    <button
      v-if="step === 1 && !showAll"
      class="primary-btn round ml-30 mr-30"
      :class="{ disabled: !isValid }"
      @click="handleNextStep(2)"
    >
      下一步
    </button>
    <view v-if="showRegisterPageDecoration" class="p-r">
      <view v-for="(decorationItem, decorationIndex) in registerDecoration" :key="decorationIndex" class="p-r">
        <template v-if="decorationItem.code === 'RegisterImageAd'">
          <image-ad :img-data="decorationItem.data" />
        </template>
        <template v-if="decorationItem.code === 'RegisterBlankSegmente'">
          <blank-segmente :blank-data="decorationItem.data" />
        </template>
      </view>
    </view>
    <template v-if="step === 2 || showAll">
      <!-- 门店建议展开或门店名称聚焦时增加底部可滚动空间，保证能滚到顶部 -->
      <view v-if="(showStoreSuggestionsList || storeNameFocused) && rules.ShopName.show" class="store-suggestions-spacer" />
      <view style="height: 240rpx"></view>
      <view class="btn-group">
        <button class="primary-btn round" hover-class="button-action" @tap="handleSubmit()">提 交</button>
        <button
          v-if="!showAll"
          class="primary-btn plain round mt-20"
          hover-class="button-action"
          @click="handleNextStep(1)"
        >
          上一步
        </button>
      </view>
    </template>
    <view v-if="step >= 3" class="success-content bg-f flex flex-column flex-middle">
      <text class="iconfont icon-success"></text>
      <template v-if="step === 3 && needAudit">
        <view class="fs-36 fw-bold">注册资料提交成功，请等待审核~</view>
        <button :disabled="isSubscribe" class="primary-btn round" hover-class="button-action" @tap="handleSubscribe">
          {{ isSubscribe ? '已订阅' : '审核结果通知我' }}
        </button>
        <button class="primary-btn round inverse plain" hover-class="button-action" @tap="handleGoIndex">
          回到首页
        </button>
      </template>
      <template v-else>
        <view class="fs-36 fw-bold">注册门店成功！</view>
        <button class="primary-btn round" hover-class="button-action" @tap="handleSSOLogin(1)">立即扫码</button>
        <button class="primary-btn round inverse plain" hover-class="button-action" @tap="handleSSOLogin(0)">
          进入门店
        </button>
      </template>
    </view>

    <dealer-picker
      ref="dealerPickerRef"
      v-model="showDealer"
      :memberlogin="m"
      :dealer-id="dealerInfo.id"
      :dxm-dealer-id="dxmDealerId"
      show-origin
      :lanandlat="form.lanandlat"
      @submit="onPickerConfirm($event, 'd')"
    />
    <store-picker
      v-model="showStore"
      :memberlogin="m"
      :store-id="storeInfo.id"
      @submit="onPickerConfirm($event, 's')"
    />
    <area-picker
      v-model="showShopSize"
      :size-id="shopSize.id"
      :memberlogin="m"
      @submit="onPickerConfirm($event, 'a')"
    />
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      :pop-hide-button="tipType === 6"
      max-size
      @cancel="onCancel"
      @confirm="onConfirm"
      @close="onClose"
    >
      <scroll-view v-if="tipType === 3" scroll-y style="max-height: 500rpx">
        <view v-for="item in storeList" :key="item.storeid" class="store-item flex text-left" @tap="handleChoose(item)">
          <text
            :class="[
              'iconfont',
              selectStore.storeid === item.storeid ? 'icon-checked primary-color' : 'icon-unchecked c-9'
            ]"
          ></text>
          <text class="ml-20 wb-ba fs-28">{{ item.storename }}（{{ item.leader }} {{ item.mobile }}）</text>
        </view>
      </scroll-view>
      <view v-if="tipType === 6">
        <view class="fs-26 c-9 mt-10 mb-40">{{ codeTips }}</view>
        <button class="primary-btn size-small ml-20 mr-20" @tap="handExitMp">确定</button>
      </view>
    </common-popup>
    <common-popup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" max-size @close="onVerifyFail" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
    <!-- 点击输入框和建议列表外区域时关闭门店建议弹窗 -->
    <view v-if="showStoreSuggestionsList" class="store-suggestions-mask" @tap="onCloseStoreSuggestions" @touchmove.stop.prevent />
  </view>
</template>

<script>
import { apiGetWxCodeScene } from '@/api/cloud-store'
import { apiGetStoreInfo } from '@/api/sales'
import { apiGetRegisterInfo, apiCheckRelation, apiRelate, apiValidateCode, apiGetStoreBannerConfig } from '@/api/common'
import { apiGetStoreRegisterMobile, apiSubmitRegister } from '@/api/activity'
import { apiGetSubscribeTemplateId } from '@/api/cloud-store'
import VerifyCode from '@/components/verify-code'
// import DealerPicker from '@/components/people-picker/dealer-picker.vue'
import DealerPicker from 'packages/components/people-picker/dealer-picker.vue'
import StorePicker from '@/components/people-picker/store-picker.vue'
import AreaPicker from '@/components/people-picker/area-picker.vue'
import VerifyCodeChange from 'packages/components/phone-verify/change.vue'
import CodeTip from 'packages/components/phone-verify/code-tip.vue'
import UploadImages from 'packages/components/upload/upload'
import ImageAd from 'packages/design/basic/image-ad.vue'
import BlankSegmente from 'packages/design/basic/blank-segmente.vue'
import { simplePopupMixin } from '@/mixins/common-popup'
import subscribeMsgMixin from '@/mixins/subscribe-msg'
import { ssoLoginMixin } from '@/mixins/sso-login'
import phoneVerifyMixin, { yzmMixin, codeTipMixin } from 'packages/mixins/phone-verify'
import privacyMixin from 'packages/mixins/privacy'
import { getQuery } from '@/utils'
import { getJsCode } from '@/utils/set-mp'
import storeFocusLocationMixin from './mixins/store-location'
import { regMobile, regCode } from 'packages/utils/reg'
import { decorationLoginMixin } from '@/mixins/decoration'
import { apiRegisterPage } from '@/api/decoration'
import TitleBar from '@/components/title-bar/index.vue'
// import { staticURL } from '@/config'
export default {
  name: 'RegisterStore',
  components: {
    VerifyCode,
    VerifyCodeChange,
    CodeTip,
    DealerPicker,
    StorePicker,
    AreaPicker,
    UploadImages,
    ImageAd,
    BlankSegmente,
    TitleBar
  },
  mixins: [
    simplePopupMixin,
    subscribeMsgMixin,
    ssoLoginMixin,
    phoneVerifyMixin,
    yzmMixin,
    codeTipMixin,
    privacyMixin,
    decorationLoginMixin,
    storeFocusLocationMixin
  ],
  data() {
    return {
      leaderTitle: '',
      leaderPlaceholder: '',
      registerStyle: 1, // registerStyle 1默认的样式  2新增的版式
      m: '', // 商户编号
      activate: {
        mobile: '', //手机号
        activatetype: 0, //激活方式
        storeno: '', // 需要激活的门店编号
        activatenum: 0 // 未激活的数量
      }, // 激活信息
      authorizeurl: '',
      memberloginName: '',
      source: 2, // 2、总部邀请 4、经销商邀请 5、厂家业务员邀请 6、经销商业务员邀请 8、门店邀请有礼
      dealerId: 0, // 经销商id (0.总部)
      dealerName: '',
      salesmanId: '',
      salesmanNo: '', // 业务员编号
      promotionNo: '', // 门店码
      storeId: 0, // 邀请门店id，source=8传
      dxmDealerId: 0, // 动销码所属经销商id
      step: 0, // 1.负责人信息 2.门店信息 3.待审核 4.注册成功
      form: {
        mobile: '',
        leader: '',
        storeno: '',
        storename: '',
        branchname: '',
        address: '',
        lanandlat: '',
        dealerid: -1, //所属经销商（0：总部）
        remark: '',
        storetypeid: '',
        shopsize: '',
        wxno: '',
        qqno: '',
        email: '',
        phoneno: '',
        percapita: '',
        businesshours: '',
        recommend: '',
        characteristic: '',
        introduction: '',
        assistantopenid: '', // 消息订阅的openid
        isreuse: 0, // 是否复用
        smartMatchMdid: '' // 门店搜索带入时的匹配记录 id，提交时传给 commanage/storeregister
      },
      remarkPlaceholder: '',
      fullAddress: '',
      shopFor: [], // 店招
      license: [], // 营业执照
      shopPic: [], // 门店照片
      rules: {
        ShopNo: { show: 1, required: 1 },
        ShopName: { show: 1, required: 1 },
        ShopAddress: { show: 1, required: 1 }
      },
      dealerInfo: {},
      showDealer: false, // 所属经销商
      storeInfo: {},
      shopSize: {},
      showStore: false, // 门店类型
      showShopSize: false, // 店铺面积
      btnLoading: false,
      validInfo: {},
      tipType: 1, // 1.普通提示 2.登录 3.复用/关联 4.绑定确认 5.激活 6.邀请码失效 7.授权
      isMultiDealer: false, // 允许关联多个经销商
      storeList: [], // 复用/关联门店数据
      selectStore: {}, // 选择门店
      isSubscribe: false,
      needAudit: false, // 是否需要审核
      codeTips: '',
      memberLoginType: 0,
      isCustom: 0,
      code: 0,
      disabledStoreno: false, // 门店编号是否禁止输入
      checkedMobile: '', // 已完成 checkMobile 检查的手机号，避免重复弹窗
      // 装修相关属性
      registerPageTitle: '注册门店',
      registerBgColor: '#fff',
      registerTextColor: '#000',
      registerPageBgColor: '#f4f4f4',
      registerBgUrl: '',
      imageAdData: {
        Images: [] // 初始化防止组件报错
      },
      /** 注册页装修：图片广告、辅助分割（Decration/StoreRegisterPage，不含 RegisterPageSetting） */
      registerDecoration: []
    }
  },
  computed: {
    showAll() {
      return this.registerStyle === 2 && [1, 2].includes(this.step)
    },
    openId() {
      return this.$store.state.storeRegisterAuthResult?.openid
    },
    isValid() {
      return !!this.form.mobile && (this.isYzmMode ? regCode(this.yzm) : true)
    },
    showServiceBlock() {
      const k = ['ShopPic', 'ShopPhone', 'PerPrice', 'BusinessHours', 'Recommend', 'SellingPoint', 'BriefIntro']
      return k.some(item => !!this.rules[item]?.show)
    },
    registerPageStyle() {
      const s = []
      s.push(`background-color: ${this.registerPageBgColor}`)
      return s.join(';')
    },
    mergedStyle() {
      const styles = []
      if (this.themeVars) {
        styles.push(this.themeVars)
      }
      if (this.registerPageStyle) {
        styles.push(this.registerPageStyle)
      }
      return styles.join(';')
    },
    showRegisterPageDecoration() {
      return this.step < 3
    }
  },
  watch: {
    openId(v) {
      if (this.tipType === 7 && v) {
        this.$msg('授权成功！')
        this.tipType = 1
      }
    }
  },
  async onLoad(options) {
    // 隐藏home
    uni.hideHomeButton()
    if (options.scene) {
      // 小程序码： 参数太长通过接口转化
      const { s: k, t } = getQuery(decodeURIComponent(options.scene))
      const o = await this.parseScene(k, t)
      this.initOption(o)
    } else if (options.m) {
      // 兼容传参：其他应用（H5/小程序）直接跳转页面
      this.initOption(options)
    } else {
      this.queryError()
    }
    // 0是默认品牌商，1是汰渍定制
    this.memberLoginType = Number(options.memberLoginType) || 0
    this.memberLoginType === 1 && this.getStoreBannerConfig()

    this.isCustom = +options.isCustom || 0 // 从宝洁中转页中转过来
    this.redirecturl = options.redirecturl || 0 // 登录过来要自动跳转的路径
    if (!this.isCustom) {
      // 中转页已授权的可以不用再重复授权
      this.$store.dispatch('updateStoreRegisterAuthResult', {
        openid: ''
      })
    }
  },
  onShow() {
    this.$refs.privacyPopup && this.$refs.privacyPopup.refresh()  
    this.setAddress()
  },
  methods: {
    handleGoIndex() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    },
    async parseScene(k, t) {
      const { return_code, return_data } = await apiGetWxCodeScene({
        encryptKet: k,
        overflag: t,
        js_code: await getJsCode()
      })
      if (return_code === 0) {
        return getQuery(return_data.scene)
      }
      this.queryError()
    },
    queryError() {
      uni.showModal({
        title: '温馨提示',
        content: '参数异常，请重试或联系邀请方',
        showCancel: false,
        confirmText: '去登录',
        success: ({ confirm }) => {
          confirm && this.handleLogin()
        }
      })
    },
    initOption(o) {
      // console.log('参数：', o)
      const { m, d = 0, a, n, p, s, r, x, storeno } = o
      this.m = m
      this.dealerId = +d
      a && (this.salesmanId = a)
      n && (this.salesmanNo = n)
      p && (this.promotionNo = p)
      s && (this.source = +s)
      // 门店邀请有礼
      r && (this.storeId = +r)
      // 经销商邀请（含经销商业务员邀请）
      ;[4, 6].includes(+s) && (this.form.dealerid = +d)
      // 动销码邀请
      x && (this.dxmDealerId = +x)

      if (storeno) {
        this.form.storeno = storeno
        this.disabledStoreno = true
      }

      this.$store.dispatch('fetchGlobalTheme', { m: this.m })

      this.fetchRegisterDecoration()

      this.initSetting()
    },
    async fetchRegisterDecoration() {
      if (!this.m) return
      const res = await apiRegisterPage({
        memberlogin: this.m,
        sourcetype: 8
      })
      if (this.$ck(res)) {
        const components = res.return_data || []
        const decorationItems = []
        for (let item of components) {
          if (item.code === 'RegisterPageSetting') {
            const data = JSON.parse(item.data)
            this.registerPageTitle = data.Title || '注册门店'
            this.registerBgColor = data.BgColor || '#fff'
            this.registerTextColor = data.FrontColor || '#000'
            this.registerPageBgColor = typeof data.PageBgColor === 'undefined' ? '#f4f4f4' : data.PageBgColor
            this.registerBgUrl = data.bgUrl || ''
            // 设置导航栏颜色
            const pages = getCurrentPages()
            const page = pages[pages.length - 1]
            if (
              (data.statusColor || ['#000000', '#ffffff'].includes(data.FrontColor)) &&
              page.route === 'pages/register-store/index'
            ) {
              uni.setNavigationBarColor({
                frontColor: data.statusColor || data.FrontColor,
                backgroundColor: data.BgColor
              })
            }
            continue
          }
          if (item.code === 'RegisterImageAd' || item.code === 'RegisterBlankSegmente') {
            try {
              const parsed = typeof item.data === 'string' ? JSON.parse(item.data) : item.data
              decorationItems.push({
                code: item.code,
                data: parsed,
                sort: typeof item.sort === 'number' ? item.sort : 0
              })
            } catch (e) {
              console.error('解析注册页装修组件失败:', item.code, e)
            }
          }
        }
        this.registerDecoration = decorationItems
      }
    },
    async initSetting() {
      let p = {
        js_code: await getJsCode()
      }
      if (this.source === 8) {
        p.memberlogin = this.m
        p.storeid = this.storeId
      } else {
        p.m = this.m
        p.d = this.dealerId
        p.salesmanid = +this.salesmanId
        p.memberLoginType = this.memberLoginType
      }
      const res = await (this.source === 8 ? apiGetStoreInfo : apiGetRegisterInfo)(p)
      if (this.$ck(res)) {
        const {
          memberloginname,
          authorizeurl,
          dealername,
          storename,
          storeregistersettings,
          basicsettings,
          salesmanstatus,
          salesmanno,
          isterminalsmartmatch
        } = res.return_data
        // 赋值
        this.isterminalsmartmatch = isterminalsmartmatch
        this.storeFocusLocationOnShow()

        if (this.source !== 8 && salesmanstatus !== null && salesmanstatus !== undefined && salesmanstatus !== 1) {
          this.tipType = 6
          this.codeTips = `该业务员帐号${salesmanstatus === 3 ? '未激活' : '已禁用'}`
          this.showTips({
            content: '此邀请码已失效'
          })
          this.$uploadLog({
            type: 'register',
            desc: '业务员邀请码已失效',
            data: { err: this.codeTips, salesmanno, m: this.m, salesmanstatus }
          })
          return
        }
        const { auditshop, basic, leader, service, registerstyle } =
          this.source === 8 ? storeregistersettings : basicsettings
        this.dealerName = this.source === 8 ? storename : dealername
        this.memberloginName = memberloginname

        const o = this.source === 4 ? 'DealerState' : this.source === 6 ? 'SalesmanState' : 'State'
        const audit = auditshop.find(i => i.code === o)
        this.needAudit = !!audit?.required
        this.needAudit && this.initTemplate()

        const e = ['Remark_TipMsg', 'LongiAndLati', 'Phone', 'Phone_SmsVerify', 'DefaPhoneToStoreNo']
        this.rules = [...basic, ...leader, ...(service || [])]
          .filter(i => !e.includes(i.code))
          .reduce((acc, i) => {
            acc[i.code] = {
              show: i.show,
              required: i.required
            }
            return acc
          }, {})

        const ln = leader.find(i => i.code === 'Name')
        this.leaderTitle = ln?.title || '姓名'
        this.leaderPlaceholder = `请输入${this.leaderTitle}`

        const rp = basic.find(i => i.code === 'Remark_TipMsg')
        this.remarkPlaceholder = rp?.title || '最多50个字'
        this.authorizeurl = authorizeurl
        if (!this.openId) {
          this.getOpenid()
        }
        this.registerStyle = registerstyle || 1

        this.step = 1

        // 当动销码经销商id大于0 && 显示所属经销商，则自动请求经销商接口并显示第一个经销商
        if (this.dxmDealerId > 0 && this.rules.TheirDealer.show) {
          this.$refs.dealerPickerRef.getData(1)
        }
      }
    },
    async getStoreBannerConfig() {
      const res = await apiGetStoreBannerConfig({
        memberLogin: this.m
      })
      if (this.$ck(res) && !!res.return_data) {
        let { return_data: imageAdData = {} } = res
        imageAdData.indicatorColor = this.themeInfo.color // 应用主题色
        this.imageAdData = { ...this.imageAdData, ...imageAdData }
      }
    },
    getOpenid() {
      uni.setStorageSync('registerAuthorizeUrl', this.authorizeurl)
      uni.navigateTo({
        url: `/pages/index/auth-webview?from=registerstore`
      })
    },
    handleGetPhoneNumber(e) {
      this.autoFocus = false
      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        return
      }
      if (code) {
        this.checkMobile({ code })
      }
    },
    async checkMobile({ code, mobile }) {
      if (!this.openId) {
        this.tipType = 7
        this.showTips({
          content: '暂未获取微信授权信息，请重新授权',
          confirmText: '重新授权'
        })
        return
      }
      let params = {
        memberlogin: this.m,
        openid: this.openId,
        dealerid: this.dealerId,
        js_code: await getJsCode()
      }
      code && (params.mobilecode = code)
      mobile && (params.mobile = mobile)
      const res = await apiGetStoreRegisterMobile(params, false)
      let { return_code: status, return_data: data, return_msg: msg } = res
      data = data || {}
      if (status === 0) {
        const { mobile, openid } = data
        this.form.mobile = mobile
        this.form.assistantopenid = openid

        // this.$log.info({
        //   type: 'auth',
        //   desc: 'openid授权',
        //   data: JSON.stringify({
        //     m: this.m,
        //     openid: this.openId,
        //     assistantopenid: openid
        //   })
        // })

        this.isMultiDealer = !!data.checkmobileexpend?.ismultiselectdealer
        this.storeList = data.checkmobiledata || []

        if (this.storeList.length === 0) {
          this.checkedMobile = this.form.mobile
          return true
        }

        this.tipType = 3
        this.showTips({
          type: 'confirm',
          title: this.isMultiDealer ? '请选择已有门店信息进行关联' : '是否复用以下门店信息注册？',
          content: '',
          cancelText: this.storeList.length < 50 && !this.isMultiDealer ? '不，重新注册' : ''
        })
        return false
      }
      if (status === 600015) {
        // 该微信号已绑定门店或店员账号
        this.tipType = 2
        this.showTips({
          type: 'confirm',
          content: msg,
          confirmText: '立即登录'
        })
      } else if (status === 39201) {
        this.tipType = 5
        //记录激活的信息
        const { mobile, activatenum, activatetype, storeno = '' } = data
        this.activate = {
          mobile: mobile || '', //手机号
          activatetype, //激活方式
          storeno, // 需要激活的门店编号
          activatenum // 未激活的数量
        }
        this.showTips({
          type: 'confirm',
          content: msg,
          confirmText: '确定'
        })
      } else if (msg.includes('手机号码解密失败')) {
        this.tipType = 1
        this.showTips({
          content: '获取手机号失败，请重试'
        })
      } else {
        this.tipType = 1
        this.showTips({
          content: msg
        })
      }
      return false
    },
    async handleNextStep(n) {
      if (n === 2) {
        const leaderValidated = await this.validateLeader()
        if (!leaderValidated) return
        this.step = n
      } else {
        this.step = n
      }
    },
    handleEditAdress() {
      uni.navigateTo({
        url: `/shop/address/edit?m=${this.m}`
      })
    },
    setAddress() {
      let { province, city, area, address, street, lanandlat, houseNumber } = this.$store.state.storeRegisterAddress
      this.fullAddress =
        (province || '') +
        (city || '') +
        (area || '') +
        (area === street ? '' : street || '') +
        (address || '') +
        (houseNumber || '')
      this.form.address = address + (houseNumber || '')
      this.form.lanandlat = lanandlat
    },
    onPickerConfirm(e, type) {
      if (!e) return
      if (type === 'd') {
        const { id, dealername } = e
        this.dealerInfo = {
          id,
          dealername
        }
        this.form.dealerid = id
      } else if (type === 'a') {
        const { id, name } = e
        this.shopSize = {
          id,
          name
        }
        this.form.shopsize = name
      } else {
        const { id, name } = e
        this.storeInfo = {
          id,
          name
        }
        this.form.storetypeid = id
      }
    },
    validateForm() {
      if (this.rules.ShopNo?.show) {
        if (this.rules.ShopNo?.required && !this.form.storeno) {
          this.$msg('请输入门店编号')
          return false
        }
        if (this.form.storeno && !/^[A-Za-z0-9_-]+$/.test(this.form.storeno)) {
          this.$msg('门店编号仅含英文、数字、英文符号“-” “_”', { duration: 3000 })
          return false
        }
      }
      if (this.rules.ShopName?.required && !this.form.storename) {
        this.$msg('请输入门店名称')
        return false
      }
      if (this.rules.PartShopName?.show && this.rules.PartShopName?.required && !this.form.branchname) {
        this.$msg('请输入分店名')
        return false
      }
      if (this.rules.ShopAddress?.required && !this.form.lanandlat) {
        this.$msg('请选择地址')
        return false
      }
      if (this.rules.ShopFor?.show && this.rules.ShopFor?.required && this.shopFor.length === 0) {
        this.$msg('请上传店招')
        return false
      }
      if (this.rules.BusinessLicense?.show && this.rules.BusinessLicense?.required && this.license.length === 0) {
        this.$msg('请上传营业执照')
        return false
      }
      if (this.rules.TheirDealer?.show && this.rules.TheirDealer?.required && this.form.dealerid === -1) {
        this.$msg('请选择所属经销商')
        return false
      }
      if (this.rules.Remark?.show && this.rules.Remark?.required && !this.form.remark) {
        this.$msg('请输入备注')
        return false
      }
      if (this.rules.StoreType?.show && this.rules.StoreType?.required && this.form.storetypeid === '') {
        this.$msg('请选择门店类型')
        return false
      }
      if (this.rules.ShopSize?.show && this.rules.ShopSize?.required && this.form.shopsize === '') {
        this.$msg('请选择店铺面积')
        return false
      }

      if (this.rules.WeChat?.show) {
        if (this.rules.WeChat?.required && !this.form.wxno) {
          this.$msg('请输入微信号')
          return false
        }
        if (/[\u4e00-\u9fa5]/.test(this.form.wxno)) {
          this.$msg('请输入正确的微信号')
          return false
        }
      }
      if (this.rules.QQ?.show) {
        if (this.rules.QQ?.required && !this.form.qqno) {
          this.$msg('请输入QQ号')
          return false
        }
        if (this.form.qqno && !/^\d+$/.test(this.form.qqno)) {
          this.$msg('请输入正确的QQ号')
          return false
        }
      }
      if (this.rules.Email?.show) {
        if (this.rules.Email?.required && !this.form.email) {
          this.$msg('请输入邮箱')
          return false
        }
      }
      if (!this.showServiceBlock) return true
      if (this.rules.ShopPic?.show && this.rules.ShopPic?.required && this.shopPic.length === 0) {
        this.$msg('请上传门店图片')
        return false
      }
      if (this.rules.ShopPhone?.show) {
        if (this.rules.ShopPhone?.required && !this.form.phoneno) {
          this.$msg('请输入门店电话')
          return false
        }
        if (this.form.phoneno && !/^[\d-]+$/.test(this.form.phoneno)) {
          this.$msg('请输入正确的门店电话')
          return false
        }
      }
      if (this.rules.PerPrice?.show) {
        if (this.rules.PerPrice?.required && this.form.percapita === '') {
          this.$msg('请输入人均价格')
          return false
        }
        if (this.form.percapita && !/^([1-9]\d*|0)(\.\d{1,2})?$/.test(this.form.percapita)) {
          this.$msg('人均价格请输入数字，最多包含2位小数')
          return false
        }
      }
      if (this.rules.BusinessHours?.show && this.rules.BusinessHours?.required && !this.form.businesshours) {
        this.$msg('请输入营业时间')
        return false
      }
      if (this.rules.Recommend?.show && this.rules.Recommend?.required && !this.form.recommend) {
        this.$msg('请输入推荐信息')
        return false
      }
      if (this.rules.SellingPoint?.show && this.rules.SellingPoint?.required && !this.form.characteristic) {
        this.$msg('请输入特色服务')
        return false
      }
      if (this.rules.BriefIntro?.show && this.rules.BriefIntro?.required && !this.form.introduction) {
        this.$msg('请输入简介')
        return false
      }
      return true
    },
    async validateLeader(validateMobile = true) {
      const mobile = this.form.mobile
      //校验
      if (mobile === '') {
        this.$msg('手机号码不能为空')
        return false
      }

      if (this.isYzmMode) {
        if (!regMobile(mobile)) {
          this.$msg('请输入正确的手机号')
          return false
        }
        if (!this.yzm) {
          this.$msg('请输入验证码')
          return false
        }
        if (!regCode(this.yzm)) {
          this.$msg('请输入正确的验证码')
          return false
        }
      }
      if (this.rules.Name?.show) {
        if (this.rules.Name?.required && !this.form.leader) {
          this.$msg(`请输入${this.leaderTitle}`)
          return false
        }
        if (this.form.leader && !/^[a-zA-Z\u4e00-\u9fa5]+$/.test(this.form.leader)) {
          this.$msg(`${this.leaderTitle}只能输入中英文`)
          return false
        }
      }

      if (this.isYzmMode && !this.validInfo[`${mobile}_${this.yzm}`]) {
        const v = await apiValidateCode({
          mobile,
          checkcode: this.yzm
        })
        if (!this.$ck(v)) return false
        // 检验成功后不再次校验
        this.validInfo[`${mobile}_${this.yzm}`] = true
      }
      if (validateMobile && mobile !== this.checkedMobile) {
        const c = await this.checkMobile({ mobile })
        if (!c) return false
      }

      return true
    },
    async handleSubmit(mode) {
      if (this.showAll) {
        // 复用门店信息那里过来的，不用再校验手机号了，避免死循环
        const leaderValidated = await this.validateLeader(mode !== 1)
        if (!leaderValidated) return
      }

      // mode: 0.校验表单 1.直接提交
      if (!mode && !this.validateForm()) {
        return
      }
      if (this.btnLoading) {
        return
      }
      this.btnLoading = true
      // 部分机型能上传超出限制的图片，难以复现，故slice截取防止接口报错
      const shopfor = this.shopFor.slice(0, 1).join(',')
      const businesslicense = this.license.slice(0, 1).join(',')
      const storeimg = this.shopPic.slice(0, 9).join(',')
      const param = {
        js_code: await getJsCode(),
        memberlogin: this.m,
        registertype: this.source,
        inviterstoreid: this.storeId,
        shopfor,
        businesslicense,
        storeimg,
        memberLoginType: this.memberLoginType,
        ...this.form
      }
      param.invitedealerid = this.dealerId
      param.openid = this.openId
      this.salesmanId && (param.invitesalesmanid = this.salesmanId)
      this.salesmanNo && (param.invitesalesmanno = this.salesmanNo)
      this.promotionNo && (param.promotionno = this.promotionNo)
      param.dealerid = param.dealerid === -1 ? 0 : param.dealerid
      // 门店搜索带入时提交匹配记录 id，无值时删除字段避免传空串
      if (!param.smartMatchMdid) delete param.smartMatchMdid
      // 特殊处理：当姓名字段不需要填写，则自动将门店名称过滤赋值给姓名
      if (this.form.leader === '') {
        param.leader = this.form.storename
          .match(/[a-zA-Z\u4e00-\u9fa5]+/g)
          ?.join('')
          ?.substring(0, 16)
      }
      if (this.isCustom) {
        param.registerMobileType = 1
      }
      try {
        const res = await apiSubmitRegister(param)
        if (res.return_code === 0) {
          const { storessotoken, storeid, reviewaudittype } = res.return_data
          this.ssoToken = storessotoken || ''
          this.ssoStoreId = storeid
          if (this.needAudit) {
            this.needAudit = reviewaudittype !== 1 // 1.不需要审核 0.需要审核
          }
          this.$uploadLog({
            type: 'register',
            desc: '门店注册成功',
            extend: {
              memberlogin: this.m,
              memberloginname: this.memberloginName,
              mobile: this.form.mobile,
              source: this.source,
              redirecturl: this.redirecturl,
              storeid: this.ssoStoreId,
              storessotoken: this.ssoToken
            }
          })
          // 宝洁定制的要自动登录调整到指定页，与中转逻辑的一致的
          if (this.redirecturl && storessotoken && storeid) {
            uni.reLaunch({
              url: `/pages/transfer/index?token=${this.ssoToken}&url=${this.redirecturl}&storeid=${this.ssoStoreId}`
            })
            return
          }
          this.step = mode ? 4 : 3
          return
        } else {
          this.$uploadLog({
            type: 'register',
            desc: '门店注册失败',
            data: res,
            extend: {
              api: 'commanage/storeregister',
              param,
              source: this.source,
              memberlogin: this.m,
              memberloginname: this.memberloginName
            }
          })
        }
        this.tipType = 1
        this.showTips({
          content: res.return_msg
        })
      } finally {
        this.btnLoading = false
      }
    },
    handleChoose(i) {
      this.selectStore = i
    },
    onConfirm() {
      if (this.tipType === 2) {
        this.handleLogin()
        return
      }
      if (this.tipType === 4) {
        this.relateDealer()
        return
      }
      if (this.tipType === 5) {
        console.log('this.openId:', this.openId)
        const { mobile, activatetype, storeno, activatenum } = this.activate
        const param = `from=register&salemanId=${this.salesmanId}&m=${this.m}&mobile=${mobile}&dealerId=${this.dealerId}&openid=${this.openId}`
        const url =
          activatenum === 1 && activatetype === 1
            ? `/pagesA/activation/form?${param}&type=1&storeNo=${storeno}`
            : `/pagesA/activation/index?${param}`
        uni.reLaunch({
          url
        })
        return
      }
      if (!this.selectStore.storeid) return this.$msg('请选择门店')
      this.showPopup = false
      const {
        leader,
        storeid,
        storeno,
        storename,
        branchname,
        address,
        lanandlat,
        updealerid,
        remark,
        storetypeid,
        wxno,
        qqno,
        email,
        phoneno,
        percapita,
        businesshours,
        recommend,
        characteristic,
        introduction,
        shopfor,
        businesslicense,
        storeimg
      } = this.selectStore
      if (this.isMultiDealer) {
        this.checkDealer(storeid)
        return
      }
      leader && (this.form.leader = leader)
      storeno && (this.form.storeno = storeno)
      storename && (this.form.storename = storename)
      branchname && (this.form.branchname = branchname)
      address && (this.form.address = address)
      lanandlat && (this.form.lanandlat = lanandlat)
      this.form.dealerid = updealerid || 0
      // 修复显示问题
      if (!this.form.dealerid) {
        this.dealerInfo = {}
      }
      remark && (this.form.remark = remark)
      storetypeid && (this.form.storetypeid = storetypeid)
      wxno && (this.form.wxno = wxno)
      qqno && (this.form.qqno = qqno)
      email && (this.form.email = email)
      phoneno && (this.form.phoneno = phoneno)
      this.form.percapita = percapita || ''
      businesshours && (this.form.businesshours = businesshours)
      recommend && (this.form.recommend = recommend)
      characteristic && (this.form.characteristic = characteristic)
      introduction && (this.form.introduction = introduction)
      this.shopFor = (shopfor || '').split(',')
      this.license = (businesslicense || '').split(',')
      this.shopPic = (storeimg || '').split(',')
      this.form.isreuse = 1
      // 直接注册，成功后无需审核
      this.handleSubmit(1)
    },
    onCancel() {
      if (this.tipType === 3) {
        this.step = 2
        this.checkedMobile = this.form.mobile
      }
    },
    onClose() {
      if (this.tipType === 7) {
        this.getOpenid()
      }
    },
    async checkDealer(id) {
      apiCheckRelation({
        memberlogin: this.m,
        storeid: id,
        dealerid: this.dealerId,
        js_code: await getJsCode()
      }).then(res => {
        if (res.return_code === 0) {
          this.tipType = 4
          this.showTips({
            type: 'confirm',
            content: '您已有绑定的上级经销商，确定要继续绑定新的上级经销商吗?'
          })
        } else {
          this.tipType = 1
          this.showTips({
            content: res.return_msg
          })
        }
      })
    },
    async relateDealer() {
      apiRelate({
        memberlogin: this.m,
        storeid: this.selectStore.storeid,
        dealerid: this.dealerId,
        js_code: await getJsCode()
      }).then(res => {
        if (res.return_code === 0) {
          this.showPopup = false
          this.step = 4
          this.$uploadLog({
            type: 'register',
            desc: '门店注册成功',
            extend: {
              memberlogin: this.m,
              memberloginname: this.memberloginName,
              mobile: this.form.mobile,
              source: this.source
            }
          })
          return
        }
        this.tipType = 1
        this.showTips({
          content: res.return_msg
        })
      })
    },
    async initTemplate() {
      let res = await apiGetSubscribeTemplateId({
        js_code: await getJsCode(),
        type: 2,
        memberlogin: this.m
      })
      if (this.$ck(res, true)) {
        const l = res.return_data || []
        this.noticeTempId = l[0]
      }
    },
    async handleSubscribe() {
      const res = await this.requestSubscribeMsg([this.noticeTempId])
      if (res[this.noticeTempId] === 'accept') {
        this.$msg('订阅成功', { icon: 'success' })
        this.isSubscribe = true
      }
    },
    handExitMp() {
      uni.exitMiniProgram()
    },
    handleLogin() {
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/register-result.scss';
@import './styles/store-location.scss';

.register-store-page {
  min-height: 100vh;
}
.register-bg {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  /* #ifdef H5 */
  max-width: 960rpx;
  /* #endif */
}
.form-box {
  margin: 20rpx;
  padding: 20rpx;

  border-radius: 20rpx;
  background: #fff;
  position: relative;
  .form-title {
    position: relative;

    margin: 15rpx 20rpx;

    color: #000;

    font-size: 30rpx;
    font-weight: 700;
    &::after {
      position: absolute;
      bottom: 2rpx;
      left: 0;

      width: 60rpx;
      height: 8rpx;

      content: '';

      opacity: 0.5;
      border-radius: 4rpx;
      // background: #ff7640;
      background: var(--theme-color, $uni-color-primary);
    }
  }
  .input {
    height: 108rpx;

    text-align: left;

    color: #666;

    line-height: 108rpx;
  }
}
.mobile-btn {
  width: 200rpx;
  padding: 12rpx;

  color: #0f80ff;
  border: 1rpx solid #0f80ff;
  border-radius: 28rpx;
  background-color: #fff;

  font-size: 24rpx;
  font-weight: 500;
}
.btn-group {
  position: fixed;
  left: 30rpx;
  right: 30rpx;
  bottom: 30rpx;
  z-index: 200;
}
.store-item + .store-item {
  margin-top: 10rpx;
}
</style>
