import express from 'express'
import bodyParser from 'body-parser'

import routes from './routes'
import config from 'config-lite'
import pkg from './package'
import auth from './middlewares/auth'
import paths from './lib/paths'

let app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//auth middleware
app.use(auth.init())

// 路由
routes(app)

//设置根路径
paths.setRootAsync(__dirname)

if (module.parent) {
   module.exports = app
} else {
  // 监听端口，启动程序
  app.listen(config.port, () => console.log(`${pkg.name} listening on port ${config.port}`))
}
