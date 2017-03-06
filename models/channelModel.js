import EventEmitter from 'events'

import jwt from 'jwt-simple'
import UUID from 'node-uuid'

import { tokenFromNas } from '../lib/channel'
import { secret }  from '../config/passportJwt'
import { openOrCreateCollectionAsync} from './collection'


/**
 * ChannelModel collection->list
 * 
 * {
 *  channel,
 *  jobs:[],
 *  user
 * }
 * 
 * job
 * {
 *  job:uuid,
 *  user,
 *  req:{
 *    d:
 *    s:
 *    segments:[
 *      {
 *        sha256:
 *        size:
 *        status:
 *      },
 *      ...
 *    ]
 *  }  
 *  res:{
 *    d:
 *    s:
 *    //equal req 
 *  }
 * }
 */

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

    let channelUUID = UUID.v4()
    let params = {
      userToken,
      uuid: channelUUID,
      channelToken:jwt.encode({ uuid: channelUUID }, secret)
    }
    // get token from nas
    tokenFromNas(params, (err,res)=>{
      if(err) return callback(err)
      let { uuid, user, channelToken } = res
      if(typeof user !== 'string' || !user.length)
      return callback(new Error('invalid user'))
      if(typeof channelToken !== string || !channelToken.length)
        return callback(new Error('invalid channelToken'))
      let newChannel = {
          channelToken,
          channel: uuid,
          jobs: [],
          user
      }

      let list = this.collection.list
      this.collection.updateAsync(list, [...list, newChannel]).asCallback(err => {
        if (err) return callback(err)
        callback(null, newChannel)
      })
    })
  }

}

let channelModel = false

const createChannelModel = (filepath, tmpdir, callback) => 
  createChannelModelAsync(filepath, tmpdir).asCallback((err, result) => 
    callback(err, result))


const createChannelModelAsync = async (filepath, tmpfolder) => {
  if(channelModel)
    return channelModel
  else{
    let collection = await openOrCreateCollectionAsync(filepath, tmpfolder) 
    if (collection) {
      channelModel = new ChannelModel(collection)
      // console.log("channelModel:" + channelModel)
      return channelModel
    }
    return null
  }
  
}

export { createChannelModel, createChannelModelAsync }