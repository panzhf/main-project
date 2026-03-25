<template>
  <view class="upload-box flex flex-wrap">
    <view v-for="(item, index) in uploadPicArr" :key="index" class="item" @tap="changeHeadImg(index)">
      <image class="pic-upload" :src="item" mode="scaleToFill" />
      <image v-if="modify" class="pic-dele" :src="icons.dele" mode="scaleToFill" @tap.stop="handleDelete(index)" />
    </view>
    <image
      v-if="maxLength > uploadPicArr.length && modify"
      class="pic-upload"
      :src="icons.upload"
      mode="scaleToFill"
      @tap="changeHeadImg(-1)"
    />
  </view>
</template>

<script>
/*
 * 目前只能上传图片
 */
import { staticURL } from '@/config'
import { chooseImg, uploadImg } from '@/utils/upload'
export default {
  name: 'UploadImages',
  props: {
    modify: {
      type: Boolean, // false 不可修改
      default: true
    },
    value: {
      type: Array,
      default() {
        return []
      }
    },
    maxLength: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      icons: {
        upload: staticURL() + 'common/upload.jpg',
        dele: staticURL() + 'common/icon-dele.png'
      },
      uploadPicArr: this.value
    }
  },
  watch: {
    defaultValue: {}
  },
  methods: {
    async changeHeadImg(n) {
      if (!this.modify) return this.$emit('tap')
      // 上传
      const paths = await chooseImg({ mediaType: ['image'] })
      if (paths?.length) {
        let res = await uploadImg(paths[0])
        if (this.$ck(res, true)) {
          let path = res.return_data
          if (n === -1) {
            this.uploadPicArr.splice(this.uploadPicArr.length, 0, path)
          } else {
            this.uploadPicArr.splice(n, 1, path)
          }
          this.handBackImage()
        }
      }
    },
    handBackImage() {
      this.$emit('input', this.uploadPicArr)
    },
    handleDelete(n) {
      this.uploadPicArr.splice(n, 1)
      this.$emit('input', this.uploadPicArr)
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-box {
  .item {
    width: 80rpx;
    height: 80rpx;
    margin: 0 20rpx 20rpx 0;
    position: relative;
    background-color: #f5f5f5;
    .pic-dele {
      position: absolute;
      right: -20rpx;
      top: -20rpx;
      padding: 10rpx;
      width: 24rpx;
      height: 24rpx;
    }
  }
  .pic-upload {
    width: 80rpx;
    height: 80rpx;
  }
}
</style>
