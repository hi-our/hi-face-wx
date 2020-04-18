// 云函数入口文件
const cloud = require('wx-server-sdk')
const tencentcloud = require("tencentcloud-sdk-nodejs");
const config = require('./config');
cloud.init({
  env: 'development-9p1it'
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
  let params = JSON.stringify(params1) //应该是个对象
  console.log(params)
  req.from_json_string(params);
  return new Promise(function (resolve, reject) {
    client.DetectFace(req, function (errMsg, response) {
      if (errMsg) {
        console.log(errMsg);
        reject("面部识别云函数出现错误啦")
      }
      console.log(response.to_json_string());
      console.log(response)
      resolve(response)
    });
  })
};


// 云函数入口函数
exports.main = async (event, context) => {
  const { fileID } = event
  const fileList = [fileID]
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })
  console.log(result.fileList)
  const params = { 'MaxFaceNum': 10, 'Url': result.fileList[0].tempFileURL }
  return faceImgCheck(params)
}