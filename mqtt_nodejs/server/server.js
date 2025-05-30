const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs')

app.use(morgan('dev'))

readdirSync("./Routes")
.map((c)=> app.use('/api', require(`./Routes/${c}`)))

app.listen(3002, ()=> {console.log('Server run on port 3002')})