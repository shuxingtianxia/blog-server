let qiniu = require('qiniu')
const express = require('express')
const router = express.Router()
const passport = require('passport')

const {isAdmin} = require('../../unit/unit')

const accessKey = 'ZfKQX_Vx_Q57FE3lSfLCDaoXDVehDEtc1M7tLLnt'
const secretKey = 'ayQCGN9VV2cgOSoTtugaRZ67qFGsNuAkbWfxDY0Q'

qiniu.conf.ACCESS_KEY = accessKey
qiniu.conf.SECRET_KEY = secretKey

let bucket = "lao-img"

let imageUrl = "https://up-z2.qiniup.com"; // 你要上传的域名
let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

const imgdomain = "http://pic.booktianxia.top"; //创建bucket是七牛自动分配的域名

let config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z2;
// var bucketManager = new qiniu.rs.BucketManager(mac, config);
// let option = { limit: 20 }

// 获取前端上传七牛云所属需要的token
router.get("/getToken", isAdmin, (req, res) => {
  let options = {
    scope: bucket,
    expires: 3600 * 24
  };
  let putPolicy = new qiniu.rs.PutPolicy(options);
  let uploadToken = putPolicy.uploadToken(mac);
  if (uploadToken) {
    res.json({code:0, data:uploadToken})
  } else {
    req.body = "error";
  }
})

module.exports = router
