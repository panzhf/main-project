<template>
  <view class="address-edit" :style="themeVars">
    <view style="padding: 20rpx 20rpx 0">
      <view class="address-info">
        <view class="user-name ub ub-ac">
          <view class="mark">收货人</view>
          <view class="ub-ac">
            <input
              v-model="form.Name"
              name="consignee"
              type="text"
              placeholder="请填写真实姓名，否则无法寄送"
              placeholder-class="address-placeholder"
              maxlength="30"
            />
          </view>
        </view>
        <view class="tel-number ub">
          <view class="mark">手机号码</view>
          <view class="ub-ac">
            <input
              v-model="form.Mobile"
              name="mobile"
              type="number"
              placeholder="11位手机号"
              placeholder-class="address-placeholder"
              maxlength="11"
            />
          </view>
        </view>
        <view class="region ub">
          <view class="mark">选择地区</view>
          <view class="ub-ac" style="position: relative">
            <picker mode="region" name="region" :value="region" @change="onPickerChange">
              <view style="width: 90%" class="picker">
                {{ region[0] || '省、' }} {{ region[1] || '市、' }} {{ region[2] || '区/县' }}
              </view>
              <text class="iconfont icon-down-arrow"></text>
            </picker>
          </view>
        </view>
        <view class="detail-info ub">
          <view class="mark">详细地址</view>
          <view class="ub-ac">
            <input
              v-model="form.Address"
              name="address"
              type="text"
              placeholder="乡/镇、街道、门牌信息"
              placeholder-class="address-placeholder"
              maxlength="80"
            />
          </view>
        </view>
      </view>
      <view class="set-default">
        <view class="mark ub-f1">设为默认地址</view>
        <view>
          <switch name="isdefault" :checked="form.IsDefault" @change="onSwitchChange" />
        </view>
      </view>
    </view>
    <view class="btn-submit">
      <button class="primary-btn round" hover-class="button-action" @tap="onSubmit">保存</button>
    </view>
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
export default {
  data() {
    return {
      region: [],
      form: {
        Name: '',
        Mobile: '',
        IsDefault: 0,
        Address: '',
        ProvinceCode: '',
        ProvinceName: '',
        CityCode: '',
        CityName: '',
        TownCode: '',
        TownName: ''
      },
      type: ''
    }
  },
  onLoad(option) {
    if (option.row) {
      let row = JSON.parse(option.row)
      this.form = row
      this.region = [row.ProvinceName, row.CityName, row.TownName]
      this.type = 'edit'
    }
  },
  methods: {
    onPickerChange(e) {
      this.region = e.detail.value
      this.form.ProvinceCode = e.detail.code[0]
      this.form.CityCode = e.detail.code[1]
      this.form.TownCode = e.detail.code[2]
      this.form.ProvinceName = e.detail.value[0]
      this.form.CityName = e.detail.value[1]
      this.form.TownName = e.detail.value[2]
    },
    onSwitchChange(e) {
      this.form.IsDefault = Number(e.detail.value)
    },
    async onSubmit() {
      let resVerify = this.verifyForm(this.form)
      if (resVerify) return this.$msg(resVerify)
      this.$loading.show('保存中...')
      let res = await apiCloud({
        url: `/api/v1/Store/${this.type ? 'UpdateSellerAddress' : 'CreateSellerAddress'}`,
        method: 'post',
        data: JSON.stringify(this.form)
      })
      if (this.$ck(res)) this.$goBack()
    },
    /** 表单验证 */
    verifyForm(form) {
      /* eslint-disable */
      var reg = /\\+|\~+|\!+|¥+|\￥+|\%+|\^+|\&+|\*+|\(+|\)+|\'+|\$+|`+\s+|\;+/g;
      /* eslint-enable */
      if (form.Name.trim() === '') {
        return '请输入收货人姓名'
      }
      if (!/^([\u4e00-\u9fa5]|[a-zA-Z0-9]|[()]){1,30}$/.test(form.Name)) {
        return '收货人姓名不能包含特殊字符'
      }
      if (form.Mobile.trim() === '' || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(form.Mobile)) {
        return '请输入正确的手机号码'
      }
      if (this.region.length === 0) {
        return '请选择省 市 区/县'
      }
      if (form.Address.trim() === '') {
        return '请输入详细地址'
      }
      var str = form.Address.replace(reg, '')
      if (str.length > 80) {
        return '亲，详细地址不能超过80个字~'
      }
      return ''
    }
  }
}
</script>

<style lang="scss">
.address-edit {
  position: relative;
  .address-info {
    padding: 0 20rpx;
    background-color: #fff;
    border-radius: 10rpx;
    & > view {
      border-bottom: 0.5rpx solid #eee;
      &:last-child {
        border-bottom: none;
      }
    }
  }
  input,
  .picker,
  textarea {
    width: 100%;
    font-size: 26rpx;
    color: #333;
    line-height: 90rpx;
  }
  picker {
    width: 100%;
  }
  textarea {
    height: 66rpx;
    line-height: 1;
  }
  .mark {
    padding-right: 20rpx;
    font-size: 26rpx;
    color: #333;
    line-height: 90rpx;
  }
  .set-default {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
    padding: 0 20rpx;
    background-color: #fff;
    border-radius: 10rpx;
  }
  .btn-submit {
    position: fixed;
    bottom: 40rpx;
    bottom: calc(40rpx + constant(safe-area-inset-bottom));
    width: 100%;
    padding: 0 20rpx;
  }
}
.ub {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .ub-ac {
    flex: 1;
    .icon-down-arrow {
      position: absolute;
      right: 8rpx;
      top: 34rpx;
      font-size: 20rpx;
    }
  }
}
.bgc-red {
  background-color: #dd2726;
}
.address-placeholder {
  font-size: 26rpx;
  color: #ccc;
}
</style>
