import express from 'express'
import getToken from '../controllers/jwt'
const authRouter = express.Router()

authRouter.get('/getToken', getToken)

export default authRouter
