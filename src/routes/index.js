import login from './login'
import job from './job'

const routes = app => {
  app.use('/login', login)
  app.use('/job', job)



  app.use((req, res) => {
    console.log(req.url)
    if(!res.headersSent){
     res.writeHead(404,{'Content-Type':'text/html'})
     res.end()
    }
  })
}

export default routes 