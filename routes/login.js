import path from 'path'
import { Router } from 'express'

import paths from '../lib/paths'
import { createChannelModelAsync } from '../models/channelModel'

const router = Router();

router.post('/', (req,res) => {
  let userToken = req.body.usertoken
  console.log(userToken)
  let channelPath = path.join(paths.get('channels'), 'channels.json')
  createChannelModelAsync(channelPath, paths.get('tmp')).asCallback((err, channelModel) => {
    if(err) return res.status(500).json({})
    else{
      channelModel.createChannel(userToken, (err, newChannel) => {
        if(err) return res.status(500).end() 
        res.json({
          id: newChannel.channel,
          token: newChannel.channelToken
        })
      })
    }
  })
})


router.get('/', (req,res) => {
  res.write('TODO api')
  res.end()
})

export default router