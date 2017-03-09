import path from 'path'
import fs from 'fs'

import request from 'supertest'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { expect } from 'chai'

import { createChannelModel } from '../src/models/channelModel'
import app from '../src/app'

let userUUID = '9f93db43-02e6-4b26-8fae-7d6f51da12af'
let channelUUID = '1ee2be49-05c4-4ae1-b249-cd6f4cf04376'
let channelToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiMWVlMmJlNDktMDVjNC00YWUxLWIyNDktY2Q2ZjRjZjA0Mzc2In0.7pLiR5ftDpDZqmz7i0-6Y96HBPTjJd-svKUOvODm2dY'

let channelModels = [
  {
    channelToken,
    "channelid": channelUUID,
    "jobs": [],
    "user": userUUID
  }
]

describe(path.basename(__filename) + ' : test device create new job api' ,() => {
    beforeEach( (done) => {
        rimraf.sync('tmptest')
        mkdirp('tmptest', err => {
            if(err) return done(err)
            let json = JSON.stringify(channelModels, null, '  ')
            fs.writeFile(path.join(process.cwd(), 'tmptest/channelModel.json'), json, (e) => {
                if(e) return done(e)
                createChannelModel(path.join(process.cwd(), 'tmptest/channelModel.json'), path.join(process.cwd(), 'tmptest'), (e, res)=>{
                if(e) return done(e)
                done()
            })
            })
            
        })
    })

    const postJob = (post, callback) => {
      request(app)
        .post('/job')
        .send(post)
        .set('Authorization', 'JWT ' + channelToken)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return callback(err)
          callback(null, res.body)
        })
    }
    let post1 = {
      d: 'test d',
      s: 'test s',
      segments: [
        {
          sha256: 'test sha256',
          size: 1000
        }
      ]
    }

    it('should get newJob ', (done) => {       
        postJob(post1, (e, res) => {
            if(e) return done(e)
            expect(res.req.d).to.equal(post1.d)
            done()
        })
    })

    afterEach('delete tmp files', (done) => {
        rimraf.sync('tmptest')
        done()
    })

})