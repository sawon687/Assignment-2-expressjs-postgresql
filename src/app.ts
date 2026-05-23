import express, { type Request, type Response } from 'express'
import globalErrorHandler from './middleware/globalErrorHandle'
import { logger } from './middleware/logger'
import { authRoute } from './modules/auth/auth.route'
import cors from 'cors'
import { issuesRoute } from './modules/issues/issues.route'
const app = express()
app.use(express.json())
app.use(logger)
const corsOptions = {
  origin: 'http://localhost:8000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use('/api/auth',authRoute)
app.use('/api/issues',issuesRoute)

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')

})

app.use(globalErrorHandler)


export default app

