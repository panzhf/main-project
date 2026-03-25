import { apiUnreadMessageCount } from '@/api/message'
import { ck } from '@/utils'

const state = () => ({
  businessNoticeCount: 0,
  systemNoticeCount: 0
})

const getters = {
  totalNoticeCount: state => state.businessNoticeCount + state.systemNoticeCount
}

const mutations = {
  setMessageCount(state, data) {
    state.businessNoticeCount = data
      .filter(item => ![77, 312, 313, 318].includes(item.sendtype))
      .reduce((sum, item) => sum + item.unreadcount, 0)
    state.systemNoticeCount = data
      .filter(item => [77, 312, 313, 318].includes(item.sendtype))
      .reduce((sum, item) => sum + item.unreadcount, 0)
  }
}

const actions = {
  updateMessageCount({ commit }) {
    apiUnreadMessageCount({
      sendtypes: [135, 136, 137, 138, 139, 140, 77, 312, 313, 318]
    }).then(res => {
      if (ck(res)) {
        commit('setMessageCount', res.return_data || [])
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
