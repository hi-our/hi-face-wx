// miniprogram/pages/face-love/face-love.js
import { uploadFileToCloud, imgSecCheck, faceImgCheck, cropImg } from "../myFunc.js"
const app = getApp()

Page({
  data: {
    bigPic: '/images/bigPic.png',
    litPic: '/images/litPic.png',
    facePics: ['/images/1.png', '/images/2.png', '/images/3.png', '/images/2.png', '/images/3.png', '/images/2.png', '/images/3.png', '/images/1.png'],
  },

  //选择图片
  async chooseImg() {
    var that = this
    const temImg = await wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    })
    wx.showLoading({
      title: '图片安全校验中...',
    })
    that.setData({
      bigPic: temImg.tempFilePaths[0],
      litPic: temImg.tempFilePaths[0],
    })

    //上传到云存储
    const fileID = await uploadFileToCloud(temImg.tempFilePaths[0])
    console.log(fileID)
    const checkResults = await imgSecCheck(fileID)
    const results = checkResults.result
    console.log(results)
    wx.hideLoading({})
    if (results.status === -1000) {
      //图片违禁
      wx.showModal({
        title: '提示',
        content: '图片含违禁内容，请更换图片',
        showCancel: false,
      })
    } else if (results.status == 0) {
      let corpImgUrls = []
      //图片正常，调用人脸识别
      const faceInfos = await faceImgCheck(fileID)
      console.log(faceInfos)
      //拿到识别到的面部宽高和在图片的位置dx、dy后，调用裁剪函数
      //const a = await cropImg(fileID, Width, Height, X, Y)
      const a = await cropImg(fileID, faceInfos)
      console.log(a)
      const absoluteUrls = a.result.UploadResult.ProcessResults.Object
      console.log(absoluteUrls)
      //拿到裁剪后的图片地址
      for (let i = 0; i < absoluteUrls.length; i++) {
        let corpImgUrl = 'cloud://development-9p1it.6465-development-9p1it-1301318001/' + absoluteUrls[i].Key
        corpImgUrls.push(corpImgUrl)
      }
      console.log(corpImgUrls)
      that.setData({
        facePics: corpImgUrls
      })
      return corpImgUrls
    } else {
      //图片安全校验出错
      wx.showModal({
        title: '提示',
        content: '图片校验出错，请重试',
        showCancel: false,
      })
    }
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