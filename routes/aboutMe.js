const express = require('express');
const router = express.Router()

const {AboutSchema} = require('../modules/aboutMe')

/*
*   添加关于我     /about_me
* */
router.post('/about_me',(req, res) => {
    const {intro, content, avatar} = req.body;
    // const files = req.file
    console.log(req.body);
    const newAbout = {
        intro,
        content,
        avatar
    }
    AboutSchema.create(newAbout).then(doc => {
        return res.json({code: 0, data: doc})
    })
})
/*
*   获取关于我列表    /about_list
* */
router.get('/about_list',(req, res) => {
    AboutSchema.find().sort({_id:-1}).then(doc => {
        return res.json({code:0, data:doc})
    })
})
/*
*   获取单个关于我    /about_one
* */
router.get('/about_one',(req, res) => {
    const {id} = req.query
    AboutSchema.findOne({_id: id}).then(doc => {
        return res.json({code:0, data:doc})
    })
})
/*
*   编辑单个文章信息    /about_edit
* */
router.post('/about_edit',(req, res) => {
    const {intro, content, _id, avatar} = req.body;
    const newAbout = {
        intro,
        content,
        avatar
    }
    console.log(_id);
    AboutSchema.findOneAndUpdate({_id},{$set:newAbout},{new:true}).then(doc => {
        return res.json({code: 0, data: doc})
    }).catch(err => {
        return res.json({code:1, msg:'编辑错误'})
    })
})
/*
*   删除单个文章     /about_del
* */
router.get('/about_del',(req, res) => {
    const _id = req.query.id
    AboutSchema.deleteOne({_id}).then(doc => {
        return res.json({code:0, data:doc})
    })
})

module.exports = router
