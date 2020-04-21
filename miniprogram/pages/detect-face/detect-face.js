// miniprogram/pages/face-love/face-love.js
import { imgSecCheck, faceDetect, uploadFileToCloud, GENDER_STATUS, EXPRESS_MOOD, HAVE_STATUS } from '../../utils/common-func.js'

Page({
  data: {
    shapeIndex: false,
    shapes: [],
    bigPic: '',
    litPic: '',
    facePics: [],
    background: 'rgb(142, 147, 154)',
    textTips: '上传带人脸的正面照',
    litPicBorder: 'border: 1px solid #ED4BA6',
    scanPicBorder: 'border: 1px solid #4EC9B0',
    key: -1,
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this.setData({
      navigationBarPaddingTop: statusBarHeight
    })
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

    try {
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

    } catch (err) {
      console.log(err)
      wx.showToast({
        title: '页面出错',
        icon: 'none',
        duration: 2000
      })
    }
  },

  //显示人脸魅力文字
  showMeili(e) {
    const key = this.data.key
    const { index } = e.currentTarget.dataset

    if (key == index) {
      this.setData({
        key: -1
      })
      return
    }

    if (key >= -1) {
      this.setData({
        litPicBorder: 'border: 1px solid #4EC9B0',
        key: index,
      })
      return
    }
  },

  showPic(){
    this.setData({
      key: -1,
      litPicBorder:'border: 1px solid #ED4BA6'
    })
  },

  //选择图片
  async chooseImg() {
    this.setData({
      shapes: [],
      facePics: []
    })
    const temImg = await wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    })
    let bigPic = temImg.tempFilePaths[0]

    this.setData({
      bigPic,
      litPic: bigPic,
      textTips: '点击人脸框，可以显示人脸魅力值',
      picBoxBorder: 'border: none'
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
      const { X, Y, Width, Height, FaceAttributesInfo = {} } = face

      // TODO 这里请重新解构,然后注意前端变量是要小驼峰式（首字母小写），而不是大驼峰式
      const { Expression, Glass, Hat, Mask, Age, Beauty } = FaceAttributesInfo
      const expression = EXPRESS_MOOD[parseInt(Expression / 10, 10)]
      const glass = HAVE_STATUS[Number(Glass)]
      const hat = HAVE_STATUS[Number(Hat)]
      const mask = HAVE_STATUS[Number(Mask)]

      return {
        x: X / turnRatio,
        y: Y / turnRatio,
        width: Width / turnRatio,
        height: Height / turnRatio,
        expression: expression,
        glass: glass,
        hat: hat,
        mask: mask,
        age: Age,
        beauty: Beauty
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
    console.log(faceInfos)
    const results = await wx.cloud.callFunction({
      name: 'getImgAveAndFaces',
      data: {
        fileID: fileID,
        faceInfos: faceInfos
      }
    })

    const { RGB = '', base64Mains = [] } = results.result
    const background = RGB.replace('0x', '#')

    //将base64Main展示在视图层
    let facePics = base64Mains.map(item => `data:image/png;base64,${item}`)

    this.setData({
      background,
      facePics
    })
  },
})
