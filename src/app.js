import path from 'path'

import express from 'express'
import bodyParser from 'body-parser'

import routes from './routes'
import auth from './middlewares/auth'
import paths from './lib/paths'
import models from './models/models'
import { createChannelModelAsync } from './models/channelModel'

let app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//auth middleware
app.use(auth.init())

// config routes
routes(app)

//set root path
paths.setRootAsync(process.cwd())

let channelPath = path.join(paths.get('channels'), 'channels.json')
createChannelModelAsync(channelPath, paths.get('tmp')).asCallback((e, channelModel) => {
    models.setModel('channelModel', channelModel)
})

export default app
// if (module.parent) module.exports = app 
// else 
//   app.listen(config.port, () => console.log(`${pkg.name} listening on port ${config.port}`))

