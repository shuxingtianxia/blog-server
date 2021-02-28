const mongoose = require('mongoose')

//分类
const categorySchema = mongoose.Schema({
    title:{type:String,required:true},
    time:{type: String,default:Date.now()}
})
const CategorySchema = mongoose.model('category',categorySchema)
exports.CategorySchema = CategorySchema

//文章
const articleSchema = mongoose.Schema({
    articleName:{type:String,required:true},   //  文章标题
    categoryId:{type:mongoose.Schema.Types.ObjectId, ref:'category'},         //  文章分类ID
    articleCategory:{type: String},         //  文章分类
    files:{type:Object},                 //  文件信息
    dynamicTags:{type:Array},            //  关键字
    articleImgUrl:{type:String},               //   文章缩略图路径
    articleImgName:{type:String},               //   文章缩略图名称
    articleIntro:{type:String,required:true},      //   文章简介
    articleContent:{type:String,required:true},     //  文章内容
    time: {type: String,default: Date.now()},      //  发布时间
    author:{type:String,default:'admin'},    // 发布作者
    likeCount: {type: Number, default: 0}, // 点赞数量
    isLike: {type: Boolean}, // 是否点赞过
    views:{type: Number,default: 0},       //   阅读量
    comment: {type: Array,default: []}   //  文章评论
})
const ArticleSchema = mongoose.model('article',articleSchema)
exports.ArticleSchema = ArticleSchema
