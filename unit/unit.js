const jwt = require('jsonwebtoken')

exports.formDate = () => {
  let date = new Date(),
      yy = date.getFullYear(),
      MM = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0'+(date.getMonth() + 1),
      dd = date.getDate() >= 10 ? date.getDate()  : '0'+date.getDate(),
      hh = date.getHours() >= 10 ? date.getHours() : '0'+date.getHours(),
      mm = date.getMinutes() >= 10 ? date.getMinutes() : '0'+date.getMinutes(),
      ss = date.getSeconds() >= 10 ? date.getSeconds() : '0'+date.getSeconds();
  return yy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss;
}

// 中间件
exports.isAdmin = (req, res, next) => {
  const token = req.headers.authorization.split(' ').pop()
  try {
    global.userInfo = jwt.verify(token, 'secret')
    console.log('userInfo', userInfo)
    next()
  }catch(err) {
    res.status(401).json({code: 1, msg: 'token已过期'})
  }
}
