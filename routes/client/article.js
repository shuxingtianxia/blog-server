const express = require('express')
const router = express.Router()

const {CategorySchema, ArticleSchema} = require('../../modules/article')
const { likeSchema } = require('../../modules/like')
const { viewSchema } = require('../../modules/view')
const { statisticsSchema } = require('../../modules/statistics')
const { commentSchema } = require('../../modules/comment')

// 定义时间格式
const {formDate, isAdmin} = require('../../unit/unit')

let userInfo = ''

router.use((req, res, next) => {
    userInfo = req.userInfo
    next()
})

/*
*   获取所有分类    /index_category
* */
router.get('/index_category',(req, res) => {
    CategorySchema.find().sort({time: -1}).then(category => {
        res.json({code:0, msg:'查找所有分类成功',data:category})
    })
})

/*
*   查找单个分类的数据     /index_article_category
* */
router.get('/index_article_category',(req, res) => {

    let {category, page} = req.query
    page = Number(page) || 1
    let limit = 10
    let pages = 0

    ArticleSchema.count({articleCategory:category}).then(count => {
        pages = Math.ceil(count/limit); //总数据除以每页限制数据=页数
        page = Math.min(page,pages);
        page = Math.max(page,1);
        let skip = (page-1)*limit
        ArticleSchema.find({articleCategory:category}).sort({_id: -1}).limit(limit).skip(skip).then(doc => {
            return res.json({code:0, data: {data: doc, count, limit, page, pages, skip}})
        })
    })
})

/*
*   查找所有文章    /index_article
* */
router.get('/index_article',(req, res) => {
    let {view, page, size} = req.query
    page =  Number(page) || 1
    limit = Number(size) || 10
    let pages = 0
    ArticleSchema.countDocuments().then(count => {
        pages = Math.ceil(count/limit); //总数据除以每页限制数据=页数
        // page = Math.min(page,pages);
        // page = Math.max(page,1);
        let skip = (page-1)*limit
        if(view){
            ArticleSchema
              .find({})
              .sort({views: -1})
              .limit(limit)
              .skip(skip)
              .populate({
                path: 'categoryId',
                select: 'title'
              }).then(doc => {
                if(doc.length) {
                  return res.json({code:0, data: {data: doc, count, limit, page, pages, skip}})
                } else {
                  return res.json({code: 1, msg: '已经到底了'})
                }
            })
        }else{
            ArticleSchema
              .find({})
              .sort({_id: -1})
              .limit(limit)
              .skip(skip)
              .populate({
                path: 'categoryId',
                select: 'title'
              }).then(doc => {
                if(doc.length) {
                  return res.json({code:0, data: {data: doc, count, limit, page, pages, skip}})
                } else {
                  return res.json({code: 1, msg: '已经到底了'})
                }
            })
        }

    })
})

/*
*   查询上一条文章
* */
router.get('/index_article_prev',(req, res) => {
    let _id = req.query.id
    ArticleSchema.findOne({_id:{$gt: _id}}).then(doc => {
        return res.json({code:0,data:doc})
    }).catch(() => {
        return res.json({code:1,msg:'服务器异常，请稍后重试'})
    })
})

/*
*   查询下一条文章
* */
router.get('/index_article_next',(req, res) => {
    let _id = req.query.id
    ArticleSchema.findOne({_id:{$lt: _id}}).then(doc => {
        return res.json({code:0,data:doc})
    }).catch(() => {
        return res.json({code:1,msg:'服务器异常，请稍后重试'})
    })
})

/*
*   文章详情     /index_detail
* */
router.get('/index_detail', (req, res) => {
    let articleId = req.query.id
    let userId = req.query.userId
    const ip = req.ip
    ArticleSchema.findOne({_id: articleId}).then( async doc => {
        // 查询点赞数量及该用户是否已经点赞过
        const result = userId && await likeSchema.findOne({userId})
        doc.isLike = result ? true : false
        // 获取点赞的总数
        const result1 = await statisticsSchema.findOne({articleId})
        doc.likeCount = result1 ? result1.likeCount : 0
        // 查看改用户是否浏览过
        const viewDoc = await viewSchema.findOne({articleId, ip}) || {}
        const time = formDate()
        if(viewDoc.ip !== ip){
            console.log('reeq.id', req.ip)
            // 没有被预览过
            viewSchema.create({articleId, ip, time})
            doc.views++
        } else if((new Date(time)).getTime() - (new Date(viewDoc.time)).getTime() > (1000 * 60 * 60 * 6)) {
            // 6个小时后访问会重新计算
            viewDoc.time = time
            viewDoc.save()
            doc.views++
        }
        doc.save()
        return res.json({code:0,data:doc})
    }).catch(() => {
        return res.json({code:1, msg:'服务器异常，请重试'})
    })
})

/*
*   // 文章详情,提交新的评论      /index_detail_comment
* */
router.post('/index_detail_comment',(req, res) => {
    let {content, articleId, username, formId, avatar, replyId, userId} = req.body
    let newData = {
        userId,
        avatar,
        username,
        articleId,
        content,
        formId,
        replyId
    }
    console.log('replyId', replyId)
    commentSchema.findOne({_id: replyId === '0' ? null : replyId}).then(commentDoc => {
        if(commentDoc) {
            // 可以找到这条评论的父级
            commentDoc.child.push(newData)
            commentDoc.save()
            return res.json({code:0, data: commentDoc})
        } else {
            commentSchema.create(newData).then(doc => {
                return res.json({code:0,data:doc})
            })
        }
    })
    
})

/*
*   查找一篇文章的评论       /index_detail_comments
* */
router.get('/index_detail_comments',(req, res) => {
    let {articleId, page} = req.query
    page =  Number(page) || 1
    limit = 10
    let pages = 0
    commentSchema.countDocuments().then(count => {
        pages = Math.ceil(count/limit); //总数据除以每页限制数据=页数
        let skip = (page-1)*limit
        commentSchema
        .find({articleId})
        .sort({_id: -1})
        .limit(limit)
        .skip(skip)
        .populate({
          path: 'userId',
        }).then(doc => {
            if(doc.length) {
                return res.json({code:0, data: {data: doc, count, limit, page, pages, skip}})
              } else {
                return res.json({code: 1, msg: '已经到底了'})
              }
        }).catch(() => {
            return res.json({code:1, msg:'服务器异常，请稍户重试'})
        })
    })
})

/*
*   点赞      /index_detail_like
* */
router.post('/index_detail_like',(req, res) => {
    const {articleId, userId} = req.body;
    const result = {
        articleId,
        userId
    }
    likeSchema.findOne({articleId, userId}).then(async doc => {
        if(doc) {
            // 点赞过
            await doc.remove()
            statisticsSchema.findOne({articleId}).then(doc1 => {
                doc1.likeCount--
                doc1.save()
                return res.json({code: 0, data: {isLike: false, ...doc1}})
            })
        } else {
            // 没有点赞过
            likeSchema.create(result)
            statisticsSchema.findOne({articleId}).then(doc1 => {
                if(doc1) {
                    doc1.likeCount++
                    doc1.save()
                    return res.json({code: 0, data: {isLike: true, ...doc1}})
                } else {
                    // 统计表还没有统计该文章点赞总数
                    statisticsSchema.create({likeCount: 1, articleId}).then(doc => {
                        doc.isLike = true
                        return res.json({code: 0, data: {isLike: true, doc}})
                    })
                }
            })
        }
    }).catch(() => {
        return res.json({code:1, msg:'服务器异常，稍后请重试'})
    })
})
/*
*   模糊查询    /search
* */
router.get('/search',(req, res) => {
    const key = req.query.keyword;
    // const data = new RegExp(key, 'i')
    ArticleSchema.find({
        // $or:[
        //     {'articleName':{'$regex': data, $options: '$i'}},
        //     {'articleIntro':{'$regex': data, $options: '$i'}}
        // ]
    }).sort({_id:-1}).then(doc => {
        return res.json({code:0, data:doc})
    })
})


module.exports = router
