//上传到云存储
export function uploadFileToCloud(filePath) {
  return new Promise(function (resolve, reject) {
    wx.cloud.uploadFile({
      cloudPath: (new Date().getTime()) + '.png',
      filePath: filePath,
    }).then(res => {
      // console.log(res)
      resolve(res.fileID)
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
