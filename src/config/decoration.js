import { staticURL } from './index'
export const initPageSetting = () => {
  return {
    Title: '万能零售助手',
    PageBgColor: '#f4f4f4',
    BgColor: '#ff7640',
    FrontColor: '#000000',
    bgUrl: `${staticURL()}shop/home-bg.jpg`,
    statusColor: '#000000'
  }
}
export const initHomeComponents = () => {
  return [
    {
      code: 'RetailStoreInfo',
      data: { color: '#fff', brandColor: '#fff' }
    },
    {
      code: 'RetailDashboardHome',
      data: { showAssets: true, assetsBgUrl: `${staticURL()}shop/overview-pic.png`, showNotice: true }
    }
  ]
}

export const initLoginPage = () => {
  return {
    imgUrl: `${staticURL()}login/logo.jpg`,
    welcomeTip: '欢迎登录万能零售助手',
    showAccountPw: true
  }
}
export const initGlobalTheme = () => {
  return {
    color: '#ff7640'
  }
}
export const initMyPageSetting = () => {
  return {
    Title: '万能零售助手',
    PageBgColor: '#f4f4f4',
    BgColor: '#fff',
    FrontColor: '#000000',
    bgUrl: '',
    statusColor: '#000000'
  }
}
export const initMyComponents = () => {
  return [
    {
      code: 'RetailUserInfo',
      data: { color: '#fff', bgUrl: `${staticURL()}personal/bg.png` }
    },
    { code: 'RetailBrandName', data: {} },
    {
      code: 'BlankSegmente',
      data: {
        Type: 'blank',
        Height: 10,
        BgColor: 'rgba(255, 255, 255, 0)',
        LineColor: '#e5e5e5',
        LineGap: 15,
        LineType: 'solid'
      }
    },
    {
      code: 'RetailMyOrder',
      data: {
        All: [
          { Id: 1, Name: '全部', Icon: 'iconquanbuicon', Checked: 1 },
          { Id: 2, Name: '兑换中', Icon: 'iconduihuanzhong', Checked: 0 },
          { Id: 3, Name: '待付款', Icon: 'icondaifukuan1', Checked: 1 },
          { Id: 4, Name: '待发货', Icon: 'icondaifahuo1', Checked: 1 },
          { Id: 5, Name: '待收货/核销', Icon: 'icondaishouhuo', Checked: 1 },
          { Id: 6, Name: '已完成', Icon: 'iconyiwancheng', Checked: 0 },
          { Id: 7, Name: '退款/失败', Icon: 'icontuikuanshibai', Checked: 0 },
          { Id: 8, Name: '售后订单', Icon: 'icontuikuan', Checked: 0 }
        ]
      }
    },
    { code: 'RetailStaffMgmt', data: {} },
    {
      code: 'RetailOtherMgmt',
      data: {
        Items: [
          { Id: 1, Name: '收货地址', Show: true, Sort: 0 },
          { Id: 2, Name: '我的奖品', Show: true, Sort: 1 },
          { Id: 3, Name: '客服中心', Show: true, Sort: 2 }
        ]
      }
    }
  ]
}

export const initTabbar = () => {
  return {
    color: '#999',
    selectedColor: '#ff7640',
    bgColor: '#fff',
    Navigation: [
      {
        Id: 1,
        Name: '首页',
        Icon: `${staticURL()}tabbar/home.png`,
        activeIcon: `${staticURL()}tabbar/home_active.png`,
        Appid: '',
        Path: '/pages/index/index',
        IsCustom: 0
      },
      {
        Id: 2,
        Name: '云店',
        Icon: `${staticURL()}tabbar/cloud.png`,
        activeIcon: `${staticURL()}tabbar/cloud_active.png`,
        Appid: '',
        Path: '/cloud/index',
        IsCustom: 0
      },
      {
        Id: 3,
        Name: '活动',
        Icon: `${staticURL()}tabbar/activity.png`,
        activeIcon: `${staticURL()}tabbar/activity_active.png`,
        Appid: '',
        Path: '/activity-tab/index',
        IsCustom: 0
      },
      {
        Id: 4,
        Name: '消息',
        Icon: `${staticURL()}tabbar/message.png`,
        activeIcon: `${staticURL()}tabbar/message_active.png`,
        Appid: '',
        Path: '/the-message/index',
        IsCustom: 0
      },
      {
        Id: 5,
        Name: '我的',
        Icon: `${staticURL()}tabbar/me.png`,
        activeIcon: `${staticURL()}tabbar/me_active.png`,
        Appid: '',
        Path: '/pages/me/index',
        IsCustom: 0
      }
    ]
  }
}
