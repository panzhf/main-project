/*
 * @Author: hishion
 * @Date: 2022-06-14 09:56:03
 * @Description 基于maxid增量查询。getData参考注释写法
 */
const loadMoreMixin = {
  data() {
    return {
      list: [], // 列表数据
      paging: {
        page: 0, // 如果传maxId，分页固定为1或者不传
        pageSize: 10,
        maxId: 0
      },
      hasMore: true, // 还有更多数据标记
      busy: false // 防重复标记
    }
  },
  computed: {
    showNoneData() {
      // 用于判断无数据显示占位图
      return !this.hasMore && this.list.length === 0
    }
  },
  onReachBottom() {
    // 使用mixin的地方定义getData方法用于加载数据
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    resetData() {
      return new Promise(resolve => {
        this.list = []
        this.paging.page = 0
        this.hasMore = true
        this.busy = false
        this.paging.maxId = 0
        resolve()
      })
    },
    dealRes({ res, nextPage, listProp = 'list', cb } = {}) {
      // 常规接口返回，带list和totalCount
      const { totalcount, maxid = 0 } = res.return_data
      let list = res.return_data[listProp] || []
      const result = typeof cb === 'function' ? cb(list) : list
      this.list = [...this.list, ...result]
      this.hasMore = this.list.length < totalcount
      // 考虑请求成功且有数据才设置页码
      if (result.length > 0) {
        // maxid为0，常规分页，页数自增
        // maxid不为0，增量分页，页数固定
        !maxid && (this.paging.page = nextPage)
        this.paging.maxId = maxid
      }
    }
    /* getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      API({
        pageindex: nextPage,
        pagesize: this.paging.pageSize,
        maxid: this.paging.maxId,
        ...this.otherParams
      }).then(res => {
        if (this.$ck(res)) {
          this.dealRes({res, nextPage})
          // 其他业务逻辑
        }
        this.busy = false
      }).catch(() => {
        this.busy = false
      })
    } */
  }
}

export default loadMoreMixin
