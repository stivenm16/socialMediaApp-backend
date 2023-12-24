import bcrypt from 'bcrypt'
import express, { Request, Response } from 'express'
import prisma from '../db/prisma'
import { User } from '../dto/user'
const userRouter = express.Router()

userRouter.get('/getAllUsers', async (req: Request, res: Response) => {
  try {
    const getAllUsers = await prisma.users.findMany()
    res.send(getAllUsers).status(200)
  } catch (error) {
    console.log(error)
  }
})
userRouter.post('/login', async (req: Request, res: Response) => {
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

    return res
      .status(200)
      .json({ message: 'Login successful', user: { email: userFound.email } })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

userRouter.post('/user', async (req: Request, res: Response) => {
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
})

export default userRouter
