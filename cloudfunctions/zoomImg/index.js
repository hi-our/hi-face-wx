// 云函数入口文件
const tcb = require('tcb-admin-node');
const fetch = require('axios')

let env = tcb.getCurrentEnv() === 'local' ? 'development-9p1it' : tcb.getCurrentEnv()

tcb.init({
  env
})

const getImageUrl = async (fileID) => {
  const { fileList } = await tcb.getTempFileURL({
    fileList: [fileID]
  })
  console.log(fileList)
  return fileList[0].tempFileURL
}


// 云函数入口函数
exports.main = async (event, context) => {
  const { fileID = '', rules = '' } = event
  const imgUrl = await getImageUrl(fileID)
  const prefix = imgUrl.includes('?') ? '|' : '?'

  return rules.map((item) => {
    return imgUrl + prefix + 'imageMogr2/scrop/' + item
  })

}
