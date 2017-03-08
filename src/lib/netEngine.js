import request from 'request'

const requestPost = (url, token, body, callback) => {

  let opts = { method: 'POST', url, body: JSON.stringify(body) } 
  if(typeof token !== 'string' || !token.length)
    opts.headers = { 
      Authorization: 'JWT ' + token,
      'Content-Type': 'application/json'
    }
  request(opts, (err, res) => {
    if (err) return callback(err)
    if (res.statusCode !== 200) {
      let e = new Error('http status code not 200')
      e.code = 'EHTTPSTATUS'
      e.status = res.statusCode
      return callback(e)
    }
    callback(null, res.body)
  })
}

export {requestPost}