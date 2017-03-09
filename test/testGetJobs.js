import path from 'path'
import fs from 'fs'

import request from 'supertest'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { expect } from 'chai'

import { createChannelModel } from '../src/models/channelModel'
import models from '../src/models/models'
import app from '../src/app'

let userUUID = '9f93db43-02e6-4b26-8fae-7d6f51da12af'
let channelUUID = '1ee2be49-05c4-4ae1-b249-cd6f4cf04376'
let channelToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiMWVlMmJlNDktMDVjNC00YWUxLWIyNDktY2Q2ZjRjZjA0Mzc2In0.7pLiR5ftDpDZqmz7i0-6Y96HBPTjJd-svKUOvODm2dY'

let job1 = {
    jobid: '123456',
    req:{
        d: 'test 1',
        s: 'test 1',
        segments:[]
    },
    res:{}

}
let job2 = {
    jobid: '789456',
    req:{
        d: 'test 2',
        s: 'test 2',
        segments:[]
    },
    res:{}

}

let jobsArr = [ '123456', '789456']

let channelModels = [
  {
    channelToken,
    "channelid": channelUUID,
    "jobs": [job1, job2],
    "user": userUUID
  }
]

describe(path.basename(__filename) + ' : test device get jobs id list api' ,() => {
    beforeEach( (done) => {
        rimraf.sync('tmptest')
        mkdirp('tmptest', err => {
            if(err) return done(err)
            let json = JSON.stringify(channelModels, null, '  ')
            fs.writeFile(path.join(process.cwd(), 'tmptest/channelModel.json'), json, (e) => {
                if(e) return done(e)
                createChannelModel(path.join(process.cwd(), 'tmptest/channelModel.json'), path.join(process.cwd(), 'tmptest'), (e, res)=>{
                    if(e) return done(e)
                    models.setModel('channelModel', res)
                    done()
                })
            })
            
        })
    })

    const getJobs = (callback) => {
      request(app)
        .get('/job')
        .set('Authorization', 'JWT ' + channelToken)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return callback(err)
          callback(null, res.body)
        })
    }

    it('should get jobs id list ', (done) => {       
        getJobs((e, res) => {
            if(e) return done(e)
            expect(res.length).to.equal(2)
            expect(res).to.deep.equal(jobsArr)
            done()
        })
    })

    afterEach('delete tmp files', (done) => {
        rimraf.sync('tmptest')
        done()
    })

})