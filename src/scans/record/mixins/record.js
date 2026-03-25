const recordMixin = {
  data() {
    return {}
  },
  props: {
    activityid: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.activityid && this.handleSearch()
  }
}
export default recordMixin
