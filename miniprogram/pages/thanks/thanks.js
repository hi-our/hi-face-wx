import { cloudCallFunction } from '../../utils/fetch'
import '../../utils/regenerator-runtime/runtime'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageStatus: 'loading',
    version: '0.1.0',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    cloudCallFunction({
      name: 'thanks-data'
    }).then(res => {
      this.setData({
        pageData: res,
        pageStatus: 'done'
      })
    }).catch((error) => {
      this.setData({
        pageStatus: 'error'
      })
      console.log('error :', error);
    })

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
  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    return {
      title: '致谢',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/thanks/thanks'
    }
  },
  copyToClipboard(str) {
    const { pageData } = this.data

    wx.setClipboardData({
      data: pageData.sourceLink,
      success() {
        wx.showToast({
          icon: 'none',
          title: '复制成功'
        })
      },
      fail() {
        console.log('setClipboardData调用失败')
      }
    })

  }
})
