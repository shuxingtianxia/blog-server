const mongoose = require('mongoose');

//关于我
const aboutSchema = mongoose.Schema({
    intro: {required:true, type:String},    // 简介
    avatar: {type: String},  // 头像
    avatarName: {type:String},  // 头像名字
    content:{type:String, required: true}       //内容
})
const AboutSchema = mongoose.model('about', aboutSchema)
exports.AboutSchema = AboutSchema
