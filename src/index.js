const express= require('express')
const mongoose=require('mongoose')
const route=require('./route/route')
const multer=require('multer')

const app=express()
app.use(express.json())
app.use(multer().any())
mongoose.set('strictQuery', true)
mongoose.connect('mongodb+srv://sarwjeet424:96568437528p@cluster0.8tsocgw.mongodb.net/group31Database',{useNewUrlParser:true})
.then(()=> console.log("MongoDB Connected"))
.catch((err)=> console.log(err))
let PORT = 3000 
app.listen(PORT, ()=>{
    console.log(`Connected on Port ${PORT}`)
})

app.use('/',route)
