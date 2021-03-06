const express = require('express')
// const multer = require('multer')
// const ueditor = require("ueditor")
const bodyParser = require('body-parser')
// 根据token实现验证请求
const passport = require('passport')
const jwt = require('jsonwebtoken')

//引入处理路径模块
const path = require('path')

//文件处理模块
let fs = require('fs')
//http 和 https服务模块
let http = require('http')
let https = require('https')
//配置你的证书，注意这里的证书是nginx的，不管你服务器用的是apache还是什么这里只要放nginx就好了
const httpsOption = {
    key: fs.readFileSync("./https/5270609_booktianxia.top.key"),
    cert: fs.readFileSync("./https/5270609_booktianxia.top.pem")
}

const app = express()

//开放静态资源
// app.use(express.static('./uploads'))
// // app.use(express.static('./public'))
// //处理静态文件 todo
// // 访问静态资源文件 这里是访问所有dist目录下的静态资源文件
// app.use(express.static(path.resolve(__dirname, 'public/')))
// app.use('/ueditor', function(req, res ,next) {
//     res.render('views/');
//     next();
// });

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
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads');
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${Date.now()}-${file.originalname}`)
//     }
// })
// // 添加配置文件到multer对象。
// const upload = multer({storage: storage});
// app.use(upload.single('file'));

// 使用body-parser中间件
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// 根据token
app.use((req, res, next) => {
    if(req.headers.authorization) {
        const token = req.headers.authorization.split(' ').pop()
        try {
            // 保存用户信息
            req.userInfo = jwt.verify(token, 'secret')
            next()
        }catch(err) {
            req.userInfo = {}
            next()
        }
    } else {
        // console.log('不存在用户cookie 数据！');
        next();
    }
})

// 引入路由  前台
const route = require('./routes/index')
route(app)

// passport初始化
app.use(passport.initialize())
require('./config/passport')(passport)


//使用模块

const post = process.env.POST || 6677
// app.listen(post, () => {
//     console.log('服务器启动成功');
// })
http.createServer(app).listen(post, () => {
    console.log('服务器启动成功')
});
https.createServer(httpsOption, app).listen(6678);