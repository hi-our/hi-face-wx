// 云函数入口文件
const tcb = require('tcb-admin-node');
const fetch = require('axios')

let env = tcb.getCurrentEnv() === 'local' ? 'production-nagw3' : tcb.getCurrentEnv()

tcb.init({
  env
})

const getImageUrl = async (fileID) => {

  if (!fileID) {
    return { 'errCode': 1, 'errMsg': '请传入fileID' }
  }

  try {
    const { fileList } = await tcb.getTempFileURL({
      fileList: [fileID]
    })
    return fileList[0].tempFileURL
  } catch (err) {
    return { 'errCode': 1, 'errMsg': '获取链接失败' }
  }
}


// 云函数入口函数
exports.main = async (event, context) => {
  const { fileID = '', rules = '' } = event

  if (!fileID || !rules) {
    return { 'errCode': 1, 'errMsg': '请传入相关参数' }
  }

  try {
    const imgUrl = await getImageUrl(fileID)
    const prefix = imgUrl.includes('?') ? '|' : '?'

    return rules.map((item) => {
      return imgUrl + prefix + 'imageMogr2/scrop/' + item
    })
  } catch(err){
    return { 'errCode': 1, 'errMsg': '出现错误' }
  }
}
