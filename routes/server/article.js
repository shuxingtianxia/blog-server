const express = require('express')
const router = express.Router()

const {ArticleSchema, CategorySchema} = require('../../modules/article')
const {UserModule} = require('../../modules/users')

// 定义时间格式
const {isAdmin} = require('../../unit/unit')
/*
*   获取所有分类    /admin_category
* */
router.get('/admin_category', isAdmin, (req, res) => {
    CategorySchema.find().sort({time: -1}).then(category => {
        res.json({code:0, msg:'查找所有分类成功',data:category})
    })
})

/*
*   添加分类     /admin_add
* */
router.post('/admin_add', isAdmin, (req, res) => {
    const {title, categoryImage} = req.body
    newCategory= {
        title,
        categoryImage
    };
    CategorySchema.find({title}).then(doc => {
        if(doc.length) {
            console.log(doc)
            return res.json({code: 1, msg: '该分类已存在，请重新输入分类名'})
        } else {
            CategorySchema.create(newCategory).then(doc => {
                return res.json({code:0,data:doc})
            })
        }
    })
})

/*
*   编辑单个分类     /admin_edit
* */
router.post('/admin_edit', isAdmin, (req, res) => {
    const {title, _id} = req.body
    newCategory= {
        title
    };
    CategorySchema.find({title}).then(doc => {
        if(doc.length) {
            return res.json({code: 1, msg: '该分类已存在，请重新输入分类名'})
        } else {
            CategorySchema.findOneAndUpdate({_id},{$set:newCategory},{new:true}).then(doc => {
                return res.json({code:0,data:doc})
            })
        }
    })
    
})

/*
*   删除单个分类     /admin_del
* */
router.get('/admin_del/:id', isAdmin, (req, res) => {
    const {id} = req.params
    CategorySchema.deleteOne({_id:id}).then(doc => {
        return res.json({code:0,data:doc})
    })
})


/*
*   查找所有文章    /admin_article
* */
router.get('/admin_article', isAdmin, (req, res) => {
    let {view, articleName, page, size} = req.query
    console.log(articleName);
    page =  Number(page) || 1
    let limit = Number(size) || 10
    let pages = 0
    ArticleSchema.countDocuments().then(count => {
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
                    path: 'categoryId',
                    select: 'title'
                })
                .populate({
                    path: 'commentId',
                    select: 'content'
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
                })
                .populate({
                    path: 'commentId',
                    select: 'content'
                }).then(doc => {
                return res.json({code:0,data:{data:doc, count, limit, page, pages, skip}})
            })
        }

    })
})

/*
*   添加文章内容    /admin_article_add
* */
router.post('/admin_article_add', isAdmin, (req, res) => {
    const {articleName, categoryId, articleIntro, articleContent, dynamicTags, articleImgUrl } = req.body
    // const files = req.file
    // let keyword = [];
    // keyword = dynamicTags.split(',')
    const newArticle = {
        articleName,
        categoryId,
        dynamicTags,
        articleIntro,
        articleContent,
        articleImgUrl,
        // articleImgName:files.filename
    }
    ArticleSchema.create(newArticle).then(doc => {
        return res.json({code:0,data:doc})
    }).catch(err => {
        return res.json({code:1,msg:'添加失败'})
    })
})

/*
*   获取编辑单个文章      /admin_article_update
* */
router.get('/admin_article_update', isAdmin, (req, res) => {
    const {id} = req.query
    ArticleSchema.findOne({_id: id}).then(doc => {
        return res.json({code:0, data:doc})
    }).catch(err => {
        return res.json({code:1, msg:'没有查到此商品'})
    })
})

/*
*   编辑单个文章      /admin_article_update
* */
router.post('/admin_article_update', isAdmin, (req, res) => {
    const {articleName, articleCategory, articleIntro, articleContent,_id,fileName, dynamicTags, articleImgUrl} = req.body
    // const files = req.file
    // const filename = files ? files.filename : fileName
    const newArticle = {
        articleName,
        articleCategory,
        dynamicTags,
        articleIntro,
        articleContent,
        articleImgUrl
    }
    ArticleSchema.findOneAndUpdate({_id},{$set:newArticle},{new:true}).then(doc => {
        return res.json({code:0, data:doc})
    }).catch(err => {
        return res.json({code:1, msg:'编辑错误'})
    })
})

/*
*   删除单个文章      /admin_article_del
* */
router.get('/admin_article_del/:_id',isAdmin, (req, res) => {
    const {_id} = req.params
    ArticleSchema.deleteOne({_id}).then(doc => {
        return res.json({code:0, data:doc})
    })
})

/*
*   删除多个文章      /admin_article_del_many
* */
router.post('/admin_article_del_many', isAdmin, (req, res) => {
    const {multipleSelection} = req.body
    ArticleSchema.deleteMany({_id:{$in:multipleSelection}}).then(doc => {
        return res.json({code:0, data:'删除成功'})
    })
})

module.exports = router
