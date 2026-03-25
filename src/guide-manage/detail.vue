<template>
  <view class="container">
    <template v-if="loaded && !isEdit">
      <info :info="info" :mode="mode" />
      <FooterBtn v-if="showBtn" :mode="mode" :foot-btns="footBtns" @edit="handleEdit" @confirm="handleConfirm" />
    </template>
    <GuideForm
      v-if="isEdit"
      :form-type="1"
      :m="m"
      btn-text="确认并保存"
      :guide-info="info"
      :loading="busy"
      @changeState="handleChangeState"
      @submit="handleSubmit"
    />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
// 详情与编辑同一个页面
import { apiGuideDetail, apiEditGuide, apidelGuide, apiModifyMobile, apiGuideStatus, apiReviewGuide } from '@/api/guide'
import info from 'packages/components/guide/guide-detail.vue'
import FooterBtn from 'packages/components/btns/detail-btn.vue'
import GuideForm from 'packages/components/guide/guide-register.vue'
export default {
  components: { info, FooterBtn, GuideForm },
  data() {
    return {
      mode: -1, //0详情 1审核
      info: {},
      isEdit: false, // 详情页有编辑状态
      loaded: false,
      id: 0,
      oldMobile: '',
      newState: 0,
      busy: false,
      state: {
        cur: 0,
        new: 0
      }
    }
  },
  computed: {
    footBtns() {
      const { ismdmodifydginfo: edit, ismddeldg: del } = this.$store.state.guideManage
      let footBtns = []
      del && footBtns.push({ type: 'del', name: '删除', tips: '确定删除该导购员?' })
      edit && footBtns.push({ type: 'edit', name: '修改资料' })
      return footBtns
    },
    titleText() {
      if (this.mode === 1) {
        return '审核详情'
      } else if (this.mode === 0) {
        return this.isEdit ? '修改导购信息' : '导购详情'
      }
      return ''
    },
    storeInfo() {
      return JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    },
    m() {
      return this.storeInfo.memberLogin
    },
    storeId() {
      return this.storeInfo.storeId
    },
    showBtn() {
      return (this.mode === 1 && this.info.checkstate === 0) || this.mode === 0
    }
  },
  watch: {
    titleText(v) {
      uni.setNavigationBarTitle({
        title: v
      })
    }
  },
  onLoad(options) {
    this.mode = Number(options.mode || 0)
    this.id = Number(options.id || 0)
    this.getData()
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      const param = {
        memberlogin: this.m,
        salerid: this.id
      }
      const res = await apiGuideDetail(param)
      try {
        if (this.$ck(res)) {
          this.info = res.return_data
          this.oldMobile = this.info.mobile
          this.state = {
            cur: this.info.salerstate,
            new: this.info.salerstate
          }
          this.info.salerimg = this.info.salerimg ? this.info.salerimg.split(',').slice(0, 3) : []
          this.info = Object.keys(this.info).reduce((acc, key) => {
            if (this.info[key] !== undefined) {
              acc[key] = this.info[key] !== null ? this.info[key] : ''
            }
            return acc
          }, {})
          this.loaded = true
        }
      } finally {
        this.busy = false
      }
    },
    handleChangeState(v) {
      this.state.new = v ? 1 : 2
    },
    async handleConfirm(data) {
      if (data.operaType === 'delete') {
        // 删除导购
        const p = {
          m: this.m,
          id: this.id,
          storeid: this.storeId
        }
        if (this.busy) return
        this.busy = true
        const res = await apidelGuide(p)
        if (this.$ck(res)) {
          this.$msg('删除成功！')
          this.$store.commit('updateRefreshTag', true)
          setTimeout(() => {
            this.$goBack()
          }, 1500)
        }
        this.busy = false
      } else if (['auditFailed', 'auditPass'].includes(data.operaType)) {
        // 审核
        const p = {
          memberlogin: this.m,
          salerid: this.id,
          storeid: this.storeId, //导购员所属门店Id
          reviewresult: data.operaType === 'auditPass' ? 1 : 2, //审核结果 1：通过 2：不通过
          reviewremark: data.value || '', //审核意见
          reviewusername: this.storeInfo.mainpartName || '', //审核人姓名
          reviewstoreid: this.storeId, //审核门店Id(总部填0)
          salesmanid: 0, //所属业务员ID
          issyncreviewstore: 0 //门店未审核状态下,是否同步审核门店 0不审核 1审核
        }
        if (this.busy) return
        this.busy = true
        const res = await apiReviewGuide(p)
        if (this.$ck(res)) {
          this.$msg('操作成功！')
          this.$store.commit('updateRefreshTag', true)
          setTimeout(() => {
            this.$goBack()
          }, 1500)
        }
        this.busy = false
      }
    },
    async handleSubmit(param) {
      // 修改导购

      if (this.busy) return
      this.busy = true
      if (this.oldMobile !== param.mobile && [0, 4].includes(this.state.cur)) {
        const modifyMobileRes = await apiModifyMobile({
          salerid: this.id,
          oldmobile: this.oldMobile,
          newmobile: param.mobile,
          appscene: 0 // 0: 被动修改 1：自主修改
        })
        if (this.$ck(modifyMobileRes)) {
          this.oldMobile = param.mobile
        } else {
          this.showTips({
            content: res.return_msg
          })
          this.busy = false
          return
        }
      }
      let p = {
        ...param,
        dealerstoreid: this.storeId,
        isreviewstoreid: 0,
        operatetype: 1,
        salerimg: param.salerimg.slice(0, 3).join(','),
        salerid: this.id
      }
      const res = await apiEditGuide(p)
      if (this.$ck(res)) {
        // 修改账号状态。当账号状态没有被修改时，不请求修改账号的接口，直接提示修改成功并返回列表
        if (this.state.cur === this.state.new) return this.saveResult()
        // console.log(this.state.cur, this.state.new)
        apiGuideStatus({
          salerid: this.id,
          status: this.state.new // 导购员状态: 1正常 2禁用
        })
          .then(d => {
            if (this.$ck(d)) {
              return this.saveResult()
            }
          })
          .catch(() => {
            this.$msg(' 账号状态未更改成功，请再次点击保存。')
          })
      }
      this.busy = false
    },
    saveResult() {
      this.$msg('修改成功！')
      this.$store.commit('updateRefreshTag', true)
      setTimeout(() => {
        this.busy = false
        this.getData()
        this.isEdit = false
      }, 1500)
    },
    handleEdit() {
      this.isEdit = true
    }
  }
}
</script>
<style lang="scss" scoped>
.tab-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 230rpx;
  z-index: 10;
  background-color: #f4f4f4;
}
.activity-content {
  padding: 230rpx 20rpx 20rpx;
}
</style>
