const mongoose = require('mongoose')
// 2. 定义出对应特定集合的 Model 并向外暴露
// 2.1. 字义 Schema(描述文档结构)
const userSchema = mongoose.Schema({
    username:{type:String,required:true}, //用户名
    password:{type:String}, //密码
    isAdmin:{type:Boolean,default:false}, // 是不是管理员
    city: {type: String}, // 城市
    openId: {type: String}, // OpenId
    type: {type: String}, // 哪里登录的  wx：微信   other：其他地方
    avatarUrl: {type: String}, // 用户头像
    time:{type:String,default: Date.now()} // 时间
})
// 2.2. 定义 Model(与集合对应, 可以操作集合)
const UserModule = mongoose.model('User',userSchema)
// 2.3. 向外暴露 Model
exports.UserModule = UserModule
