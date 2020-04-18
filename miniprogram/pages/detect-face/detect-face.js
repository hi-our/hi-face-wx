// miniprogram/pages/face-love/face-love.js
import { imgSecCheck, faceDetect } from '../myFunc.js'
import { uploadFileToCloud } from '../../utils/upload'

Page({
  data: {
    shapeIndex: false,
    shapes: [],
    bigPic: '/images/bigPic.jpg',
    litPic: '/images/bigPic.jpg',
    facePics: [1, 2, 3].map(item => `/images/${item}.jpg`),
    background: 'rgb(139, 59, 112)',
  },
  onShareAppMessage: function () {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    return {
      title: '人像魅力',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/detect-face/detect-face'
    }
  },

  async mainFunc() {

    const imgPaths = await this.chooseImg()

    wx.showLoading({
      title: '图片处理中...',
    })

    const { safeCheckResults, fileID } = await this.uploadToCloudAndCheck(imgPaths)

    if (safeCheckResults.status === 0) {
      const faceInfos = await this.findFacesInImg(fileID)
      await this.getImgAveAndFaces(fileID, faceInfos)
      wx.hideLoading()
      return
    }

    //图片违禁
    if (safeCheckResults.status === -1000) {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '图片含违禁内容，请更换图片',
        showCancel: false,
      })
      return
    }

    wx.hideLoading()
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
      bigPic,
      litPic: bigPic,
    })

    return bigPic
  },

  //上传到云存储，并校验图片安全
  async uploadToCloudAndCheck(imgPaths) {
    //上传到云存储
    const fileID = await uploadFileToCloud(imgPaths)

    //图片安全校验
    const { result } = await imgSecCheck(fileID)

    return {
      safeCheckResults: result,
      fileID
    }
  },

  //执行人脸识别
  async findFacesInImg(fileID) {

    //图片正常，调用人脸识别，拿到识别到的面部宽高和在图片的位置
    const { FaceInfos, ImageWidth } = await faceDetect(fileID)

    //根据拿到的位置信息，在原图（bigPic）中加上人脸框
    const turnRatio = ImageWidth / 600
    let shapes = FaceInfos.map(face => {
      const { X, Y, Width, Height } = face

      return {
        x: X / turnRatio,
        y: Y / turnRatio,
        width: Width / turnRatio,
        height: Height / turnRatio,
      }
    })

    console.log('shapes :', shapes)

    this.setData({
      currentShapeIndex: 0,
      shapes,
    })
    return FaceInfos
  },

  //获取主色调+人脸图，并更改到视图层
  async getImgAveAndFaces(fileID, faceInfos) {
    const results = await wx.cloud.callFunction({
      name: 'getImgAveAndFaces',
      data: {
        fileID: fileID,
        faceInfos: faceInfos
      }
    })

    const { RGB = '', base64Mains = [] } = results.result
    const background = RGB.replace('0x', '#')

    //更改视图层的主色调
    wx.setNavigationBarColor({
      backgroundColor: background,
      frontColor: '#ffffff',
    })

    //将base64Main展示在视图层
    let facePics = base64Mains.map(item => `'data:image/png;base64, ${item}]`)

    this.setData({
      background,
      facePics
    })
  },
})
