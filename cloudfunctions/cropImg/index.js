// 云函数入口文件
const extCi = require("@cloudbase/extension-ci");
const tcb = require("tcb-admin-node");
const cloud = require('wx-server-sdk');

//let fileContent = imageBuffer; // Uint8Array|Buffer格式图像内容

tcb.init({
  env: 'development-9p1it'
});

cloud.init({
  env: 'development-9p1it'
})
tcb.registerExtension(extCi);

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { fileID, faceInfos } = event
  console.log(fileID)
  imgID = fileID.replace('cloud://', '')
  let index = imgID.indexOf('/')
  imgID = imgID.substr(index)
  return cropImg(imgID, faceInfos)
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