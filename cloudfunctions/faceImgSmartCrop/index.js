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
  const { fileID } = event
  console.log(fileID)
  imgID = fileID.replace('cloud://', '')
  let index = imgID.indexOf('/')
  imgID = imgID.substr(index)
  return process(imgID)
}

async function process(imgID) {
  const newTime = new Date().getTime()
  console.log(imgID)
  try {
    const opts = {
      rules: [
        {
          // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
          fileid: '/corpTest/' + newTime + '.png',
          rule: 'imageMogr2/scrop/!200x200r' // 处理样式参数，与下载时处理图像在url拼接的参数一致
        }
      ]
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