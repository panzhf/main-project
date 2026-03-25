/** 计算加减乘除 */
export const calcNumberT = {
  methods: {
    calcNumber(num1, num2, type = 'add') {
      let baseNum = 0
      let baseNum1 = 0
      let baseNum2 = 0
      let baseNum3 = 0
      let baseNum4 = 0 /** 结果 */
      let result = 0 /** 精度 */
      let precision = 0

      try {
        baseNum1 = num1.toString().split('.')[1].length
        baseNum2 = num2.toString().split('.')[1].length
      } catch (e) {
        baseNum1 = 0
        baseNum2 = 0
      }

      switch (type) {
        case 'add':
          baseNum = Math.pow(10, Math.max(baseNum1, baseNum2))
          result = (num1 * baseNum + num2 * baseNum) / baseNum
          break
        case 'sub':
          precision = Math.max(baseNum1, baseNum2)
          baseNum = Math.pow(10, precision)
          result = ((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision)
          break
        case 'multi':
          try {
            baseNum += num1.toString().split('.')[1].length
          } catch (e) {}
          try {
            baseNum += num2.toString().split('.')[1].length
          } catch (e) {}
          result =
            (Number(num1.toString().replace('.', '')) * Number(num2.toString().replace('.', ''))) /
            Math.pow(10, baseNum)
          break
        case 'divide':
          baseNum3 = Number(num1.toString().replace('.', ''))
          baseNum4 = Number(num2.toString().replace('.', ''))
          result = (baseNum3 / baseNum4) * Math.pow(10, baseNum2 - baseNum1)
          break
      }

      return result
    }
  }
}
