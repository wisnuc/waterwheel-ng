import EventEmitter from 'events'
import UUID from 'node-uuid'

class ChannelModel extends EventEmitter{
  constructor(collection){
    super()
    this.collection = collection
    this.hash = UUID.v4()
  }

  createUser(userToken,callback){
    const einval = (text) => 
      process.nextTick(callback, Object.assign(new Error(text), { code: 'EINVAL' }))
    const ebusy = (text) => 
      process.nextTick(callback, Object.assign(new Error(text), { code: 'EBUSY' })) 

    if(typeof userToken !== 'string' || !userToken.length)
      return einval('invalid avatar')
    let newChannel = {
      userToken,
      uuid: UUID.v4(),
      channelToken: ''  //TODO new CTK
    }

    // get response from NAS
     
  }


}