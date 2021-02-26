const mongoose = require('mongoose');

const statisticsSchema = mongoose.Schema({
    articleId: {type: String, required: true},                // 文章id
    likeCount: {type: Number, default: 0}, // 点赞数量   
    viewCount: {type:  Number, default: 0}, // 观看人数
})
exports.statisticsSchema = mongoose.model('statistics', statisticsSchema)