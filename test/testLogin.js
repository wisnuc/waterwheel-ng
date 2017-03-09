import path from 'path'
import fs from 'fs'

import jwt from 'jwt-simple'
import request from 'supertest'
import sinon from 'sinon'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import UUID from 'node-uuid'
import { expect } from 'chai'

import { createChannelModel } from '../src/models/channelModel'
import { secret } from '../src/config/passportJwt'
import token from '../src/lib/token'
import app from '../src/app'

let userUUID = '9f93db43-02e6-4b26-8fae-7d6f51da12af'
let channelUUID = '1ee2be49-05c4-4ae1-b249-cd6f4cf04376'
let channelToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiMWVlMmJlNDktMDVjNC00YWUxLWIyNDktY2Q2ZjRjZjA0Mzc2In0.7pLiR5ftDpDZqmz7i0-6Y96HBPTjJd-svKUOvODm2dY'
let nasResponse = {
    uuid: channelUUID,
    user: userUUID,
    channelToken
}

describe(path.basename(__filename) + ' : test device login api' ,() => {
    beforeEach( (done) => {
        mkdirp('tmptest', err => {
            if(err) return done(err)
            createChannelModel(path.join(process.cwd(), 'tmptest/channelModel.json'), path.join(process.cwd(), 'tmptest'), (e, res)=>{
                if(e) return done(e)
                done()
            })
        })
    })

    const postLogin = (post, callback) => {
     
      request(app)
        .post('/login')
        .send(post)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return callback(err)
          callback(null, res.body)
        })
    }

    const post = {
        usertoken: userUUID
    }

    it('should get ctk as channelUUID', (done) => {
        sinon.stub(token, 'tokenFromNas', (props, callback) => {
            callback(null, nasResponse)
        })
        sinon.stub(UUID, 'v4').returns(channelToken)
        postLogin(post, (e, res) => {
            if(e) {
                token.tokenFromNas.restore()
                UUID.v4.restore()
                return done(e)
            }
            expect(res.token).to.equal(channelToken)
            token.tokenFromNas.restore()
            UUID.v4.restore()
            done()
        })
    })

    afterEach('delete tmp files', (done) => {
        rimraf.sync('tmptest')
        done()
    })

})