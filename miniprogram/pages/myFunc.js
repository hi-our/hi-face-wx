const db = wx.cloud.database()
var openid = getApp().globalData.openid


//上传到云存储
function uploadFileToCloud(filePath) {
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
};

//图片安全校验
async function imgSecCheck(fileID) {
  const results = await wx.cloud.callFunction({
    name: 'image-safe-check',
    data: {
      fileID: fileID
    }
  })
  // console.log(results)
  if (typeof (results.result) == "number") {
    results.result = [results.result]
  }
  return results
};

//识别人脸
async function faceImgCheck(fileID) {
  // console.log(fileID)
  const results = await wx.cloud.callFunction({
    name: 'faceImgCheck',
    data: {
      fileID: fileID
    }
  })
  // console.log(results)
  // console.log(results.result.FaceInfos)
  return results.result.FaceInfos
};

//裁剪识别的面部图片
async function cropImg(fileID, faceInfos) {
  const results = await wx.cloud.callFunction({
    name: 'cropImg',
    data: {
      fileID: fileID,
      faceInfos: faceInfos,
    }
  })
  // console.log(results)
  return results
};


module.exports = {
  uploadFileToCloud: uploadFileToCloud,
  imgSecCheck: imgSecCheck,
  faceImgCheck: faceImgCheck,
  cropImg: cropImg
}