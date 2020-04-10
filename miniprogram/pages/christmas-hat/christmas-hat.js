// pages/christmas-hat/christmas-hat.js
import '../../utils/regenerator-runtime/runtime'
import { fsmReadFile, getImgUrl } from '../../utils/canvas-drawing'
import { cloudCallFunction } from '../../utils/fetch'
import { getMouthInfo, getMaskShapeList } from '../../utils/face-utils'
import { getSystemInfo } from '../../utils/common'
import promisify from '../../utils/promisify'

const { windowWidth, pixelRatio } = getSystemInfo()
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
    DPR_CANVAS_SIZE,
    pixelRatio: getSystemInfo().pixelRatio,
    shapeList: [
      resetState()
    ],
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
    this.cropper = this.selectComponent('#image-cropper');

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
  onShareAppMessage({ from, target }) {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    let shareImage = DEFAULT_SHARE_COVER
    if (from === 'button') {
      const { dataset = {} } = target
      const { posterSrc = '' } = dataset

      console.log('posterSrc :', posterSrc)

      if (posterSrc) {
        shareImage = posterSrc
      }
    }

    return {
      title: '让我们快快戴口罩，抗击疫情吧！',
      imageUrl: shareImage,
      path: '/pages/christmas-hat/christmas-hat'
    }
  },

  onChooseImage(event) {

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
  cropperLoad() {},
  cropperLoadImage(event) {
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

  onCutSubmit() {
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
      await this.drawCanvas()
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '图片生成失败，请重试'
      })
      console.log('error :', error)
    }
  },
  async drawCanvas() {
    const {
      shapeList,
      currentJiayouId,
      cutImageSrc
    } = this.data

    const pc = wx.createCanvasContext('canvasMask')
    const tmpUsePageDpr = PageDpr * pixelRatio

    pc.clearRect(0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH);
    let tmpCutImage = this.cutImageSrcCanvas || await getImgUrl(cutImageSrc)
    pc.drawImage(tmpCutImage, 0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH)

    // 形状
    shapeList.forEach(shape => {
      pc.save()
      const {
        maskWidth,
        rotate,
        maskCenterX,
        maskCenterY,
        currentMaskId,
        reserve,
      } = shape
      const maskSize = maskWidth * pixelRatio

      pc.translate(maskCenterX * pixelRatio, maskCenterY * pixelRatio);
      pc.rotate((rotate * Math.PI) / 180)

      pc.drawImage(
        `../../images/mask-${currentMaskId}${reserve < 0 ? '-reverse' : ''}.png`,
        -maskSize / 2,
        -maskSize / 2,
        maskSize,
        maskSize
      )
      pc.restore()
    })

    if (currentJiayouId > 0) {
      pc.save()

      pc.drawImage(
        `../../images/jiayou-${currentJiayouId}.png`,
        0,
        132 * tmpUsePageDpr,
        300 * tmpUsePageDpr,
        169 * tmpUsePageDpr,
      )
    }

    pc.draw(true, () => {
      wx.canvasToTempFilePath({
        canvasId: 'canvasMask',
        x: 0,
        y: 0,
        height: DPR_CANVAS_SIZE * 3,
        width: DPR_CANVAS_SIZE * 3,
        fileType: 'jpg',
        quality: 0.9,
        success: res => {
          wx.hideLoading()
          this.setData({
            posterSrc: res.tempFilePath,
            isShowPoster: true
          })
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({
            title: '图片生成失败，请重试'
          })
        }
      })
    })

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
  },


  // 图形移动区域

  removeShape(e) {
    const { shapeIndex = 0 } = e.target.dataset
    const { shapeList } = this.data
    shapeList.splice(shapeIndex, 1);
    this.setData({
      shapeList,
      currentShapeIndex: -1
    })
  },

  reverseShape(e) {
    const { shapeIndex = 0 } = e.target.dataset
    const { shapeList } = this.data
    shapeList[shapeIndex] = {
      ...shapeList[shapeIndex],
      reserve: 0 - shapeList[shapeIndex].reserve
    }

    this.setData({
      shapeList
    })
  },


  checkedShape(e) {
    this.setData({
      currentShapeIndex: -1
    })
  },

  touchStart(e) {
    const { type = '', shapeIndex = 0 } = e.target.dataset

    this.touch_target = type;
    this.touch_shape_index = shapeIndex;
    if (this.touch_target == 'mask' && shapeIndex !== this.data.currentShapeIndex) {
      this.setData({
        currentShapeIndex: shapeIndex
      })
    }

    if (this.touch_target != '') {
      this.start_x = e.touches[0].clientX;
      this.start_y = e.touches[0].clientY;
    }
  },
  touchEnd(e) {
    if (this.touch_target !== '' || this.touch_target !== 'cancel') {
      if (this.data.shapeList[this.touch_shape_index]) {
        setTmpThis(this, this.data.shapeList[this.touch_shape_index])
      }
    }
  },
  touchMove(e) {
    let { shapeList } = this.data
    const {
      maskCenterX,
      maskCenterY,
      resizeCenterX,
      resizeCenterY,
    } = shapeList[this.touch_shape_index]

    var current_x = e.touches[0].clientX;
    var current_y = e.touches[0].clientY;
    var moved_x = current_x - this.start_x;
    var moved_y = current_y - this.start_y;
    if (this.touch_target == 'mask') {
      shapeList[this.touch_shape_index] = {
        ...shapeList[this.touch_shape_index],
        maskCenterX: maskCenterX + moved_x,
        maskCenterY: maskCenterY + moved_y,
        resizeCenterX: resizeCenterX + moved_x,
        resizeCenterY: resizeCenterY + moved_y
      }
      this.setData({
        shapeList
      })
    }
    if (this.touch_target == 'rotate-resize') {
      let oneState = {
        resizeCenterX: resizeCenterX + moved_x,
        resizeCenterY: resizeCenterY + moved_y,
      }

      let diff_x_before = this.resize_center_x - this.mask_center_x;
      let diff_y_before = this.resize_center_y - this.mask_center_y;
      let diff_x_after = resizeCenterX - this.mask_center_x;
      let diff_y_after = resizeCenterY - this.mask_center_y;
      let distance_before = Math.sqrt(
        diff_x_before * diff_x_before + diff_y_before * diff_y_before
      );

      let distance_after = Math.sqrt(
        diff_x_after * diff_x_after + diff_y_after * diff_y_after
      );

      let angle_before = (Math.atan2(diff_y_before, diff_x_before) / Math.PI) * 180;
      let angle_after = (Math.atan2(diff_y_after, diff_x_after) / Math.PI) * 180;

      let twoState = {
        maskWidth: (distance_after / distance_before) * this.mask_width,
        rotate: angle_after - angle_before + this.rotate
      }

      shapeList[this.touch_shape_index] = {
        ...shapeList[this.touch_shape_index],
        ...oneState,
        ...twoState
      }

      this.setData({
        shapeList
      })

    }
    this.start_x = current_x;
    this.start_y = current_y;
  },


  // 海报效果
  previewPoster() {
    const { posterSrc } = this.data
    if (posterSrc !== '') wx.previewImage({ urls: [posterSrc] })
  },

  onHidePoster() {
    this.setData({
      isShowPoster: false
    })
  },

  savePoster() {
    const { posterSrc } = this.data

    if (posterSrc) {
      this.saveImageToPhotosAlbum(posterSrc)
    }
  },

  saveImageToPhotosAlbum(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: res2 => {
        wx.showToast({
          title: '图片保存成功'
        })
        console.log('保存成功 :', res2);
      },
      fail(e) {
        wx.showToast({
          title: '图片未保存成功'
        })
        console.log('图片未保存成功:' + e);
      }
    });
  }

})
