const mongoose = require('mongoose');

const photoSchema = mongoose.Schema({
    title:{type:String},        // 作品标题
    author:{type:String},                // 作者
    imgUrl:{type:String, required:true},                //图片路径
    photoName:{type:String},          //作品路径名称
})
const PhotoModel = mongoose.model('Photo', photoSchema)
exports.PhotoModel = PhotoModel
