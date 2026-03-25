<template>
  <view class="">
    <view v-if="dropdownArr.length > 0">
      <u-dropdown inactive-color="#000" title-size="32" @open="handleOpen">
        <u-dropdown-item
          v-for="(item, indexT) in dropdownArr"
          :key="indexT"
          v-model="item.value"
          :title="item.title"
          :options="item.options"
          @change="handleChange"
        ></u-dropdown-item>
      </u-dropdown>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    dropdownArr: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      index: 0
    }
  },
  methods: {
    handleOpen(index) {
      this.index = index
    },
    handleChange(e) {
      let valueObj = {
        menuIndex: this.index,
        value: e
      }
      this.$emit('handleDrop', valueObj)
    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
</style>
