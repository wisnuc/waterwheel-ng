import login from './login'

const routes = app => {
  app.use('/login',login)
  app.use((req,res)=>{
    console.log(req.url)
    if(!res.headersSent){
     res.writeHead(200,{'Content-Type':'text/html'})
     res.end()
    }
  })
}

export default routes 