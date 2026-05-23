import express, { type Request, type Response } from 'express'
import { logger } from './middleware/logger'
import { authRoute } from './modules/auth/auth.route'
import { issuesRoute } from './modules/issues/issues.route'
import globalErrorHandle from './middleware/globalErrorHandle'

const app = express()
app.use(express.json())
app.use(logger)


app.use('/api/auth',authRoute)
app.use('/api/issues',issuesRoute)

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')

})

app.use(globalErrorHandle)


export default app

