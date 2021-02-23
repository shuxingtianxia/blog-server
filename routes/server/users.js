const express = require('express')
const router = express.Router()
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const passport = require('passport')

const {UserModule} = require('../../modules/users')

// 定义时间格式
const {formDate, isAdmin} = require('../../unit/unit')

/*
*   登录    /login
* */
router.post('/login',(req, res) => {
    const {username, password} = req.body
    UserModule.findOne({username}).then((user) => {
        if(!user){
            return res.json({code:1,msg:'用户不存在'})
        }
        if(md5(password) == user.password){
            const rule = {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin,
                serverTime: Math.floor(new Date().getTime() / 1000)
            }
            jwt.sign(rule, 'secret',{expiresIn: 10},(err, token) => {
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

module.exports = router
