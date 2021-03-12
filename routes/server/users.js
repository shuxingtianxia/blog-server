const express = require('express')
const router = express.Router()
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const passport = require('passport')

const {UserModule} = require('../../modules/users')

// 定义时间格式
const {formDate, isAdmin} = require('../../unit/unit')


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
router.post('/login',(req, res) => {
    const {username, password} = req.body
    UserModule.findOne({username}).then((user) => {
        if(!user){
            return res.json({code:1,msg:'用户不存在'})
        }
        if(md5(password) === user.password){
            const rule = {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin,
                serverTime: Math.floor(new Date().getTime() / 1000)
            }
            jwt.sign(rule, 'secret',{expiresIn: 3600 * 24},(err, token) => {
                if(err) throw err
                return res.json({
                    code:0,
                    success:true,
                    token: 'Bearer ' + token
                })
            })
        }else{
            return res.json({code:1,msg:'密码错误'})
        }
    }).catch(() => {
        return res.json({code:1,msg:'服务器异常，请稍后重试'})
    })
})

/*
*   退出登录    /logout
* */
router.get('/logout',(req, res) => {
    res.clearCookie('userInfo')
    res.clearCookie('isAdmin')
    return res.json({code:0,msg:'退出登录'})
})

/*
*   检查是否登录     /checkLogin
* */
router.get('/checkLogin', isAdmin, (req, res) => {
  console.log(req)
  const {username, _id, isAdmin, time} = req.user
  return res.json({code:0,data:{username, _id, isAdmin, time}})
})

// 获取用户列表
router.get('/admin_users', (req, res) => {
  let {page} = req.query
  page = Number(page) || 1
  limit = 10
  let pages = 0
  UserModule.countDocuments().then(count => {
    pages = Math.ceil(count / limit); //总数据除以每页限制数据=页数
    let skip = (page - 1) * limit
    UserModule.find()
    .sort({_id: -1})
    .limit(limit)
    .skip(skip)
    .then(doc => {
        if(doc.length) {
          return res.json({code:0, data: {data: doc, count, limit, page, pages, skip}})
        } else {
          return res.json({code: 1, msg: '已经到底了'})
        }
    }).catch(() => {
        return res.json({code:1, msg:'服务器异常，请稍户重试'})
    })
  })
})

// 删除用户
router.get('/admin_users_del', (req, res) => {
  console.log('req.query', req.query)
  let id = req.query.id
  UserModule.deleteOne({_id: id}).then(doc => {
    return res.json({code: 0, msg: '删除成功'})
  })
})

module.exports = router
