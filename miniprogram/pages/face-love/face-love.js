// miniprogram/pages/face-love/face-love.js
Page({
  data: {
    bigPic: '/images/bigPic.png',
    litPic: '/images/litPic.png',
    facePics: ['/images/1.png','/images/2.png','/images/3.png']
  },

  //选择图片
  async chooseImg() {
    var that = this
    let deleteIndex = []
    const temImg = await wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    })
    wx.showLoading({
      title: '图片安全校验中...',
    })
    console.log(temImg)
    that.setData({
      img_url: temImg.tempFilePaths
    })
    //let img_url = temImg.tempFilePaths
    let img_url = []
    let temFileIDs = []
    const fileIDs = await uploadFileToCloud(temImg.tempFilePaths, app.globalData._openid)
    console.log(fileIDs)
    console.log(img_url)
    const checkResults = await imgCheck(fileIDs)
    const results = checkResults.result
    console.log(results)

    for (let i=0;i<results.length;i++){
      if(results[i] ==1){
        deleteIndex.push(i+1)
      } else if(results[i]==0){
        temFileIDs.push(fileIDs[i])
        img_url.push(fileIDs[i])
      }
    }
    that.data.img_fildIDs = temFileIDs
    wx.hideLoading({})
    if (deleteIndex.length != 0) {
      wx.showModal({
        title: '提示',
        content: '第' + deleteIndex.sort().join("、") + '张图片含违禁内容，将被删除',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            that.setData({
              img_url: img_url
            })
          }
        }
      })
    }
  },

  // 图片预览
  previewImage: function (e) {
    var that = this;
    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: that.data.img_url // 需要预览的图片http链接列表
    })
  },

  // 长按删除图片(暂未实现同时删掉云存储中的图片)
  async deleteImg(e) {
    wx.showLoading({
      title: '删除中',
    })
    var that = this;
    var images = that.data.img_url;
    var index = e.currentTarget.dataset.index;
    images.splice(index, 1);
    let deleteImgId = that.data.img_fildIDs.splice(index, 1);
    wx.cloud.deleteFile({
      fileList: deleteImgId,
      success: res => {
        wx.hideLoading({})
        console.log("删除了：", res)
      },
      fail: console.error
    })
    that.setData({
      img_url: images
    })
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