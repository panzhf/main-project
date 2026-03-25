import dayjs from 'dayjs'
export default {
  data() {
    return {
      form: {
        IsExpress: 0,
        ExpressCompany: '',
        ExpressCode: '',
        ExpressNumber: '',
        Remarks: '',
        EstimatedDeliveryTime: ''
      },
      pickerParams: {
        year: true,
        month: true,
        day: true,
        hour: true,
        minute: true,
        second: false
      },
      showTimePicker: false
    }
  },
  methods: {
    timePickerConfirm(e) {
      const selected = dayjs(`${e.year}-${e.month}-${e.day} ${e.hour}:${e.minute}:00`)
      const now = dayjs()
      if (selected.isBefore(now)) {
        this.$msg('预计送达时间有误，请重新选择！')
        return
      }
      this.form.EstimatedDeliveryTime = `${e.year}-${e.month}-${e.day} ${e.hour}:${e.minute}:00`
    }
  }
}
