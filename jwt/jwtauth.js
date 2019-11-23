const expressJwt = require("express-jwt");
// 加密使用的key，是一个字符串
const secretKey = 'authorization'
// express-jwt中间件帮我们自动做了token的验证以及错误处理，所以一般情况下我们按照格式书写就没问题，其中unless放的就是你想要不检验token的api。
const jwtAuth = expressJwt({ secret: secretKey }).unless({
    path:[
        '/api/home/sliders',
        '/api/home/category',
        '/api/home/floorlist',
        '/api/product/list',
        '/api/product/detail',
        '/api/category/data',
        '/api/user/login',
        '/api/user/register'
    ]
});

module.exports = jwtAuth;