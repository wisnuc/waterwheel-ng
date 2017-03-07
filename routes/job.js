import { Router } from 'express'

import auth from '../middlewares/auth'
import { getChannelModelAsync } from '../models/channelModel'

const router = Router();

//create new job
router.post('/', auth.jwt(), (req, res) => {
    let channelId = req.user.uuid;
    getChannelModelAsync().asCallback((err, channelModel) => {
        if(err) return res.status(500).json({})
        channelModel.createJob(channelId, (err, newJob) => {
            if(err) return res.status(500).end()
            res.status(200).json({job: newJob.jobid})
        })
    })

})

//get all jobs
router.get('/', auth.jwt(), (req, res) => {
    let channelId = req.user.uuid;
    getChannelModelAsync().asCallback((err, channelModel) => {
        if(err) return res.status(500).json({})
        let channel = channelModel.collection.list.find(c => c.channelid === channelId)
        res.status(200).type('application/json').json(channel.jobs)
    })
})

// update a job , auth.jwt()   -> Type : nas / client 
router.post('/:JobId/:Type', auth.jwt(), (req, res) => {
    
})

router.get('/:JobId', auth.jwt(), (req, res) => {

})

export default router