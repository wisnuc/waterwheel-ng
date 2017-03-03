import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import { secret } from '../config/passportJwt'

const jwtOpts = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromAuthHeader()
}

const jwtVerify = (jwt_payload, done) => {
  // let User = models.getModel('user')    
  // let user = User.collection.list.find(u => u.uuid === jwt_payload.uuid)
  // user ? done(null, user) : done(null, false)
}

passport.use(new JwtStrategy(jwtOpts, jwtVerify))

export default {
  init: () => passport.initialize(),
  jwt: () => passport.authenticate('jwt', { session: false })
}

