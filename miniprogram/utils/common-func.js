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
async function faceDetect(fileID) {
  const results = await wx.cloud.callFunction({
    name: 'faceDetect',
    data: {
      fileID: fileID
    }
  })

  return results.result
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

  return results
};

const GENDER_STATUS = ['未知', '男', '女']

const EXPRESS_MOOD = ['黯然伤神', '半嗔半喜', '似笑非笑', '笑逐颜开', '莞尔一笑', '喜上眉梢', '眉开眼笑', '笑尽妖娆', '心花怒放', '一笑倾城']

const HAVE_STATUS = ['无', '有']

module.exports = {
  uploadFileToCloud: uploadFileToCloud,
  imgSecCheck: imgSecCheck,
  faceDetect: faceDetect,
  cropImg: cropImg,
  GENDER_STATUS: GENDER_STATUS,
  EXPRESS_MOOD: EXPRESS_MOOD,
  HAVE_STATUS: HAVE_STATUS,
}