const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  username: {type: String}, // 用户id
  avatar: {type: String}, // 用户头像
  content: {type: String}, // 评论内容
  articleId: {type: String}, // 文章id
  replyId: {type: String}, // 第几级
  formId: {type: String}, // 第几级
  time: {type: String, default: Date.now()}, // 时间
  child: {type: Array, default: []} // 子级
})

exports.commentSchema  = mongoose.model('comment', commentSchema)