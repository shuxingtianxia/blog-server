const mongoose = require('mongoose');

const viewSchema = mongoose.Schema({
    ip: {type: String, required: true},        // 用户id
    articleId: {type: String, required: true},                // 文章id
    // viewCount: {type: Number, default: 0}, // 点赞数量
    time: {type: String,default: Date.now()},                //图片路径
})
exports.viewSchema = mongoose.model('view', viewSchema)
