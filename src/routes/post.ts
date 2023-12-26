import express, { Request, Response } from 'express'
import prisma from '../db/prisma.ts'
import { Post } from '../dto/post.ts'
import authenticateToken from '../middlewares/authJwt.ts'

const postRouter = express.Router()

postRouter.get(
  '/getAllPosts',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const getAllPosts = await prisma.posts.findMany()
      res.send(getAllPosts).status(200)
    } catch (error) {
      console.log(error)
    }
  },
)

postRouter.post(
  '/createPost',
  authenticateToken,
  async (req: Request, res: Response) => {
    const { title, content, userid }: Post = req.body

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
  },
)

postRouter.delete(
  '/deletePost/:postId',
  authenticateToken,
  async (req: Request, res: Response) => {
    const postId = req.params.postId

    const relatedLikes = await prisma.likest.findMany({
      where: {
        post_id: postId,
      },
    })

    // Delete all related likes
    await Promise.all(
      relatedLikes.map(async (like) => {
        await prisma.likest.delete({
          where: {
            id: like.id,
          },
        })
      }),
    )

    try {
      const deletedPost = await prisma.posts.delete({
        where: {
          id: postId,
        },
      })

      if (!deletedPost) {
        return res.status(404).json({ message: 'Post not found' })
      }

      res
        .status(200)
        .json({ message: 'Post deleted successfully', post: deletedPost })
    } catch (error) {
      console.error('Post deletion error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
)
postRouter.post(
  '/like/:postId',
  authenticateToken,
  async (req: Request, res: Response) => {
    const { postId: post_id } = req.params
    const { userId: user_id } = req.body

    try {
      const post = await prisma.posts.findUnique({
        where: {
          id: post_id,
        },
      })

      if (!post) {
        return res.status(404).json({ message: 'Post not found' })
      }

      // Verificar si el usuario ya le dio like al post
      const existingLike = await prisma.likest.findFirst({
        where: {
          post_id,
          user_id,
        },
      })

      if (existingLike) {
        // El usuario ya le dio like al post, entonces eliminar el like
        await prisma.likest.delete({
          where: {
            id: existingLike.id,
          },
        })

        // Disminuir el contador de likes del post
        await prisma.posts.update({
          where: {
            id: post_id,
          },
          data: {
            likes: {
              decrement: 1,
            },
          },
        })

        return res
          .status(200)
          .json({ message: 'Post unliked successfully', isLiked: false })
      } else {
        // El usuario no ha dado like al post, dar like
        await prisma.likest.create({
          data: {
            post_id,
            user_id,
          },
        })

        // Incrementar el contador de likes del post
        await prisma.posts.update({
          where: {
            id: post_id,
          },
          data: {
            likes: {
              increment: 1,
            },
          },
        })

        return res
          .status(200)
          .json({ message: 'Post liked successfully', isLiked: true })
      }
    } catch (error) {
      console.error('Like/unlike post error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
)

postRouter.put(
  '/updatePost/:postId',
  authenticateToken,
  async (req: Request, res: Response) => {
    const postId = req.params.postId
    const { title, content }: { title?: string; content?: string } = req.body

    try {
      const updatedPost = await prisma.posts.update({
        where: {
          id: postId,
        },
        data: {
          title,
          content,
        },
      })

      if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' })
      }

      res
        .status(200)
        .json({ message: 'Post updated successfully', post: updatedPost })
    } catch (error) {
      console.error('Post update error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
)

export default postRouter
