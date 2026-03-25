export const statusFilter = {
  methods: {
    statusFilter(state, orderType) {
      if (orderType === 1) {
        switch (state) {
          case 1:
            state = '待付款'
            break
          case 2:
            state = '待核销'
            break
          case 4:
            state = '已完成'
            break
          case 5:
            state = '已取消'
            break
          case 6:
            state = '已退款'
            break
          case 7:
            state = '处理中'
            break
          default:
            break
        }
      } else if (orderType === 0 || orderType === 3) {
        switch (state) {
          case 1:
            state = '待付款'
            break
          case 2:
            state = '待发货'
            break
          case 3:
            state = '待收货'
            break
          case 4:
            state = '已完成'
            break
          case 5:
            state = '已取消'
            break
          case 6:
            state = '退款订单'
            break
          case 7:
            state = '处理中'
            break
          default:
            break
        }
      }
      return state
    },
    saleOrderState(state) {
      switch (state) {
        case 1:
          state = '待审核'
          break
        case 2:
          state = '处理中'
          break
        case 3:
          state = '已关闭'
          break
        case 4:
          state = '已完成'
          break
      }
      return state
    }
  }
}
