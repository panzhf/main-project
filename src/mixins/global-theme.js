import { mapState, mapGetters } from 'vuex'

// export default {
//   computed: {
//     ...mapState('theme', ['themeInfo']),
//     ...mapGetters('theme', ['themeVars'])
//   }
// }

export default {
  computed: {
    ...mapState(['themeInfo']),
    ...mapGetters(['themeVars'])
  }
}
