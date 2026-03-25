<template>
  <view class="u-tabbar" :style="themeVars">
    <view
      :class="['u-tabbar__content', 'safe-area-inset-bottom', borderTop == 1 ? 'u-border-top' : '']"
      :style="{ 'background-color': tabbarSetting.bgColor }"
    >
      <block v-for="(item, index) in tabData" :key="index">
        <view
          class="u-tabbar__content__item"
          :class="{ 'u-tabbar__content__circle': item.midButton }"
          @tap.stop="clickHandler(item, index)"
        >
          <view
            class="p-r"
            :class="[item.midButton ? 'u-tabbar__content__circle__button' : 'u-tabbar__content__item__button']"
          >
            <image :src="pageUrl == item.Path ? item.activeIcon : item.Icon" />
            <!-- <view v-if="item.Path === '/pages/me/index' && badge > 0" class="cart-count">
              {{ badge }}
            </view> -->
            <view v-if="item.Path === '/the-message/index' && totalNoticeCount" class="new-dot"></view>
          </view>
          <view
            class="u-tabbar__content__item__text"
            :style="{ color: pageUrl == item.Path ? activeColor : inactiveColor }"
          >
            {{ item.midButton ? '' : item.Name }}
          </view>
        </view>
      </block>
    </view>
    <!-- <common-popup v-model="showPopup" type="tip" :title="popTitle" :content="popContent"></common-popup> -->
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { decorationTabbarMixin } from '@/mixins/decoration'
export default {
  mixins: [decorationTabbarMixin],
  props: {
    borderTop: {
      type: [String, Number],
      default: 1
    }
  },

  data() {
    return {
      // tabData: [],
      // popTitle: '温馨提示',
      // showPopup: false,
      // popContent: '',
      pageUrl: '' // 当前
    }
  },
  computed: {
    ...mapState('tabbar', ['tabBar', 'tabbarSetting', 'tabData']),
    activeColor() {
      return this.tabbarSetting.selectedColor
    },
    inactiveColor() {
      return this.tabbarSetting.color
    },
    totalNoticeCount() {
      return this.$store.getters['messageCenter/totalNoticeCount']
    }
  },
  // watch: {
  //   tabBar: {
  //     async handler(val) {
  //       if (!val || val.length === 0) {
  //         await this.fetchTabbarDecoration()
  //       }
  //       this.dealTabData()
  //     },
  //     // immediate: true,
  //     deep: true
  //   }
  // },
  async mounted() {
    let pages = getCurrentPages()
    // 页面栈中的最后一个即为项为当前页面，route属性为页面路径: pages/home/index
    this.pageUrl = '/' + pages[pages.length - 1].route || ''
    this.$store.dispatch('messageCenter/updateMessageCount')
    if (!this.tabBar || this.tabBar.length === 0) {
      await this.fetchTabbarDecoration()
    }
    this.dealTabData()
  },
  methods: {
    dealTabData() {
      let info = uni.getStorageSync('userMenuInfo') || '{}'
      if (info === '{}') {
        return uni.reLaunch({ url: '/pages/login/index' })
      }
      let jurisdiction = JSON.parse(info)
      let tabindex = (jurisdiction.tabindex || []).map(item => ({
        number: item.number,
        state: item.state
      }))
      // 根据tabindex的state为1（有效），过滤出tabBar中的item
      let validMenu = tabindex.filter(item => item.state === 1).map(item => item.number)
      if (!validMenu.includes(8)) {
        // 添加自定义导航
        validMenu.push(8)
      }
      const tabData = this.tabBar.filter(t => validMenu.includes(t.Id))
      this.$store.commit('tabbar/setTabData', tabData)
    },
    async clickHandler(tabItem, index) {
      this.$emit('change', index)
      let target = this.tabData[index].Path
      // 防止点击同一个页面tab
      let pages = getCurrentPages()
      let isSamePath = '/' + pages[pages.length - 1].route === target
      if (isSamePath && !tabItem.Appid) return
      if (target || tabItem.IsCustom) {
        // 判断是否是自定义页面跳转小程序
        if (tabItem.IsCustom) {
          if (tabItem.Appid) {
            uni.navigateToMiniProgram({
              appId: tabItem.Appid,
              path: tabItem.Path,
              envVersion: 'release',
              success(res) {
                // 打开成功
              },
              fail(err) {
                // 打开失败
                if (err.errMsg.includes('myself')) {
                  // 跳转当前小程序页面
                  uni.navigateTo({
                    url: target
                  })
                } else if (!err.errMsg.includes('cancel')) {
                  this.$msg('跳转小程序失败，请检查小程序ID或页面路径是否正确')
                }
              }
            })
          } else {
            if (target) {
              uni.navigateTo({
                url: target,
                fail() {
                  this.$msg('跳转失败，请检查页面路径是否正确')
                }
              })
            } else {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }
          }
        } else {
          uni.reLaunch({
            url: target,
            success: () => {
              let pages = getCurrentPages()
              let targetIndex = pages.findIndex(item => `/${item.route}` === target)
              targetIndex > -1 && pages[targetIndex].tabItemTap && pages[targetIndex].tabItemTap()
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
view,
text {
  box-sizing: border-box;
}
.safe-area-inset-bottom {
  padding-bottom: 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
.u-tabbar {
  &__content {
    position: fixed;
    z-index: 100;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    box-sizing: content-box;
    width: 100%;
    height: 100rpx; // height: 50px;
    background-color: #ffffff;
    .login-tips {
      position: absolute;
      display: flex;
      justify-content: space-between;
      height: 90rpx;
      background: rgba(0, 0, 0, 0.5);
      width: 100%;
      font-size: 30rpx;
      font-family: PingFang SC Medium, PingFang SC Medium-Medium;
      font-weight: 500;
      text-align: center;
      color: #ffffff;
      top: -90rpx;
      padding-left: 30rpx;
      align-items: center;
      .tips-right {
        display: flex;
        align-items: center;
        height: 100%;
        .login-but {
          background: #ff4b40;
          border-radius: 26rpx;
          padding: 6rpx 20rpx;
          font-size: 26rpx;
        }
        .close-box {
          height: 100%;
          padding: 0 30rpx;
        }
        .iconguanbi {
          font-size: 22rpx;
        }
      }
    }
    &__circle__border {
      position: absolute;
      z-index: 4;
      top: -44rpx;
      /* 由于安卓的性能，导致只有3个tabbar item时，此css计算方式有误差
        故使用js计算的形式来定位，此处不注释，是因为js计算有延后，避免出现位置闪动 */
      left: 50%;
      width: 120rpx;
      height: 120rpx;
      transform: translateX(-50%);
      border-radius: 100%;
      background-color: #ffffff;
      &::after {
        border-radius: 100px;
      }
    }
    &__item {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      padding: 0 0 12rpx;
      &__button {
        position: relative;
      }
      .new-dot {
        position: absolute;
        top: 10rpx;
        right: 0rpx;
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background-color: $uni-color-error;
        border: 2rpx solid #fff;
      }
      image {
        display: block;
        width: 58rpx;
        height: 58rpx;
      }
      &__text {
        color: #707070;
        font-size: 24rpx;
        line-height: 26rpx;
      }
    }
    &__circle {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: calc(100% - 1px);
      background-color: #ffffff;
      &__button {
        position: absolute;
        z-index: 6;
        top: -38rpx;
        left: 50%;
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: center;
        width: 106rpx;
        height: 106rpx;
        transform: translateX(-50%);
        border-radius: 100%;
        background-color: $uni-color-primary;
        image {
          width: 70rpx;
          height: 58rpx;
        }
      }
    }
  }
}
.u-fixed-placeholder {
  box-sizing: content-box;
}
.u-border::after,
.u-border-top::after {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  box-sizing: border-box; // 多加0.1%，能解决有时候边框缺失的问题
  width: 199.8%;
  height: 199.7%;
  content: ' ';
  transform: scale(0.5, 0.5);
  transform-origin: 0 0;
  pointer-events: none;
  border: 0 solid #eee;
}
.u-border-top::after {
  border-top-width: 1px;
}
.u-border::after {
  border-width: 1px;
}
// .cart-count {
//   font-size: 20rpx;
//   background-color: #fc4745;
//   border-radius: 50%;
//   min-width: 35rpx;
//   height: 35rpx;
//   color: #fff;
//   text-align: center;
//   line-height: 30rpx;
//   position: absolute;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   right: -25rpx;
//   top: -5rpx;
//   font-weight: 400;
// }
</style>
