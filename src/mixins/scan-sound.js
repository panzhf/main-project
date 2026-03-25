/*
 * @Description 扫码结果的声音
 */
import { staticURL } from '@/config'
const scanSoundMixmin = {
  methods: {
    handleSoundResult(state, type = 0) {
      let Audio = uni.createInnerAudioContext()
      Audio.autoplay = true
      const success = type === 1 ? 'wrifeoff/success.wav' : 'ok.wav'
      const fail = type === 1 ? 'wrifeoff/fail.wav' : 'error.wav'

      Audio.src = staticURL() + 'media/' + (state ? success : fail)
      Audio.onPlay()
    }
  }
}
export default scanSoundMixmin
