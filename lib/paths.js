import path from 'path'
import mkdirp from 'mkdirp'
import Promise from 'bluebird'

let root = undefined

const mkdirpAsync = Promise.promisify(mkdirp)

const join = (name) => path.join(root, name)

const setRootAsync = async (rootpath) => {
    if(!path.isAbsolute(rootpath))
        throw new Error('rootpath must be absolute path')
    
    root = rootpath
    await mkdirpAsync(root)
    await Promise.all([
        mkdirpAsync(join('tmp')),
        mkdirpAsync(join('channels')),
        mkdirpAsync(join('files'))
    ])
}

const setRoot = (rootpath,callback) =>
    setRootAsync(rootpath)
        .then(r => callback(null,r))
        .catch(e => callback(e))

const getPath = (name) => {
    if(!root) throw new Error('root not set')
    switch(name){
        case 'tmp':
        case 'channels':
        case 'files':
            return join(name)
        case 'root':
            return root
        default:
            throw new Error('get undefined path :${name}')
    }
}

export default{setRoot,setRootAsync,get:getPath}