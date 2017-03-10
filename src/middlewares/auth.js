import path from 'path'

import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import models from '../models/models'
import { secret } from '../config/passportJwt'
import paths from '../lib/paths'
import define from '../utils/define'

const jwtOpts = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromAuthHeader()
}

const jwtVerify = (jwt_payload, done) => {
  let channelModel = models.getModel(define.channelModel)
  let channel = channelModel.collection.list.find(c => c.channelid === jwt_payload.uuid)
  channel ? done(null, {uuid: jwt_payload.uuid}) : done(null, false)
}

passport.use(new JwtStrategy(jwtOpts, jwtVerify))

export default {
  init: () => passport.initialize(),
  jwt: () => passport.authenticate('jwt', { session: false })
}

