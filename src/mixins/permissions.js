const permissions = {
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

export default permissions
