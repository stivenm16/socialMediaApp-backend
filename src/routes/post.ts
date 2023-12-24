import express, { Request, Response } from 'express'
import prisma from '../db/prisma.ts'
import { Post } from '../dto/post.ts'

const postRouter = express.Router()

postRouter.get('/getAllPosts', async (req: Request, res: Response) => {
  try {
    const getAllPosts = await prisma.posts.findMany()
    res.send(getAllPosts).status(200)
  } catch (error) {
    console.log(error)
  }
})

postRouter.post('/createPost', async (req: Request, res: Response) => {
  const { title, content, userid }: Post = req.body.data

  try {
    const newPost = await prisma.posts.create({
      data: {
        title,
        content,
        userid,
      },
    })

    res
      .status(201)
      .json({ message: 'Post created successfully', post: newPost })
  } catch (error) {
    console.error('Post creation error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default postRouter
