import config from 'config-lite'
import {requestPost} from './netEngine'

   /**   nas response
     * {
     *   uuid: uuid
     *   user: encrypt(PBK, user-uuid),
     *   channelToken: encrypt(SSK, CTK) // for client to decode with PBK   
     * }
     */

const tokenFromNas = (props, callback) => {
  getAcceptFromNas(props).asCallback((err,res)=>{
    if(err) return callback(err)
    callback(null, res)
  })
}

export { tokenFromNas }

// take CTK ,userToken ,uuid to nas ,get ctk 
const getAcceptFromNas  = (props) => {
  return new Promise((resolve, reject)=>{
    requestPost(`${config.localNasIP}login/waterwheel`,null,props,(err,res) => {
      if(err) reject(err)
      resolve(res)
    })
  })
}
