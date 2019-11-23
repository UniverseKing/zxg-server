const express = require('express')

const app = express()

// 1. 挂载解析参数的中间件
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// 设置允许cors跨域
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Authorization");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next()
})

// 2. 挂载路由模块
const router = require('./router')
app.use('/api',router)

// 3. 托管静态资源
app.use(express.static('./upload'))

app.get('/',(req,res)=>{
    res.send('ok')
})

app.listen(9527,()=>{
    console.log('http://127.0.0.1:9527')
})