// index.ts
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import authRouter from './src/routes/getToken'
import userRouter from './src/routes/user'

const app = express()
dotenv.config()
app.use(express.json())
app.use(cors())
app.use('/api', authRouter)
app.use('/api', userRouter)

const PORT = process.env.PORT
app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
