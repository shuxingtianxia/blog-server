const mongoose = require('mongoose');

const likeSchema = mongoose.Schema({
    userId: {type: String, required: true},        // 用户id
    articleId: {type: String, required: true},                // 文章id
    // likeCount: {type: Number, default: 0}, // 点赞数量
    time: {type: String,default: Date.now()},                //图片路径
})
exports.likeSchema = mongoose.model('like', likeSchema)
