import bcrypt from 'bcrypt'
import express, { Request, Response } from 'express'
import prisma from '../db/prisma.ts'
import { User } from '../dto/user.ts'
import { emailRegex } from '../validators/regex.ts'
import authenticateToken from '../middlewares/authJwt.ts'

const userRouter = express.Router()

userRouter.get(
  '/getAllUsers',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const getAllUsers = await prisma.users.findMany()
      res.send(getAllUsers).status(200)
    } catch (error) {
      console.log(error)
    }
  },
)

userRouter.get(
  '/getUserBy/:email',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.params
      console.log(email, '<------')

      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email parameter' })
      }

      const userFound = await prisma.users.findFirst({
        where: {
          email,
        },
      })
      if (!userFound) {
        return res.status(404).json({ message: 'User not found' })
      }
      return res.send(userFound).status(200)
    } catch (error) {
      console.log(error)
    }
  },
)

userRouter.post('/login', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { email, password }: User = await req.body.data

    const userFound = await prisma.users.findFirst({
      where: {
        email,
      },
    })

    if (!userFound) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, userFound.password!)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    return res.status(200).json({
      message: 'Login successful',
      user: { email: userFound.email, id: userFound.id },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

userRouter.post(
  '/user',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { fullname, age, email, password }: User = await req.body.data

      const userFound = await prisma.users.findFirst({
        where: {
          email,
        },
      })

      if (userFound) {
        return res.send('Email already exists')
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = await prisma.users.create({
        data: {
          fullname: fullname,
          age: age,
          email: email,
          password: hashedPassword,
        },
      })

      const { password: _, ...user } = newUser
      return res.send({ user })
    } catch (e) {
      console.log(e)
    }
  },
)

export default userRouter
