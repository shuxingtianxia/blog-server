const express = require('express');
const router = express.Router();

const {PhotoModel}  = require('../modules/photo');

/*
*   获取图片    /photo
* */
router.get('/photo',(req, res) => {
    PhotoModel.find().then(doc => {
        return res.json({code:0, data:doc})
    })
})

/*
*   添加图片    /photo_add
* */
router.post('/photo_add',(req, res) => {
    const {author, title} = req.body
    const file = req.file;
    const photo = {
        author,
        title,
        imgUrl:'http://localhost:6677/'+file.filename,
        photoName:file.filename
    }
    PhotoModel.create(photo).then(doc => {
        return res.json({code:0, data:doc})
    })
})
/*
*   编辑图片    /photo_edit
* */
router.post('/photo_edit/:id',(req, res) => {
    const {author, title, fileName} = req.body
    const _id = req.params.id
    const file = req.file;
    const filename = file ? file.filename : fileName
    const photo = {
        author,
        title,
        imgUrl:'http://localhost:6677/'+filename,
        photoName:filename
    }
    PhotoModel.findOneAndUpdate({_id},{$set:photo},{new:true}).then(doc => {
        return res.json({code:0, data:doc})
    })
})

/*
*   删除图片    /photo_del
* */
router.get('/photo_del',(req, res) => {
    const _id = req.query.id
    PhotoModel.deleteOne({_id}).then(doc => {
        return res.json({code:0, data:doc})
    })
})
/*
*   批量删除    /photo_del_many
* */
router.post('/photo_del_many',(req, res) => {
    const {multipleSelection} = req.body
    console.log(multipleSelection);
    PhotoModel.deleteMany({_id:{$in:multipleSelection}}).then(doc => {
        return res.json({code:0, data:'删除成功'})
    })
})

module.exports = router
