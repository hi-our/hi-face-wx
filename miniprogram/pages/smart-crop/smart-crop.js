import { imgSecCheck } from '../myFunc.js'
import { uploadFileToCloud } from '../../utils/upload'

Page({
  data: {
    bigPic: '/images/bigPic.jpg',
    faceScaned1: '/images/1.jpg',
    faceScaned2: '/images/2.jpg',
    faceScaned3: '/images/3.jpg',
  },

  onShareAppMessage: function () {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    return {
      title: '人像魅力',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/smart-crop/smart-crop'
    }
  },

  async mainFunc() {

    const imgPaths = await this.chooseImg()
    wx.showLoading({
      title: '图片处理中...',
    })

    const { safeCheckResults, fileID } = await this.uploadToCloudAndCheck(imgPaths)
    wx.hideLoading()

    // 这里先处理正常的，再处理异常
    if (safeCheckResults.status === 0) {
      await this.zoomImg(fileID)
      return
    }
    
    //图片违禁
    if (safeCheckResults.status === -1000) {
      wx.showModal({
        title: '提示',
        content: '图片含违禁内容，请更换图片',
        showCancel: false,
      })
      return 1
    }

    //图片安全校验出错
    wx.showModal({
      title: '提示',
      content: '图片校验出错，请重试',
      showCancel: false,
    })

  },

  //选择图片
  async chooseImg() {

    const temImg = await wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    })

    let bigPic = temImg.tempFilePaths[0]
    this.setData({
      bigPic: bigPic
    })

    return bigPic
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

    // TODO，这里再改改
    let cloudPrefix = 'cloud://development-9p1it.6465-development-9p1it-1301318001/'


    that.setData({
      faceScaned1: cloudPrefix + zoomImgs[0].Key,
      faceScaned2: cloudPrefix + zoomImgs[1].Key,
      faceScaned3: cloudPrefix + zoomImgs[2].Key,
    })
  }
})
