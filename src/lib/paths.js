import path from 'path'
import mkdirp from 'mkdirp'
import Promise from 'bluebird'

import define from '../utils/define'

let root = undefined

const mkdirpAsync = Promise.promisify(mkdirp)

const join = (name) => path.join(root, name)

const setRootAsync = async (rootpath) => {
    if(!path.isAbsolute(rootpath))
        throw new Error('rootpath must be absolute path')
    
    root = rootpath
    await mkdirpAsync(root)
    await Promise.all([
        mkdirpAsync(join(define.tmp)),
        mkdirpAsync(join(define.channels)),
        mkdirpAsync(join(define.files))
    ])
}

const setRoot = (rootpath,callback) =>
    setRootAsync(rootpath)
        .then(r => callback(null,r))
        .catch(e => callback(e))

const getPath = (name) => {
    if(!root) throw new Error('root not set')
    switch(name){
        case define.files:
        case define.tmp:
        case define.channels:
            return join(name)
        case 'root':
            return root
        default:
            throw new Error('get undefined path :${name}')
    }
}

export default{setRoot,setRootAsync,get:getPath}