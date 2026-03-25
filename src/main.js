import Vue from 'vue'
import App from './App'
import uView from 'uview-ui-v1'
import store from './store'
import MdUtils from 'miduo-utils'
import { ck, msg, loading, goBack, navPage } from '@/utils/index'
import log, { uploadLog } from 'packages/utils/wx-log'
import vImg from 'packages/components/imgs'
import PrivacyPopup from 'packages/components/privacy-popup'
import OverdueTips from 'packages/components/overdue/tips.vue'
import globalThemeMixin from '@/mixins/global-theme'

Vue.config.productionTip = false
Vue.prototype.$navPage = navPage
Vue.prototype.$ck = ck
Vue.prototype.$msg = msg
Vue.prototype.$loading = loading
Vue.prototype.$goBack = goBack
Vue.prototype.$store = store
Vue.prototype.$log = log
Vue.prototype.$uploadLog = uploadLog

Vue.component('VImg', vImg)
Vue.component('PrivacyPopup', PrivacyPopup)
Vue.component('OverdueTips', OverdueTips)
Vue.mixin(globalThemeMixin)
Vue.use(MdUtils) // 挂载toLowerKey到全局
Vue.use(uView)
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
