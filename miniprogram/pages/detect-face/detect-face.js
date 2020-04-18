// miniprogram/pages/face-love/face-love.js
import { imgSecCheck, faceDetect, cropImg } from '../myFunc.js'
import { uploadFileToCloud } from '../../utils/upload'

Page({
  data: {
    shapeIndex: false,
    shapes: [],
    bigPic: '/images/bigPic.jpg',
    litPic: '/images/bigPic.jpg',
    facePics: ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/2.jpg', '/images/3.jpg', '/images/2.jpg', '/images/3.jpg'],
    background: 'rgb(139, 59, 112)',
  },

  async mainFunc(e) {
    let that = this
    const imgPaths = await that.chooseImg()
    wx.showLoading({
      title: '图片处理中...',
    })
    const { safeCheckResults, fileID } = await that.uploadToCloudAndCheck(imgPaths)
    if (safeCheckResults.status === -1000) {//图片违禁
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '图片含违禁内容，请更换图片',
        showCancel: false,
      })

    } else if (safeCheckResults.status == 0) {
      const faceInfos = await that.findFacesInImg(fileID)
      await that.getImgAveAndFaces(fileID, faceInfos)
      wx.hideLoading()

    } else {//图片安全校验出错
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '图片校验出错，请重试',
        showCancel: false,
      })

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
      bigPic: temImg.tempFilePaths[0],
      litPic: temImg.tempFilePaths[0],
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

  //执行人脸识别
  async findFacesInImg(fileID) {
    let that = this
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

    console.log('shapes :', shapes);

    that.setData({
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

    const { RGB, base64Mains } = results.result
    const background = RGB.replace("0x", "#")

    //更改视图层的主色调
    wx.setNavigationBarColor({
      backgroundColor: background,
      frontColor: '#ffffff',
    })

    //将base64Main展示在视图层
    let facePics = []
    for (let i = 0; i < base64Mains.length; i++) {
      let picUrl = 'data:image/png;base64,' + base64Mains[i]
      facePics.push(picUrl)
    }

    this.setData({
      background: background,
      facePics: facePics
    })

    return results.result
  },

  onLoad: function (options) {
  },

  onShareAppMessage: function () {
  }
})