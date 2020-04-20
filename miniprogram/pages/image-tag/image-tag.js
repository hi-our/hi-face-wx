import { imgSecCheck, uploadFileToCloud } from '../../utils/common-func.js'

Page({
  data: {
    bigPic: '/images/bigPic.png',
    imgTags: [],
  },
  //分享
  onShareAppMessage: function () {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    return {
      title: '图像标签',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/image-tag/image-tag'
    }
  },
  async mainFunc() {
    try {
      const imgPath = await this.chooseImg()

      wx.showLoading({
        title: '图片处理中...',
      })

      const { safeCheckResults, fileID } = await this.uploadToCloudAndCheck(imgPath)

      wx.hideLoading()

      // 这里先处理正常的，再处理异常
      if (safeCheckResults.status === 0) {
        await this.detectImageLabel(fileID)
        return
      }

      //图片违禁
      if (safeCheckResults.status === -1000) {
        wx.showModal({
          title: '提示',
          content: '图片含违禁内容，请更换图片',
          showCancel: false,
        })
        return
      }

      //图片安全校验出错
      wx.showModal({
        title: '提示',
        content: '图片校验出错，请重试',
        showCancel: false,
      })
    } catch (error) {
      console.log(error)
    }
  },

  //选择图片
  async chooseImg() {

    const { tempFilePaths } = await wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    })

    let bigPic = tempFilePaths[0]
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
  async detectImageLabel(fileID) {

    const res = await wx.cloud.callFunction({
      name: 'detect-image-label',
      data: {
        fileID: fileID,
      }
    })

    if (res.result.status === 0) {
      const { list } = res.result.data
      this.setData({
        imgTags: list,
      })
      return
    }

    wx.showToast({
      title: '图片校验出错，请重试', // ???
      icon: 'none',
      duration: 2000
    })
  },
})
