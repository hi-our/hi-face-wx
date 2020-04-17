// miniprogram/pages/face-love/face-love.js
import { imgSecCheck, faceImgCheck, cropImg } from '../myFunc.js'
import { uploadFileToCloud } from '../../utils/upload'

Page({
  data: {
    bigPic: '/images/bigPic.jpg',
    faceScaned1: '/images/1.jpg',
    faceScaned2: '/images/2.jpg',
    faceScaned3: '/images/3.jpg',
  },

  async mainFunc(e) {
    let that = this
    const imgPaths = await that.chooseImg()
    wx.showLoading({
      title: '图片处理中...',
    })
    const { safeCheckResults, fileID } = await that.uploadToCloudAndCheck(imgPaths)
    if (safeCheckResults.status === -1000) {//图片违禁
      wx.hideLoading({})
      wx.showModal({
        title: '提示',
        content: '图片含违禁内容，请更换图片',
        showCancel: false,
      })
      return 1
    } else if (safeCheckResults.status == 0) {
      const zoomImgs = await that.zoomImg(fileID)
      wx.hideLoading({})
      return
    } else {//图片安全校验出错
      wx.hideLoading({})
      wx.showModal({
        title: '提示',
        content: '图片校验出错，请重试',
        showCancel: false,
      })
      return 1
    }
  },

  //选择图片
  async chooseImg() {
    var that = this
    const temImg = await wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    })
    that.setData({
      bigPic: temImg.tempFilePaths[0]
    })
    return temImg.tempFilePaths[0]
  },

  //上传到云存储，并校验图片安全
  async uploadToCloudAndCheck(imgPaths) {
    //上传到云存储
    const fileID = await uploadFileToCloud(imgPaths)
    //图片安全校验
    const checkResults = await imgSecCheck(fileID)
    const safeCheckResults = checkResults.result
    return { safeCheckResults, fileID }
  },

  //智能缩小
  async zoomImg(fileID) {
    let that = this
    const res = await wx.cloud.callFunction({
      name: 'zoomImg',
      data: {
        fileID: fileID
      }
    })
    const zoomImgs = res.result.UploadResult.ProcessResults.Object
    console.log(zoomImgs)
    const faceScaned1 = 'cloud://development-9p1it.6465-development-9p1it-1301318001/' + zoomImgs[0].Key
    const faceScaned2 = 'cloud://development-9p1it.6465-development-9p1it-1301318001/' + zoomImgs[1].Key
    const faceScaned3 = 'cloud://development-9p1it.6465-development-9p1it-1301318001/' + zoomImgs[2].Key
    console.log(faceScaned1)
    that.setData({
      faceScaned1: faceScaned1,
      faceScaned2: faceScaned2,
      faceScaned3: faceScaned3
    })
    return 0
  },

  onShareAppMessage: function () {
  }
})