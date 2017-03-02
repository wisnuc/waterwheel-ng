import express from 'express'
import bodyParser from 'body-parser'

import routes from './routes'
import config from 'config-lite'
import pkg from './package'


let app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 路由
routes(app)

if (module.parent) {
   module.exports = app
} else {
  // 监听端口，启动程序
  app.listen(config.port, () => console.log(`${pkg.name} listening on port ${config.port}`))
}
