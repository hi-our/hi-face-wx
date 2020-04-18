// miniprogram/pages/face-love/face-love.js
import { imgSecCheck, faceImgCheck, cropImg } from '../myFunc.js'
import { uploadFileToCloud } from '../../utils/upload'

Page({
  data: {
    shapeIndex: false,
    shapes: [],
    bigPic: '/images/bigPic.jpg',
    litPic: '/images/bigPic.jpg',
    facePics: ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/2.jpg', '/images/3.jpg', '/images/2.jpg', '/images/3.jpg'],
    background: 'rgb(139, 59, 112)',
    // indentationW: 75
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
      const faceInfos = await that.findFacesInImg(fileID)
      const { RGB, base64Main, fileContent } = await that.testImgAve(fileID, faceInfos)
      wx.hideLoading({})
      return 0
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

  //获取主色调并更改到视图层
  async testImgAve(fileID, faceInfos) {
    const results = await wx.cloud.callFunction({
      name: 'getMainColor',
      data: {
        fileID: fileID,
        faceInfos: faceInfos
      }
    })

    const { RGB, base64Main, fileContent } = results.result
    const background = RGB.replace("0x", "#")

    //更改视图层的主色调
    wx.setNavigationBarColor({
      backgroundColor: background,
      frontColor: '#ffffff',
    })

    //将base64Main展示在视图层
    let picUrl = "data:image/png;base64," + base64Main
    this.setData({
      background: background,
      facePics: [picUrl]
    })

    return results.result
  },

  //执行人脸识别
  async findFacesInImg(fileID) {
    let that = this
    //图片正常，调用人脸识别，拿到识别到的面部宽高和在图片的位置
    const { FaceInfos, ImageWidth } = await faceImgCheck(fileID)

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

  //根据拿到的脸部坐标，进行图片裁剪
  async cropFacesFromImg(imgUrl, faceInfos) {
    let that = this
    let corpImgUrls = []
    console.log(imgUrl) //https://6465-development-9p1it-1301318001.tcb.qcloud.la/1587209749578.png
    const res = await fetch.get(imgUrl + '?imageAve')
    console.log(res)
    //拿到识别到的面部宽高和在图片的位置dx、dy后，调用裁剪函数


    // const a = await cropImg(fileID, faceInfos)
    // console.log(a)
    // const absoluteUrls = a.result.UploadResult.ProcessResults.Object
    // // console.log(absoluteUrls)
    // if (absoluteUrls.Key) {
    //   let corpImgUrl = 'cloud://development-9p1it.6465-development-9p1it-1301318001/' + absoluteUrls.Key
    //   // console.log(corpImgUrl)
    //   corpImgUrls.push(corpImgUrl)
    // } else {
    //   //拿到裁剪后的图片地址
    //   for (let i = 0; i < absoluteUrls.length; i++) {
    //     let corpImgUrl = 'cloud://development-9p1it.6465-development-9p1it-1301318001/' + absoluteUrls[i].Key
    //     // console.log(corpImgUrl)
    //     corpImgUrls.push(corpImgUrl)
    //   }
    // }
    // console.log(corpImgUrls)
    // that.setData({
    //   facePics: corpImgUrls
    // })
    // return corpImgUrls
  },

  onLoad: function (options) {
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})