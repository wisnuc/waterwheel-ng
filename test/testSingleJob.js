import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

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

let channelModels = [
  {
    channelToken,
    "channelid": channelUUID,
    "jobs": [],
    "user": userUUID
  }
]

let fileSha256 = false

let filePath = path.join(process.cwd(), 'tmptest/test.json')

let post1 = false

describe(path.basename(__filename) + ' : test device create new job api' ,() => {
  beforeEach( (done) => {
    rimraf.sync('tmptest')
    mkdirp('tmptest', err => {
      if(err) return done(err)
      let json = JSON.stringify(channelModels, null, '  ')
      fs.writeFile(path.join(process.cwd(), 'tmptest/channelModel.json'), json, (e) => {
        if(e) return done(e)

        //fake channelModel
        createChannelModel(path.join(process.cwd(), 'tmptest/channelModel.json'), path.join(process.cwd(), 'tmptest'), (e, res)=>{
          if(e) return done(e)
          models.setModel('channelModel', res)

          //create Test File
          fs.writeFile(path.join(filePath), json, e => {
            if(e) done(e)
            const hash = crypto.createHash('sha256');
            const input = fs.createReadStream(filePath);
            input.on('readable', () => {
              var data = input.read();
              if (data)
                hash.update(data);
              else {
                fileSha256 =  hash.digest('hex')
                post1 = {
                  d: 'test d',
                  s: 'test s',
                  segments: [
                    {
                      sha256: fileSha256,
                      size: 1000
                    }
                  ]
                }
                done()
              }
            })
            input.on('error', (e) => {
              done(e)
            })
          })
        })
      })
    })
  })
  const postSingleJob = (post, callback) => {
    request(app)
      .post('/job')
      .set('Authorization', 'JWT ' + channelToken) 
      .set('Accept', 'application/json')
      .field('d', post.d)
      .field('s', post.s)
      .field('segments', JSON.stringify(post.segments))
      .attach('file', filePath)
      .expect(200)
      .end((err, res) => {
        if (err) return callback(err)
        // expect(res.body.digest).to.equal(sha256Of20141213)
        // expect(Number.isInteger(res.body.ctime)).to.be.true 
        callback() 
      })
  }

  it('should get new singleJob ', (done) => {       
      postSingleJob(post1, (e, res) => {
        if(e) return done(e)
        done()
      })
  })

  afterEach('delete tmp files', (done) => {
      rimraf.sync('tmptest')
      
      done()
  })

})