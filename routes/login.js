import { Router } from 'express'
const router = Router();

router.post('/', (req,res) => {
  res.write('TODO api')
  res.end()
})

router.get('/', (req,res) => {
  res.write('TODO api')
  res.end()
})

export default router