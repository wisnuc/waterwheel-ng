import EventEmitter from 'events'

import jwt from 'jwt-simple'
import UUID from 'node-uuid'

import { tokenFromNas } from '../lib/channel'
import secret from '../config/passportJwt'
import { openOrCreateCollectionAsync} from './collection'

class ChannelModel extends EventEmitter{
  constructor(collection){
    super()
    this.collection = collection
    this.hash = UUID.v4()
  }

  createChannel(userToken,callback){
    const einval = (text) => 
      process.nextTick(callback, Object.assign(new Error(text), { code: 'EINVAL' }))
    const ebusy = (text) => 
      process.nextTick(callback, Object.assign(new Error(text), { code: 'EBUSY' })) 

    if(typeof userToken !== 'string' || !userToken.length)
      return einval('invalid avatar')
    
    let list = this.collection.list


    let channelUUID = UUID.v4()
    let params = {
      userToken,
      uuid: channelUUID,
      channelToken: jwt.encode({ channelUUID }, secret) 
    }
    // get response from NAS
    let info 
    try{ info =  tokenFromNas(params) }
    catch(e){
      console.log('获取NAS认证失败' + e)
      callback(e)
    }

    let { uuid, user, channelToken } = info
    if(typeof user !== 'string' || !user.length)
      return callback(einval('invalid user'))
    if(typeof channelToken !== string || !channelToken.length)
      return callback(einval('invalid channelToken'))
    let newChannel = {
        channel: uuid,
        jobs: [],
        user
    }

    let list = this.collection.list
    this.collection.updateAsync(list, [...list, newChannel]).asCallback(err => {
      if (err) return callback(err)
      callback(null, newChannel)
    })

  }

}

const createChannelModel = (filepath, tmpdir, callback) => 
  createChannelModelAsync(filepath, tmpdir).asCallback((err, result) => 
    callback(err, result))


const createChannelModelAsync = async (filepath, tmpfolder) => {

  let collection = await openOrCreateCollectionAsync(filepath, tmpfolder) 
  if (collection) {
    return new UserModel(collection)
  }
  return null
}

export { createChannelModel, createChannelModelAsync }