import jwt from 'jsonwebtoken'

const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')
  const tokenParsed = req.headers.authorization.split(' ')[1]
  if (!token) return res.sendStatus(401)

  jwt.verify(tokenParsed, process.env.SECRET_KEY!, (err: any, user: any) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403)
    }
    req.user = user
    next()
  })
}

export default authenticateToken
