import { httpPost, httpGet, httpWrap } from '@/utils/request'

export const apiAuthCode = data => httpPost('retailcommon/authcode', data, { requireAuth: false }) // 判断手机号获取验证码
export const apiNoAuthCode = data => httpPost('retailcommon/getauth', data, { requireAuth: false }) // 普通获取验证码
export const apiValidateCode = data => httpPost('retailcommon/validatesmscode', data, { requireAuth: false }) // 核对短信验证码
export const apiWxMobileCheck = data => httpPost('retailcommon/wxmobilecheck', data) // 微信手机授权验证
export const apigetclerkapproveToken = data => httpPost('clerkmanage/getclerkapprove', data) // 保存店员选择店铺取mtoken
export const apiGetUserMobile = data =>
  httpPost('retailcommon/wxaccreditmobile', data, { loading: true, requireAuth: false }) // 获取微信手机号
// export const apiGetUserMenu = data => httpGet('clerkmanage/menu', data) // 获取菜单

export const apiGetUserMenu = data => httpGet('storemanage/getmenulist', data) // 获取菜单
export const apiBindOpenId = data => httpPost('clerkmanage/bindopenid', data) // 绑定公众号openid
export const apiResetForgetPasswordByCode = data => httpPost('commanage/forgetpwdbycode', data, { requireAuth: false }) // （忘记密码）修改密码
export const apiGetExtraList = data => httpGet('storemanage/getassetsinfo', data) // 获取积分返货券

export const apiGetShopSizes = (data, loading = true) =>
  httpGet('commanage/getshopsizes', data, { requireAuth: false, loading }) // 获取面积

export const apiMpInfo = data => httpGet('storemanage/getmemberloginmp', data, { loading: true }) // 获取品牌小程序信息

// 根据品牌商和经销商id获取注册信息
export const apiGetRegisterInfo = (data, loading = true) =>
  httpPost('retailcommon/getregisterinfobymandd', data, { requireAuth: false, loading })

// 检查门店是否可以关联经销商
export const apiCheckRelation = data => httpPost('commanage/checkrelationdealer', data, { requireAuth: false })

// 添加门店与经销商关联关系
export const apiRelate = data => httpPost('commanage/addrelationdealer', data, { requireAuth: false })

// 根据sso_token快速登录
export const apiLoginByToken = data => httpPost('omnipotentRetail/loginbyssotoken', data, { requireAuth: false })

// 根据品牌编号返回品牌数据
export const apiGetMemberInfo = data => httpGet('commanage/getnamebymemberlogin', data, { loading: true })

// 获取门店绑定的微信头像和昵称
export const apiGetStoreNickNamePath = data => httpGet('clerkmanage/getwechatinfo', data, { loading: true })

// 设置门店微信头像和昵称
export const apiSetStoreNickNamePath = data => httpPost('clerkmanage/authorizedavatar', data, { loading: true })

// 获取静默授权链接
export const apiGetAuthPath = data => httpGet('storemanage/getauthorizedaddress', data, { loading: true })

// 设置门店绑定微信
export const apiBindWxOpenId = data => httpPost('clerkmanage/updatewechat', data, { loading: true })

// 获取小程序账号列表
export const apiSearchMpInfo = data => httpPost('retailcommon/searchMiniProgramInfo', data)
// 检验码是否是初次
export const apiCheckopenidisscan = data =>
  httpPost('retailcommon/checkopenidisscan', data, { requireAuth: false, loading: false })
// 配置是否已注册
export const apiCheckregister = data =>
  httpPost('retailcommon/checkregister', data, { requireAuth: false, loading: false })

// 佳洁士写日志
export const apijiajiehsiSaomaLog = data =>
  httpPost('retailcommon/jiajiehsiSaomaLog', data, { requireAuth: false, loading: false })
// 获取门店注册图片广告（暂只有佳洁士）
export const apiGetStoreBannerConfig = data =>
  httpPost('retailcommon/getbannerconfig', data, { requireAuth: false, loading: false })

// 按中心点经纬度分页获取周边门店（门店注册-门店名称建议）- 走公用接口 miduobasebackendapi
export const apiWeizhiPage = data =>
  httpWrap({
    url: 'api/weizhi/page',
    data,
    method: 'post',
    type: 14,
    options: { requireAuth: false, loading: false }
  })
