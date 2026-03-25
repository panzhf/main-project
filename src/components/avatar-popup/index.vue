<template>
  <view>
    <u-mask
      v-if="userVisible"
      :show="userVisible"
      :z-index="10000"
      :zoom="false"
      :custom-style="{ background: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0 }"
      @tap.stop="() => {}"
    >
      <view class="user-dialog">
        <view class="iconfont icon-close2 close-btn fw-bold c-f" @tap.stop="$emit('input', false)" />
        <u-form ref="uForm" :label-style="{ justifyContent: 'center !important' }" :model="form" label-width="180">
          <u-form-item label="头像" prop="headpath">
            <button
              class="photo-box flex"
              open-type="chooseAvatar"
              hover-class="none"
              @chooseavatar="chooseavatar"
              @click="hanleGetphoto"
            >
              <image :src="form.headpath" class="photo" />
              <view v-if="!form.headpath" class="get-btn">点击获取头像</view>
            </button>
          </u-form-item>
          <u-form-item label="昵称" prop="nickname">
            <nickname-input v-model="form.nickname" class="input-text" />
          </u-form-item>
          <view class="btn-submit c-f" @tap="handleSubmit">同意授权</view>
        </u-form>
      </view>
    </u-mask>
  </view>
</template>

<script>
import { compareVersion } from 'packages/utils'
import { chooseImg } from '@/utils/upload'
import { uploadImg } from '@/utils/upload'
import NicknameInput from 'packages/components/nickname-input/index.vue'
import { apiSetStoreNickNamePath } from '@/api/common'
export default {
  components: {
    NicknameInput
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      newVersion: true, // 是否2.21.2版本库以上
      userVisible: false,
      form: {
        nickname: '',
        headpath: ''
      }
    }
  },
  watch: {
    value(newValue) {
      this.userVisible = newValue
      if (!newValue) {
        this.form = {
          nickname: '',
          headpath: ''
        }
      }
    }
  },
  created() {
    this.newVersion = compareVersion('2.21.2')
  },
  methods: {
    chooseavatar(e) {
      let { avatarUrl } = e.detail
      this.updatePhoto(avatarUrl)
    },
    async hanleGetphoto() {
      if (!this.newVersion) {
        const paths = await chooseImg({
          mediaType: ['image'],
          sizeType: ['compressed']
        })
        if (paths?.length) {
          this.updatePhoto(paths[0])
        }
      }
    },
    async updatePhoto(url) {
      let res = await uploadImg(url)
      if (this.$ck(res, true)) {
        this.form.headpath = res.return_data
      }
    },
    handleSubmit() {
      if (!this.form.nickname.trim()) {
        return this.$msg('请输入昵称')
      }
      if (!this.form.headpath.trim()) {
        return this.$msg('请选择头像')
      }
      apiSetStoreNickNamePath(this.form).then(async res => {
        if (this.$ck(res)) {
          // 发射更新事件
          uni.$emit('updateUserAuthInfo')
          this.$msg('操作成功', { icon: 'success' })
          this.$emit('input', false)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-dialog {
  background: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  border-radius: 30rpx 30rpx 0 0;
  height: 460rpx;
  transition: all 0.2s ease-in;

  .close-btn {
    position: absolute;
    top: -85rpx;
    right: 30rpx;
    font-size: 54rpx;
  }

  .title {
    margin-top: 80rpx;
    text-align: center;
    font-size: 28rpx;
    .mb {
      font-weight: bold;
    }
  }

  .photo-box {
    align-items: center;
    background: #fff;

    .photo {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
    }

    .get-btn {
      padding: 0 16rpx;
      height: 54rpx;
      line-height: 54rpx;
      background: #ffffff;
      border: 2rpx solid #3f7ee6;
      border-radius: 27rpx;
      color: #3f7ee6;
      margin-left: 30rpx;
      font-size: 24rpx;
    }
  }

  .tips {
    margin-top: 16rpx;
    text-align: center;
    font-size: 24rpx;
    color: #aaaaaa;
  }
}

.btn-submit {
  width: 360rpx;
  height: 80rpx;
  margin-left: 50%;
  transform: translate(-50%, 0);
  line-height: 80rpx;
  text-align: center;
  background: #1abf1a;
  border-radius: 10rpx;
  font-weight: bold;
  margin-top: 60rpx;
  margin-bottom: 50rpx;
  margin-bottom: constant(50rpx + safe-area-inset-bottom);
  margin-bottom: env(50rpx + safe-area-inset-bottom);
}
</style>
