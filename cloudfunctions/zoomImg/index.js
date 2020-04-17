// 云函数入口文件
const extCi = require("@cloudbase/extension-ci");
const tcb = require("tcb-admin-node");
// const cloud = require('wx-server-sdk')

tcb.init({
  env: 'development-9p1it'
});
tcb.registerExtension(extCi);

// cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {fileID} = event
  imgID = fileID.replace('cloud://', '')
  let index = imgID.indexOf('/')
  imgID = imgID.substr(index)
  return process(imgID)
}

async function process(imgID) {
  try {
    const opts = {
      rules: [
        {
          fileid: '/corpTest/1.jpg',
          rule: "imageMogr2/thumbnail/150x150"
        },
        {
          fileid: '/corpTest/2.jpg',
          rule: "imageMogr2/thumbnail/220x200"
        },
        {
          fileid: '/corpTest/3.jpg',
          rule: "imageMogr2/thumbnail/200x150"
        },
      ]
    };
    const res = await tcb.invokeExtension("CloudInfinite", {
      action: "ImageProcess",
      cloudPath: imgID,      
      operations: opts
    });
    console.log(JSON.stringify(res.data, null, 4));
    return res.data
  } catch (err) {
    console.log(JSON.stringify(err, null, 4));
    return err
  }
}