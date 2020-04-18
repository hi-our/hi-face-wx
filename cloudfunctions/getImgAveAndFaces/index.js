const tcb = require('tcb-admin-node')
const fetch = require('axios')

let env = process.env.TCB_ENV === 'local' ? 'development-9p1it' : process.env.TCB_ENV

tcb.init({
  env
})

exports.main = async (event, context) => {
  const { fileID, faceInfos } = event
  const imgUrl = await getImageUrl(fileID)

  //part1：拿到主色调
  const res1 = await fetch.get(imgUrl + '?imageAve')
  const RGB = res1.data.RGB

  //part2：拿到裁剪后的图片
  let base64Mains = []
  let fileContents = []
  for (let i = 0; i < faceInfos.length; i++) {
    const { X, Y, Width, Height } = faceInfos[i]
    const res = await fetch.get(imgUrl + "?imageMogr2/cut/" + Width + "x" + Height + "x" + X + "x" + Y, { responseType: 'arraybuffer' })
    console.log(res)
    const fileContent = new Buffer(res.data, 'binary')
    const base64Main = fileContent.toString('base64')
    base64Mains.push(base64Main)
    fileContents.push(fileContent)
  }

  return { RGB, base64Mains, fileContents }
}

const getImageUrl = async (fileID) => {
  const { fileList } = await tcb.getTempFileURL({
    fileList: [fileID]
  })
  console.log(fileList)
  return fileList[0].tempFileURL
}























// // 云函数入口文件
// const extCi = require("@cloudbase/extension-ci");
// const tcb = require("tcb-admin-node");
// const cloud = require('wx-server-sdk');

// //let fileContent = imageBuffer; // Uint8Array|Buffer格式图像内容

// tcb.init({
//   env: 'development-9p1it'
// });

// cloud.init({
//   env: 'development-9p1it'
// })
// tcb.registerExtension(extCi);

// // 云函数入口函数
// exports.main = async (event, context) => {
//   const { fileID } = event
//   console.log(fileID)
//   imgID = fileID.replace('cloud://', '')
//   let index = imgID.indexOf('/')
//   imgID = imgID.substr(index)
//   return getMainColor(imgID)
// }

// async function getMainColor(imgID) {
//   let newTime = new Date().getTime()
//   try {
//     const opts = {
//       rules: [{
//         'fileid': '/corpTest/' + newTime + '.png',
//         'rule': "imageAve"
//       }]
//     };
//     console.log('==========================')
//     const res = await tcb.invokeExtension("CloudInfinite", {
//       action: "ImageProcess",
//       cloudPath: imgID, // 存储图像的绝对路径，与tcb.uploadFile中一致
//       //fileContent, // 该字段可选，文件内容：Uint8Array|Buffer。有值，表示上传时处理图像；为空，则处理已经上传的图像
//       operations: opts
//     });
//     // console.log(res)
//     console.log(JSON.stringify(res.data, null, 4));
//     return res.data
//   } catch (err) {
//     console.log(err)
//     return err
//     //console.log(JSON.stringify(err, null, 4));
//   }
// }