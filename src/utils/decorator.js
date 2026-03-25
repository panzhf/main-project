/**
 * 防止函数重复执行
 * eg. @Lock
 *     async login() {}
 */
export function Lock(target, name, descriptor) {
  const fn = descriptor.value
  let $$LockIsDoing = false

  const reset = () => ($$LockIsDoing = false)
  descriptor.value = function (...args) {
    if ($$LockIsDoing) return
    $$LockIsDoing = true

    const ret = fn.apply(this, args)

    if (ret && ret.then) {
      // is promise
      return ret.then(
        succ => {
          reset()
          return Promise.resolve(succ)
        },
        fail => {
          reset()
          return Promise.reject(fail)
        }
      )
    } else {
      reset()
      return ret
    }
  }

  return descriptor
}
/**
 * 单例 防重复
 * eg. @Singleton
 *     async login() {}
 */
export function Singleton(target, name, descriptor) {
  const oriFunc = descriptor.value
  let runningInstance = null

  descriptor.value = function (...args) {
    // 若步骤正在进行，则监听并使用其执行结果，而不是重新发起该步骤
    if (runningInstance) {
      return runningInstance
    }
    const res = oriFunc.apply(this, args)

    if (!(res instanceof Promise)) {
      return res
    }

    runningInstance = res
    runningInstance
      .then(() => {
        runningInstance = null
      })
      .catch(() => {
        runningInstance = null
      })
    return runningInstance
  }
}
