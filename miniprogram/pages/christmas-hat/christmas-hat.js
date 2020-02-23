// pages/christmas-hat/christmas-hat.js
const utilsCommon = require('../../utils/common')
const promisify = require('../../utils/promisify')
import { fsmReadFile, getImgUrl } from '../../utils/canvas-drawing';
import { cloudCallFunction } from '../../utils/fetch'
import { getMouthInfo, getMaskShapeList } from '../../utils/face-utils';

const regeneratorRuntime = require('../../utils/regenerator-runtime/runtime.js')

const { windowWidth, pixelRatio } = utilsCommon.getSystemInfo()
const CANVAS_SIZE = 300
const PageDpr = windowWidth / 375

const DPR_CANVAS_SIZE = CANVAS_SIZE * PageDpr
const SAVE_IMAGE_WIDTH = DPR_CANVAS_SIZE * pixelRatio
const DEFAULT_MASK_SIZE = 100 * PageDpr
const MASK_SIZE = 100

const resetState = () => {
  return {
    maskWidth: DEFAULT_MASK_SIZE,
    currentMaskId: 1,
    timeNow: Date.now(),

    maskCenterX: DPR_CANVAS_SIZE / 2,
    maskCenterY: DPR_CANVAS_SIZE / 2,
    resizeCenterX: DPR_CANVAS_SIZE / 2 + DEFAULT_MASK_SIZE / 2 - 2,
    resizeCenterY: DPR_CANVAS_SIZE / 2 + DEFAULT_MASK_SIZE / 2 - 2,
    rotate: 0,
    reserve: 1
  }
}

const setTmpThis = (el, elState) => {
  const {
    maskWidth,
    maskCenterX,
    maskCenterY,
    resizeCenterX,
    resizeCenterY,
    rotate
  } = elState

  el.mask_width = maskWidth
  el.mask_center_x = maskCenterX;
  el.mask_center_y = maskCenterY;
  el.resize_center_x = resizeCenterX;
  el.resize_center_y = resizeCenterY;

  el.rotate = rotate;

  el.touch_target = '';
  el.touch_shape_index = -1;

}

const materialList = [
  {
    name: 'mask',
    icon: '../../images/icon-category-mask.png',
    imgList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    type: 'multi'
  },
  {
    name: 'jiayou',
    icon: '../../images/icon-category-jiayou.png',
    imgList: [1, 2, 3, 4, 5, 6],
    type: 'single'
  }
]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    DPR_CANVAS_SIZE: 300,
    DPR_CANVAS_SIZE: DPR_CANVAS_SIZE,
    pixelRatio: utilsCommon.getSystemInfo().pixelRatio,
    shapeList: [
      resetState()
    ],
    materialList: [],
    currentShapeIndex: 0,
    originSrc: '',
    cutImageSrc: '',
    posterSrc: '',
    isShowPoster: false,
    currentJiayouId: 1,
    currentTabIndex: 0,
    isShowMask: false,
    materialList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.cropper = this.selectComponent("#image-cropper");

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

  },
  onChooseImage(event){

    // console.log('event :', event);
    // TODO 兼容写法

    let way = event.target.dataset.way || 'album'
    const chooseImage = promisify(wx.chooseImage)
    console.log('way :', way);
    chooseImage({
      count: 1,
      sourceType: [way]
    })
      .then(res => {
        this.setData({
          originSrc: res.tempFilePaths[0]
        });
      })
      .catch(error => {
        console.log('error :', error);
      })
  },
  cropperLoad() {

  },
  cropperIoadImage(event) {
    // let imageInfo = event.detail
    this.cropper.imgReset()

  },
  onCropperCut(event) {
    let imageInfo = event.detail
    let cutImageSrc = imageInfo.url
    this.setData({
      cutImageSrc: cutImageSrc,
      originSrc: ''
    })

    this.onAnalyzeFace(cutImageSrc)
  },
  onCutSubmit(){
    let that = this
    this.cropper.getImg((detail) => {
      that.onCropperCut({
        detail: detail
      })
    });
  },
  onCutCancel() {
    this.setData({
      originSrc: ''
    })
  },
  async onGetUserInfo(e) {

    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      // TODO写法，用于更换图片
      wx.showToast({
        icon: 'none',
        title: '获取头像...'
      })
      try {
        let avatarUrl = await getImgUrl(e.detail.userInfo.avatarUrl)
        if (avatarUrl) {
          this.onCropperCut({
            detail: {
              url: avatarUrl
            }
          })
        }

      } catch (error) {
        console.log('avatarUrl download error:', error);
        wx.showToast({
          icon: 'none',
          title: '获取失败，请使用相册'
        })
      }
    } else {
      //用户按了拒绝按钮
    }
  },
  async onAnalyzeFace  (cutImageSrc) {
    if (!cutImageSrc) return

    console.log('cutImageSrc :', cutImageSrc);

    wx.showLoading({
      title: '识别中...'
    })

    this.setData({
      isShowMask: false,
    })

    try {
      const compressImage = promisify(wx.compressImage)
      const resImage = await compressImage({
        src: cutImageSrc, // 图片路径
        quality: 10 // 压缩质量
      })

      let oldTime = Date.now()

      let { data: base64Main } = await fsmReadFile({
        filePath: resImage.tempFilePath,
        encoding: 'base64',
      })

      const couldRes = await cloudCallFunction({
        name: 'analyze-face',
        data: {
          base64Main
        }
      })

      
      console.log(((Date.now() - oldTime) / 1000).toFixed(1) + '秒')
      const mouthList = getMouthInfo(couldRes)

      const shapeList = getMaskShapeList(mouthList, DPR_CANVAS_SIZE, MASK_SIZE)

      setTmpThis(this, shapeList[0])

      this.setData({
        currentShapeIndex: 0,
        shapeList,
        isShowMask: true,
      })

      wx.hideLoading()

    } catch (error) {
      console.log('onAnalyzeFace error :', error);

      wx.hideLoading()
      const { status } = error

      if (status === 87014 || status === 87015) {
        wx.showToast({
          icon: 'none',
          title: status === 87014 ? '图中包含违规内容，请更换' : '重新上传试试看'
        })
        this.setData({
          cutImageSrc: ''
        })
        return
      }


      // 获取失败，走默认渲染
      let shapeList = [
        resetState()
      ]

      this.setData({
        shapeList,
        isShowMask: true,
      })
      setTmpThis(this, shapeList[0])
    }
  },
  chooseTab(event) {
    let index = event.target.dataset.index || 0
    console.log('object :', event.target.dataset.index);
    this.setData({
      currentTabIndex: index
    })
  },
  onRemoveImage() {
    this.cutImageSrcCanvas = ''
    this.setData({
      shapeList: [
        resetState()
      ],
      cutImageSrc: ''
    })
  },
  async downloadImage() {
    wx.showLoading({
      title: '图片生成中'
    })

    this.setData({
      posterSrc: '',
    })

    try {
      // await this.drawCanvas()
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '图片生成失败，请重试'
      })
      console.log('error :', error)
    }
  },
  onClickMaskBottom(event) {
    let maskId = event.target.dataset.maskId || 1
    let tabName = event.target.dataset.tabName || ''
    console.log('maskId,  :', maskId, tabName);
    if (tabName === 'mask') this.chooseMask(maskId)
    if (tabName === 'jiayou') this.chooseJiayouId(maskId)
  },
  chooseMask(maskId) {
    let { shapeList, currentShapeIndex } = this.data

    if (shapeList.length > 0 && currentShapeIndex >= 0) {
      shapeList[currentShapeIndex] = {
        ...shapeList[currentShapeIndex],
        currentMaskId: maskId
      }
    } else {
      currentShapeIndex = shapeList.length
      shapeList.push({
        ...resetState(),
        currentMaskId: maskId
      })
    }
    this.setData({
      shapeList,
      currentShapeIndex
    })
  },
  chooseJiayouId(jiayouId = 0) {
    this.setData({
      currentJiayouId: jiayouId
    })
  }

})