const routes = app => {
  app.use((req,res)=>{
    console.log(req.url)
    if(!res.headersSent){
     res.writeHead(200,{'Content-Type':'text/html'})
     res.end()
    }
  })
}

export default routes 