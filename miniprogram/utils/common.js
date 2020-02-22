let _systemInfo = null
let _isXPhoneArea = null
const getSystemInfo = () => {
  if (_systemInfo === null) {
    _systemInfo = wx.getSystemInfoSync()
  }
  return _systemInfo
}


module.exports = {
  getSystemInfo
}