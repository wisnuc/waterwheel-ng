import EventEmitter from 'events'
import path from 'path'

import jwt from 'jwt-simple'
import UUID from 'node-uuid'

import { tokenFromNas } from '../lib/channel'
import { secret }  from '../config/passportJwt'
import { openOrCreateCollectionAsync} from './collection'
import paths from '../lib/paths'


/**
 * ChannelModel collection->list
 * 
 * {
 *  channelToken,
 *  channelid,
 *  jobs:[],
 *  user
 * }
 * 
 * job
 * {
 *  jobid:uuid,
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

  createChannel(userToken, callback) {
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
      if(typeof channelToken !== 'string' || !channelToken.length)
        return callback(new Error('invalid channelToken'))
      let newChannel = {
          channelToken,
          channelid: uuid,
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

  //create new Job
  createJob(channelId, callback) {
    let channel =  this.collection.list.find(c => c.channelid === channelId)
    let newJob = {
      jobid: UUID.v4()
    }
    channel.jobs.push(newJob)
    this.collection.updateAsync(this.collection.list,this.collection.list).asCallback(err => {
        if(err) return callback(err)
        callback(null,newJob)
    })
  }

  //client update  nas update 
  updateJob(channelId, jobId, props, callback) {
    let channel =  this.collection.list.find(c => c.channelid === channelId)
    let job = channel.jobs.find(j => j.jobid === jobId)
    // TODO 
  }

  removeJob(channelId, jobId, callback){
    let channel = this.getChannel(channelId)
    if(channel == undefined) return callback(new Error('channel not find'))
    let index = channel.jobs.findIndex( item => item.jobid === jobId)
    if(index === -1) return callback(new Error('job not find'))
    channel.jobs.splice(index, 1)
    callback(null)
  }

  checkState(channelId, jobId){
    // TODO check state

  }



  getJob(channelId, jobId){
    let channel =  this.collection.list.find(c => c.channelid === channelId)
    let job = channel.jobs.find(j => j.jobid === jobId)
    return job
  }

  getChannel(channelId){
    return this.collection.list.find(c => c.channelid === channelId)
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
      return channelModel
    }
    return null
  }
}

const getChannelModelAsync = async () => {
  let channelPath = path.join(paths.get('channels'), 'channels.json')
  if(channelModel) return channelModel;
  else return await createChannelModelAsync(channelPath, paths.get('tmp'));
}

export { createChannelModel, createChannelModelAsync, getChannelModelAsync}