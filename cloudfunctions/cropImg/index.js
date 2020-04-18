// 云函数入口文件
const extCi = require("@cloudbase/extension-ci");
const tcb = require("tcb-admin-node");
const cloud = require('wx-server-sdk');

//let fileContent = imageBuffer; // Uint8Array|Buffer格式图像内容

tcb.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
tcb.registerExtension(extCi);

// 云函数入口函数
exports.main = async (event, context) => {
  const { fileID, faceInfos } = event
  const imgID = await getUrl(fileID)
  // const imgID = await suofangImg(imgID1)
  // if (model == 1) {
  //   const temFileId = "cloud://development-9p1it.6465-development-9p1it-1301318001/" + imgID
  //   const { fileList } = await tcb.getTempFileURL({
  //     fileList: [temFileId]
  //   })
  //   console.log(fileList[0].tempFileURL)
  //   return fileList[0].tempFileURL
  // }
  // if (model == 0) {
  return cropImg(imgID, faceInfos)
  // }
}

//拿到绝对路径
function getUrl(fileID) {
  imgID = fileID.replace('cloud://', '')
  let index = imgID.indexOf('/')
  imgID = imgID.substr(index)
  return imgID
}

async function suofangImg(imgID) {//返回绝对路径
  let newTime = new Date().getTime()
  try {
    const opts = {
      rules: [{
        'fileid': '/corpTest/' + newTime + '.png',
        'rule': "imageMogr2/crop/600x600/center"
      }]
    };
    const res = await tcb.invokeExtension("CloudInfinite", {
      action: "ImageProcess",
      cloudPath: imgID, // 存储图像的绝对路径，与tcb.uploadFile中一致
      //fileContent, // 该字段可选，文件内容：Uint8Array|Buffer。有值，表示上传时处理图像；为空，则处理已经上传的图像
      operations: opts
    });
    // console.log(res)
    console.log(JSON.stringify(res.data, null, 4));
    return res.data.UploadResult.ProcessResults.Object.Key
  } catch (err) {
    console.log(err)
    return err
    //console.log(JSON.stringify(err, null, 4));
  }
}

async function cropImg(imgID, faceInfos) {
  let rules = []

  for (let i = 0; i < faceInfos.length; i++) {
    let newTime = new Date().getTime()
    let { Width, Height, X, Y } = faceInfos[i]
    let temRule = "imageMogr2/cut/" + Width + "x" + Height + "x" + X + "x" + Y
    let rule = { 'fileid': '/corpTest/' + i + newTime + '.png', 'rule': temRule }
    rules.push(rule)
  }

  try {
    const opts = {
      rules: rules
    };
    console.log('==========================')
    console.log(opts)
    const res = await tcb.invokeExtension("CloudInfinite", {
      action: "ImageProcess",
      cloudPath: imgID, // 存储图像的绝对路径，与tcb.uploadFile中一致
      //fileContent, // 该字段可选，文件内容：Uint8Array|Buffer。有值，表示上传时处理图像；为空，则处理已经上传的图像
      operations: opts
    });
    // console.log(res)
    console.log(JSON.stringify(res.data, null, 4));
    return res.data
  } catch (err) {
    console.log(err)
    return err
    //console.log(JSON.stringify(err, null, 4));
  }
}