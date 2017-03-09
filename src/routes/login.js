import path from 'path'
import { Router } from 'express'

import paths from '../lib/paths'
import models from '../models/models'

const router = Router();

router.post('/', (req, res) => {
  let userToken = req.body.usertoken
  let channelModel = models.getModel('channelModel')
  channelModel.createChannel(userToken, (err, newChannel) => {
    if(err) return res.status(500).end() 
    res.json({
      id: newChannel.channelid,
      token: newChannel.channelToken
    })
  })
  
})


router.get('/', (req, res) => {
  res.write('TODO api')
  res.end()
})

export default router