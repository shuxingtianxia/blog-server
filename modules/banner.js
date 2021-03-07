const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
  url: {type: String}, // 图片路径
  articleId: {type: String}, // 文章id
  title: {type: String}, // 文章标题
  time: {type: String, default: Date.now()}
})

exports.bannerSchema  = mongoose.model('banner', bannerSchema)