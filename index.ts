// index.ts
import { createClient } from '@supabase/supabase-js'
import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
