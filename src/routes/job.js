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

/**
 * params
 * 
 * {
 *  d:
 *  s:
 *  segments:[{
 *     sha256,
 *     size,
 *   },
 *   ....
 *  ]
 * }
 *
 */

//create new job
router.post('/', auth.jwt(), (req, res) => {
    let channelId = req.user.uuid;
    let singleJob = false   // 是否 一次性 带文件 上传
    getChannelModelAsync().asCallback((err, channelModel) => {
        if(err) return res.status(500).json({})
        if (req.is('multipart/form-data')) {
          singleJob = true
          let sha256, segments, abort, d, s, size = false
          let form = new formidable.IncomingForm()
          form.hash = 'sha256'
          form.on('field', (name, value) => {
            if (name === 'd')  d = value
            else if(name === 's')  s = value
            else if(name === 'segments' && (value instanceof Array) && value.length){
              segments = value
              if(segments[0].hasOwnProperty('sha256') && segments[0].hasOwnProperty('size')){
                sha256 = segments[0].sha256
                size = segments[0].size
              }
            }
          })

          form.on('fileBegin', (name, file) => {
            if(!sha256){
              abort = true
              return res.status(400).json({err: 'could not found sha256'})
            }
            else if (sanitize(file.name) !== file.name) {
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
            let targetpath = path.join(paths.get('file'), sha256)
            
            if(typeof d !== 'string' || typeof s !== 'string' || !d.length || !s.length)
              return res.status(400).json({err: 'd or s not fond'})
            if(typeof sha256 !== string || !sha256.length)
              return res.status(400).json({err: 'need sha256'})
            if(typeof size !== 'number' || size <= 0)
              return res.status(400).json({err: 'size error'}) 

            segments = [{ sha256, size}]
            //move file  
            fs.rename(file.path, targetpath, err => {
              if(err) return res.status(500).json({})
              channelModel.createJob(channelId, { d, s, segments, singleJob }, (err, newJob) => {
                if(err) return res.status(500).end()
                res.status(200).json(newJob)
              })
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
          let { d, s, segments } = req.body

          if(typeof d !== 'string' || typeof s !== 'string' || !d.length || !s.length)
            return res.status(400).json({err: 'd or s not fond'})
          if(!(segments instanceof Array) || segments.length === 0)
            return res.status(400).json({err: 'segments can not be empty'})
          
          let segs = []
          for(let segment in segments){
            if(typeof segment.sha256 !== string || !segment.sha256.length)
              return res.status(400).json({err: 'need sha256'})
            if(typeof segment.size !== 'number' || size <= 0)
             return res.status(400).json({err: 'size error'})
            segs.push({sha256: segment.sha256, size: segment.size})
          }

          channelModel.createJob(channelId, { d, s, segs, singleJob }, (err, newJob) => {
            if(err) return res.status(500).end()
            res.status(200).json(newJob)
          })
        }
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
/**
 *  {sha256 , ...} only care sha256
 */
// update a job , auth.jwt()   -> Type : nas / client 
router.post('/:JobId', auth.jwt(), (req, res) => {
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
        let targetpath = path.join(paths.get('file'), sha256)
        //move file  
        fs.rename(file.path, targetpath, err => {
          if(err) return res.status(500).json({})

          channelModel.updateJob(channel.channelid, job.jobid , sha256, (e, result) => {
            // TODO  error remove tmp file
            if(e) return res.status(500).json({})
            return res.status(200).json(result)
          })
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