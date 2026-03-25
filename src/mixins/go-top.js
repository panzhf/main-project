/*
 * @Author: hishion
 * @Date: 2021-07-15 13:52:36
 * @Description 用于判断滚动顶部组件显示
 */
const goTopMixin = {
  data() {
    return {
      showTop: false
    }
  },
  onPageScroll(e) {
    if (e.scrollTop > 300) {
      if (this.showTop) return
      this.showTop = true
    } else {
      this.showTop = false
    }
  }
}

export default goTopMixin
