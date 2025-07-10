// chai or code : backend series ep 2

require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/x', (req, res) => {
    res.send('hiiiiiiiii')
})

app.get('/x-html', (req, res) => {
    res.send('<h1>Hello world h1 </h1>')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
