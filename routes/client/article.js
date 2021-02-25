const express = require('express')
const router = express.Router()

const {CategorySchema, ArticleSchema} = require('../../modules/article')
const {likeSchema} = require('../../modules/like')
const {statisticsSchema} = require('../../modules/statistics')

// 定义时间格式
const {formDate, isAdmin} = require('../../unit/unit')

let userInfo = ''

router.use((req, res, next) => {
    // console.log('req.userInfo', req.userInfo)
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

    let {category,page} = req.query
    page = Number(page) || 1
    let limit = 10
    let pages = 0

    ArticleSchema.count({articleCategory:category}).then(count => {
        pages = Math.ceil(count/limit); //总数据除以每页限制数据=页数
        page = Math.min(page,pages);
        page = Math.max(page,1);
        let skip = (page-1)*limit
        ArticleSchema.find({articleCategory:category}).sort({_id: -1}).limit(limit).skip(skip).then(doc => {
            return res.json({code:0,data:doc,count,limit,page,pages,skip})
        })
    })
})

/*
*   查找所有文章    /index_article
* */
router.get('/index_article',(req, res) => {
    const {view} = req.query
    let page =  Number(req.query.page) || 1
    let limit = Number(req.query.size) || 10
    let pages = 0
    ArticleSchema.count().then(count => {
        pages = Math.ceil(count/limit); //总数据除以每页限制数据=页数
        page = Math.min(page,pages);
        page = Math.max(page,1);
        let skip = (page-1)*limit
        if(view){
            ArticleSchema
                .find({})
                .sort({views: -1})
                .limit(limit)
                .skip(skip)
                .populate({
                    path: 'articleCategory',
                    select: 'title'
                }).then(doc => {
                return res.json({code: 0, data: doc, count, limit, page, pages, skip})
            })
        }else{
            ArticleSchema
                .find({})
                .sort({_id: -1})
                .limit(limit)
                .skip(skip)
                .populate({
                    path: 'articleCategory',
                    select: 'title'
                }).then(doc => {
                return res.json({code:0,data:doc,count,limit,page,pages,skip})
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
    ArticleSchema.findOne({_id: articleId}).then( async doc => {
        // 查询点赞数量及该用户是否已经点赞过
        const result = userInfo && await likeSchema.findOne({userId: userInfo.id})
        doc.isLike = result ? true : false
        // 获取点赞的总数
        const result1 = await statisticsSchema.findOne({articleId})
        doc.likeCount = result1.likeCount
        doc.views++;
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
    let {newComment, _id, username} = req.body
    const time = formDate()
    let newData = {
        username,
        comments: newComment,
        time
    }
    ArticleSchema.findOne({_id}).then(doc => {
        doc.comment.unshift(newData)
        doc.save()
        return res.json({code:0,data:doc})
    })
})

/*
*   查找一篇文章的评论       /index_detail_comments
* */
router.get('/index_detail_comments',(req, res) => {
    let {_id} = req.query
    ArticleSchema.findOne({_id}).then(doc => {
        return res.json({code:0,data:doc.comment})
    }).catch(() => {
        return res.json({code:1, msg:'服务器异常，请稍户重试'})
    })
})

/*
*   点赞      /index_detail_like
* */
router.post('/index_detail_like',(req, res) => {
    const {articleId, userId, isFlag} = req.body;
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
                return res.json({code: 0, data: doc1})
            })
        } else {
            // 没有点赞过
            likeSchema.create(result)
            statisticsSchema.findOne({articleId}).then(doc1 => {
                if(doc1) {
                    doc1.likeCount++
                    doc1.save()
                    return res.json({code: 0, data: doc1})
                } else {
                    // 统计表还没有统计该文章点赞总数
                    statisticsSchema.create({likeCount: 1, articleId}).then(doc => {
                        return res.json({code: 0, data: doc})
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
