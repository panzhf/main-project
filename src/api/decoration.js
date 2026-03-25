import { httpGet } from '@/utils/request'

export const apiHomePage = data =>
  httpGet('/decrationcenter/api/v1/Decration/HomeDetail', data, { isBase: true, loading: false })
export const apiLoginPage = data =>
  httpGet('/decrationcenter/api/v1/Decration/StoreLoginPage', data, {
    isBase: true,
    requireAuth: false,
    loading: false
  })
export const apiGlobalTheme = data =>
  httpGet('/decrationcenter/api/v1/Decration/StoreGlobalTheme', data, {
    isBase: true,
    requireAuth: false,
    loading: false
  })
export const apiMyPage = data =>
  httpGet('/decrationcenter/api/v1/Decration/GetMyPage', data, { isBase: true, loading: false })
export const apiRegisterPage = data =>
  httpGet('/decrationcenter/api/v1/Decration/StoreRegisterPage', data, {
    isBase: true,
    requireAuth: false,
    loading: false
  })
