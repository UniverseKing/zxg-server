/**
 * router 只负责监听路由请求
 */
const express = require('express')
const router = express.Router()

const services = require('../controller')
const jwtAuth = require('../jwt/jwtauth')
const jwt = require('jsonwebtoken')
// 加密使用的key，是一个字符串
const secretKey = 'authorization'
// 使用jwt 校验中间件
router.use(jwtAuth)

// 解析文件上传的中间件
const multer = require('multer');

// 1、使用diskStorage定义保存的文件夹和文件名
let storage = multer.diskStorage({
    destination: 'upload', // 文件夹位置
    filename: (req, file, cb) => { // 文件名称
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// 2. 调用multer进行配置
const uploader = multer({
    storage: storage
})

// 可以监听到所有请求
router.use((err, req, res, next) => {
    
    // 1. 获取客户端传入的token
    const token = req.body['authorization'] || req.query['authorization'] || req.headers['authorization'];
    // 2. 校验token是否正确
    if (token) {
        // 3. 解码 token (验证 secret 和检查有效期（exp）)
        jwt.verify(token, secretKey, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: '无效的token.' });
            } else {
                req.decoded = decoded
                next()
            }
        });
    }else{
        res.json({
            status:0,
            message:'token不存在'
        })
    }
    // 2.1 如果token正确，调用next传入下一个路由
    // 2.2 如果token不正确,则说明用户登录异常
})

router.get('/home/sliders', services.gethomesliders)
router.get('/home/category', services.gethomecategory)
router.get('/home/floorlist', services.gethomefloorlist)
router.get('/product/list',services.getproductlist)
router.get('/product/detail',services.getproducdetail)
router.get('/product/recommend',services.getproductRecommend)
router.get('/category/data',services.getcategoryData)
router.post('/user/login',services.login)
router.post('/user/register',services.register)
router.get('/user/info',services.getUserInfo)
router.post('/cart/add',services.cartAdd)
router.get('/cart/list',services.cartList)
router.post('/cart/del',services.cartDelete)


module.exports = router