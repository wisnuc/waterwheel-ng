import fs from 'fs'
import path from 'path'

import { Router } from 'express'
import formidable from 'formidable'
import UUID from 'node-uuid'
import sanitize from 'sanitize-filename'

import paths from '../lib/paths'
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
        let jobs =  channel.jobs.map( item => item.jobid)
        res.status(200).type('application/json').json(jobs)
    })
})

// update a job , auth.jwt()   -> Type : nas / client 
router.post('/:JobId/:Type', auth.jwt(), (req, res) => {
  let channelId = req.user.uuid;
  getChannelModelAsync().asCallback((err, channelModel) => {
    if(err) return res.status(500).json({})
    let job = channelModel.getJob(channelId, req.params.JobId)
    if(!job) return res.status(404).json({})
        
    if (req.is('multipart/form-data')) {
      let sha256, abort = false

      let form = new formidable.IncomingForm()
      form.hash = 'sha256'

      form.on('field', (name, value) => {
        if (name === 'sha256') 
          sha256 = value
      })

      form.on('fileBegin', (name, file) => {
        if (sanitize(file.name) !== file.name) {
          abort = true
          return res.status(500).json({})  // TODO
        }
        file.path = path.join(paths.get('tmp'), UUID.v4())
      })

      form.on('file', (name, file) => {
        if (abort) return res.status(500).end()
        if (sha256 !== file.hash) {
          return fs.unlink(file.path, err => {
            res.status(500).json({})  // TODO
          })
        }
        let targetpath = path.join(paths.get('file'), UUID.v4())
        fs.rename(file.path, targetpath, err => {
          if(err) return res.status(500).json({})
            // TODO
          return res.status(200).json({})
        })
      })

      // this may be fired after user abort, so response is not guaranteed to send
      form.on('error', err => {
        abort = true
        return res.status(500).json({
          code: err.code,
          message: err.message
        })
      })

      form.parse(req)
    }else{
      // TODO waiting for model
    }

  })
})

//get a job obj
router.get('/:JobId', auth.jwt(), (req, res) => {
    let channelId = req.user.uuid;
    getChannelModelAsync().asCallback((err, channelModel) => {
        if(err) return res.status(500).json({})
        let job = channelModel.getJob(channelId, req.params.JobId)
        if(!job) return res.status(404).json({})
        return res.status(200).json(job)
    })
})

//remove a job api may not be used
router.delete('/:JobId', auth.jwt(), (req, res) => {
    let channelId = req.user.uuid;
    getChannelModelAsync().asCallback((err, channelModel) => {
        if(err) return res.status(500).json({})
        channelModel.removeJob(channelId, req.params.JobId, (e) => {
            if(e) res.status(500).end()
            res.status(200).json({})
        })
    })
})

export default router