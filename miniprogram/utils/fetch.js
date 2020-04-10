export const cloudCallFunction = ({ name, data = {}, config = {} }) => {
  console.log('name, data :', name, data);
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      config
    }).then(callRes => {
      console.log('callRes :', callRes);
      const { errMsg = '', result } = callRes
      if (result && errMsg.includes('ok')) {
        let apiResult = result
        if (apiResult.status === 0) {
          const finalResult = apiResult.data || {}
          if (Array.isArray(finalResult)) resolve(finalResult || []) // 兼容返回data是数组的情况
          if (Object.keys(finalResult).length === 0) resolve(finalResult || {})  // 某些接口判断返回data字段是否是空对象的逻辑，所以这里针对空对象不增加__serverTime__字段

          let { time: __serverTime__ } = apiResult
          resolve({ ...finalResult, __serverTime__ } || {})
        } else {
          reject(apiResult)
        }

      } else {
        reject(result)
      }
    }).catch(error => {
      // console.log('error :', error);

      reject(error)
    })

  })
}