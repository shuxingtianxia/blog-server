// 引入前台路由
const banner = require('./client/banner')
const about = require('./client/aboutMe')
const users = require('./client/users')
const article = require('./client/article')

// 引入后台台路由
const sBanner = require('./server/banner')
const sAbout = require('./server/aboutMe')
const sUsers = require('./server/users')

module.exports = app => {
  // 前台
  app.use('/client', banner)
  app.use('/client', about)
  app.use('/client', users)
  app.use('/client', article)

  // 后台
  app.use('/server', sBanner)
  app.use('/server', sAbout)
  app.use('/server', sUsers)

}