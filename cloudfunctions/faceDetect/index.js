// 云函数入口文件
const cloud = require('wx-server-sdk')
const tencentcloud = require("tencentcloud-sdk-nodejs");
const config = require('./config.js')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

let secretId = config.SecretId || ''
let secretKey = config.SecretKey || ''

const IaiClient = tencentcloud.iai.v20180301.Client;
const models = tencentcloud.iai.v20180301.Models;

const Credential = tencentcloud.common.Credential;
const ClientProfile = tencentcloud.common.ClientProfile;
const HttpProfile = tencentcloud.common.HttpProfile;

let cred = new Credential(secretId, secretKey);
let httpProfile = new HttpProfile();
httpProfile.endpoint = "iai.tencentcloudapi.com";
let clientProfile = new ClientProfile();
clientProfile.httpProfile = httpProfile;
let client = new IaiClient(cred, "ap-beijing", clientProfile);

let req = new models.DetectFaceRequest();

async function faceImgCheck(params1) {

  if (!params1) {
    return { 'errCode': 1, 'errMsg': '请传入相关参数' }
  }

  let params = JSON.stringify(params1) //应该是个对象
  req.from_json_string(params);
  return new Promise(function (resolve, reject) {
    client.DetectFace(req, function (errMsg, response) {
      console.log('errMsg :>> ', errMsg);
      if (errMsg) {
        console.log(errMsg);
        reject({
          'errCode': 1, 
          'errMsg': '面部识别出现错误:' + errMsg
        })
      }
      console.log('response', response)
      resolve(response)
    })
  })
};


// 云函数入口函数
exports.main = async (event, context) => {

  const { fileID = '' } = event

  if (!fileID) {
    return { 'errCode': 1, 'errMsg': '请传入fileID' }
  }

  const fileList = [fileID]
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })

  const tempFileURL = result.fileList[0].tempFileURL

  if (tempFileURL) {
    const params = { 'MaxFaceNum': 10, 'Url': tempFileURL, 'NeedFaceAttributes': 1 }
    try {
      let result = await faceImgCheck(params)
      return result
    } catch (error) {
      console.log('error :>> ', error);
      return error
    }
  } else {
    return { 'errCode': 1, 'errMsg': '请传入fileID' }
  }
}
