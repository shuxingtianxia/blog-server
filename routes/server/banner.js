const express = require('express')

const router = express.Router()

const {bannerSchema} = require('../..//modules/banner')

router.get('/banner', (req, res) => {
  let {page} = req.query
  page = Number(page) || 1
  limit = 10
  let pages = 0
  bannerSchema.countDocuments().then(count => {
    pages = Math.ceil(count / limit); //总数据除以每页限制数据=页数
    let skip = (page - 1) * limit
    bannerSchema
    .find()
    .sort({_id:-1})
    .limit(limit)
    .skip(skip).then(doc => {
      if(doc.length) {
        return res.json({code:0, data: {data: doc, count, limit, page, pages, skip}})
      } else {
        return res.json({code: 1, msg: '已经到底了'})
      }
    })
  })
  
})

router.post('/banner_add', (req, res) => {
  const {_id, url, articleId, title} = req.body
  if(_id) {
    // 更新
  } else {
    // 新增
    bannerSchema.create({ url, articleId, title }).then(doc => {
      return res.json({code: 0, data: doc, msg: '保存成功'})
    })
  }
  
})

module.exports = router