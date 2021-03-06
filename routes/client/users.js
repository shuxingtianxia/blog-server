const express = require('express')
const request = require('request')
const router = express.Router()
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const passport = require('passport')

const WXBizDataCrypt = require('../../unit/WXBizDataCrypt')
const config = require('../../unit/config')

const {
  UserModule
} = require('../../modules/users')

// 定义时间格式
const {
  formDate,
  isAdmin
} = require('../../unit/unit')


/*
 *   注册    /register
 * */
router.post('/register', (req, res) => {
  const {
    username,
    password,
    password2
  } = req.body
  if (password !== password2) return res.json({
    code: 1,
    msg: '两次密码不一致'
  })
  UserModule.findOne({
    username
  }).then(user => {
    if (user) {
      return res.json({
        code: 1,
        msg: '用户名已被注册'
      })
    }
    formDate()
    const time = formDate()
    const newUser = new UserModule({
      username,
      password: md5(password),
      time
    })
    newUser.save().then(user => {
      return res.json({
        code: 0,
        username,
        _id: user.id
      })
    }).catch(() => {
      return res.json({
        code: 1,
        msg: '服务器异常，请稍后重试'
      })
    })
  }).catch(() => {
    return res.json({
      code: 1,
      msg: '服务器异常，请稍后重试'
    })
  })
})

/*
 *   登录    /login
 * */
router.post('/login', (req, res) => {
  const {
    username,
    password
  } = req.body
  UserModule.findOne({
    username
  }).then((user) => {
    if (!user) {
      return res.json({
        code: 1,
        msg: '用户不存在'
      })
    }
    if (password == user.password) {
      const rule = {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        serverTime: Math.floor(new Date().getTime() / 1000)
      }
      jwt.sign(rule, 'secret', {
        expiresIn: 3600 * 24
      }, (err, token) => {
        if (err) throw err
        return res.json({
          code: 0,
          success: true,
          token: 'Bearer ' + token
        })
      })
    } else {
      return res.json({
        code: 1,
        msg: '密码错误'
      })
    }
  }).catch(() => {
    return res.json({
      code: 1,
      msg: '服务器异常，请稍后重试'
    })
  })
})

/*
 *   退出登录    /logout
 * */
router.get('/logout', (req, res) => {
  res.clearCookie('userInfo')
  res.clearCookie('isAdmin')
  return res.json({
    code: 0,
    msg: '退出登录'
  })
})

/*
 *   检查是否登录     /checkLogin
 * */
// router.get('/checkLogin', isAdmin, (req, res) => {
//     console.log(req.user)
//     const {username, _id, isAdmin, time} = req.user
//     return res.json({code:0,data:{username, _id, isAdmin, time}})
// })

// 微信登录
let {
  appId,
  secret,
  authorizationCode
} = config;
let sessionKey = null;
let openid = null;

router.get('/onLogin', (req, res) => {
  // 获取到登录后的code
  const {
    encryptedData,
    iv,
    code
  } = req.query;
  // 向微信服务器发送信息获取到 openid 和 session_key
  request(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=${authorizationCode}`, async (err, response, body) => {
    if (err) console.log(err);
    body = JSON.parse(body);
    /*
    签名校验以及数据加解密涉及用户的会话密钥session_key。 需要保存在服务器
    openid 判断是否是同一个用户
    session_key 判断用户是否失效
    data: {
      openid: '**********',
      session_key: '********'
    }
    */
    let {
      session_key
    } = body; // 提取session_key解密
    let pc = new WXBizDataCrypt(appId, session_key)
    const data = pc.decryptData(encryptedData, iv)
    let user = await UserModule.findOne({
      openId: data.openId
    })
    if (!user) {
      const newUser = {
        username: data.nickName,
        openId: data.openId,
        city: data.city,
        type: 'wx',
        avatarUrl: data.avatarUrl
      }
      user = await UserModule.create(newUser)
    }
    data.userId = user._id

    // const rule = {
    //     id: user._id,
    //     username: user.username,
    //     serverTime: Math.floor(new Date().getTime() / 1000)
    // }
    // jwt.sign(rule, 'secret', { expiresIn: 3600 }, (err, token) => {
    //     if (err) throw err
    //     return res.json({
    //         code: 0,
    //         success: true,
    //         data: {
    //             token: 'Bearer ' + token,
    //             ...data
    //         }
    //     })
    // })
    return res.json({
      code: 0,
      data
    })


  })
})



module.exports = router