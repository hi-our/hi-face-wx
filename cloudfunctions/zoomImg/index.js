// 云函数入口文件
const extCi = require('@cloudbase/extension-ci');
const tcb = require('tcb-admin-node');
const cloud = require('wx-server-sdk')

let env = process.env.TCB_ENV === 'local' ? 'development-9p1it' : process.env.TCB_ENV

tcb.init({
  env
})

tcb.registerExtension(extCi)

// 云函数入口函数
exports.main = async (event) => {
  const {fileID} = event
  // imgId需要定义呀
  let imgID = fileID.replace('cloud://', '')
  let index = imgID.indexOf('/')

  return process(imgID.substr(index))
}

async function process(imgID) {
  // Todo rules 的宽高需要从 event 里面传入
  try {
    // TODO 重复的代码，可以用变量进行定义
    const opts = {
      rules: [
        {
          fileid: '/corpTest/1.jpg',
          rule: 'imageMogr2/thumbnail/150x150'
        },
        {
          fileid: '/corpTest/2.jpg',
          rule: 'imageMogr2/thumbnail/220x200'
        },
        {
          fileid: '/corpTest/3.jpg',
          rule: 'imageMogr2/thumbnail/200x150'
        },
      ]
    }

    const res = await tcb.invokeExtension('CloudInfinite', {
      action: 'ImageProcess',
      cloudPath: imgID,
      operations: opts
    })


    console.log(JSON.stringify(res.data, null, 4))


    return res.data
  } catch (err) {

    return err
  }
}