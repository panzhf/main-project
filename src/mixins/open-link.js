import navigateToMP from '@/utils/navigate-mp'
const openLinkMixin = {
  methods: {
    handleOpenLink(item) {
      navigateToMP({
        appId: item.Appid,
        path: item.Link,
        type: item.LinkType,
        scene: item.SceneType,
        isReLanuch: item.isReLanuch
      })
    }
  }
}
export default openLinkMixin
