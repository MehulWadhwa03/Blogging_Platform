require("dotenv").config()
const express = require('express')
const expressLayout=require('express-ejs-layouts')
const app = express()
const cookieParser = require('cookie-parser')
const MongoStore= require('connect-mongo')
const session=require('express-session')
const connectDB = require("./server/config/db")
const methodOverride = require('method-override')

const PORT=4000

//conect to db
connectDB()

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'))

app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    store:MongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    }),
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
}))

app.use(express.static('public'));



// templet engine
app.use(expressLayout)
app.set('layout','./layouts/main.ejs')
app.set('view engine','ejs')

app.use('/',require('./server/routes/main'))
app.use('/',require('./server/routes/admin'))
// app.use('/',require('./server/routes/users')) 


app.listen(PORT,()=>{
    console.log(`listining on port ${PORT}`)
})