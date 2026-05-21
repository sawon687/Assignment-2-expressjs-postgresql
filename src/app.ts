import express, { type Request, type Response } from 'express'
import globalErrorHandler from './middleware/globalErrorHandle'
import { logger } from './middleware/logger'
import { authRoute } from './modules/auth/auth.route'
const app = express()
app.use(express.json())
app.use(logger)
app.use('/api/auth',authRoute)
app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')

})

app.use(globalErrorHandler)


export default app

