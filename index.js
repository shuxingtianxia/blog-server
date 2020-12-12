const express = require('express')
const multer = require('multer')
const ueditor = require("ueditor");
const bodyParser = require('body-parser')
// 根据token实现验证请求
const passport = require('passport')

//引入处理路径模块
const path = require('path');

const app = express()

//开放静态资源
app.use(express.static('./uploads'))
// app.use(express.static('./public'))
//处理静态文件 todo
// 访问静态资源文件 这里是访问所有dist目录下的静态资源文件
app.use(express.static(path.resolve(__dirname, 'public/')))
app.use('/ueditor', function(req, res ,next) {
    res.render('views/');
    next();
});

// 连接数据库
// 1.引用mongoose
const mongoose = require('mongoose')
// 2.连接指定数据库
mongoose.connect('mongodb://localhost/test93', {
    useNewUrlParser: true
}).then(() => {
    console.log('连接数据库成功');
}).catch(() => {
    console.log('连接数据库失败');
})

// 引入user.js
const userRouter = require('./routes/users')
const articleRouter = require('./routes/article')
const adminRouter = require('./routes/admin')
const aboutRouter = require('./routes/aboutMe')
const photoRouter = require('./routes/photo')
const qiniuRouter = require('./routes/qiniu')

//允许跨域
app.all('*', (req, res, next) => {
    const {origin, Origin, referer, Referer} = req.headers;
    const allowOrigin = origin || Origin || referer || Referer || '*';
    res.header("Access-Control-Allow-Origin", allowOrigin);
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true); //可以带cookies
    res.header("X-Powered-By", 'Express');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
})

app.get('/', (req, res) => {
    res.send('欢迎来到node搭建博客后台')
})

// 设置图片存储路径
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})
// 添加配置文件到multer对象。
const upload = multer({storage: storage});
app.use(upload.single('file'));

// 使用body-parser中间件
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// passport初始化
app.use(passport.initialize())
require('./config/passport')(passport)

// 使用router中间件
app.use('/', userRouter)
app.use('/article', articleRouter)
app.use('/article', adminRouter)
app.use('/about', aboutRouter)
app.use('/photo', photoRouter)
app.use('/qiniu', qiniuRouter)

//使用模块

const post = process.env.POST || 6677
app.listen(post, () => {
    console.log(post);
    console.log('服务器启动成功');
})