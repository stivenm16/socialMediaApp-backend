import jwt from 'jsonwebtoken'

const getToken = (req: any, res: any) => {
  const user = { id: 1, username: 'usuario1' }

  const accessToken = jwt.sign(user, process.env.SECRET_KEY!, {
    expiresIn: '30d',
  })
  res.json({ accessToken })
}

export default getToken
