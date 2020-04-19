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
  const { fileID, params } = event
  const imgUrl = await getImageUrl(fileID)

  let base64Mains = []
  let fileContents = []

  for (let i = 0; i < params.length; i++) {
    const res = await fetch.get(imgUrl + '?imageMogr2/scrop/' + params[i])
    console.log(res)
    const fileContent = Buffer.from(res.data, 'binary')
    const base64Main = fileContent.toString('base64')
    base64Mains.push(base64Main)
    fileContents.push(fileContent)
  }

  return { base64Mains, fileContents }
}
