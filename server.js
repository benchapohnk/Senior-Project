// Step import
const express = require('express')
const app = express()
const morgan = require('morgan')
const {readdirSync} = require('fs')
const cors = require('cors')

//const authRouter = require('./routes/auth')
//const categoryRouter = require('./routes/category')

// middleware
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

//app.use('/api',authRouter)
//app.use('/api',categoryRouter)


// // step3 router
// app.post('/api',(req,res)=>{
//     //code 
//     const { username,password }= req.body
//     console.log(username,password)
//     res.send('Hello')
// })
readdirSync('./routes')
.map((c)=> app.use('/api',require('./routes/'+c)) )




//Step2 Start Server
app.listen(5000,
    ()=> console.log('Server is running on port 5000'))