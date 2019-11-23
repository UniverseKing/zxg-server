/**
 * services 负责处理业务逻辑
 */

// 导入操作数据库的函数
const db = require('../db')
const mock = require('../mock/mock.js')

const jwt = require('jsonwebtoken');
const secretKey = 'authorization'
/**
 * 获取轮播图数据
 */
const gethomesliders = (req, res) => {
    res.json({
        status: 0,
        msg: 'ok',
        data: mock.homeData.data.headList
    })
}

/**
 * 获取首页购物分类
 */
const gethomecategory = (req, res) => {
    res.json({
        status: 0,
        msg: 'ok',
        data: mock.homeData.data.categoryList
    })
}

/**
* 获取楼层数据
*/
const gethomefloorlist = (req, res) => {
    res.json({
        status: 0,
        msg: 'ok',
        data: mock.homeData.data.floorList
    })
}

/**
 * 获取商品列表
 */
const getproductlist = (req, res) => {
    const query = req.query
    // select * from table limit (start-1)*pageSize,pageSize;
    // select id,name,subtitle,imageHost,mainImage,price,originalPrice,stock from product ORDER BY price asc LIMIT 0,5
    let pageSize = query.pageSize
    let pageNum = query.pageNum

    let start = 0
    if (!(pageNum && pageSize)) {
        start = 0
        pageSize = 10
    } else {
        start = (pageNum - 1) * pageSize
    }
    let sql = `select id,name,subtitle,imageHost,mainImage,price,originalPrice,stock from product LIMIT 0,10`
    switch (query.orderBy) {
        case 'price_asc':
            sql = `select id,name,subtitle,imageHost,mainImage,price,originalPrice,stock from product ORDER BY price asc limit ${start},${pageSize}`
            break;
        case 'price_desc':
            sql = `select id,name,subtitle,imageHost,mainImage,price,originalPrice,stock from product ORDER BY price desc limit ${start},${pageSize}`
            break;
        default:
            sql = `select id,name,subtitle,imageHost,mainImage,price,originalPrice,stock from product limit ${start},${pageSize}`
    }

    db.base(sql, null, data => {
        res.json({
            status: 0,
            msg: 'ok',
            data: {
                pageNum: pageNum,
                pageSize: pageSize,
                orderBy: query.orderBy,
                list: data
            },
        })
    })
}


/**
 * 商品推荐
 */
const getproductRecommend = (req, res) => {
    const sql = 'SELECT * FROM product ORDER BY RAND() LIMIT 6'
    db.base(sql, null, data => {
        if (data.length > 0) {
            res.json({
                status: 0,
                msg: 'ok',
                data: data
            })
        } else {
            res.json({
                status: 0,
                msg: 'ok',
                data: []
            })
        }
    })
}

/**
 * 获取商品详情
 */
const getproducdetail = (req, res) => {
    const id = req.query.id
    const sql = 'select * from product WHERE id = ?'
    db.base(sql, [id], data => {
        res.json({
            status: 0,
            msg: 'ok',
            data: data[0]
        })
    })
}

/**
 * 获取分类
 */
const getcategoryData = (req, res) => {
    res.json({
        status: 0,
        msg: 'ok',
        data: mock.categoryData.data
    })
}

/**
 * 登录
 */
const login = (req, res) => {
    let body = req.body
    console.log(req.body)
    const sql = 'select * from users where username = ?'
    db.base(sql, [body.username], (data) => {
        if (data.length > 0) {
            const sql = 'select * from users where username = ? and password = ?'
            db.base(sql, [body.username, body.password], (result) => {
                if (result.length > 0) {
                    body.user_id = result[0].id;
                    let token = jwt.sign(body, secretKey, {
                        expiresIn: 60 * 60 * 24 // 授权时效24小时
                    });
                    res.json({
                        status: 0,
                        msg: 'ok',
                        data: {
                            token
                        }
                    })
                } else {
                    res.json({
                        status: -1,
                        msg: '密码错误',
                        data: null
                    })
                }
            })
        } else {
            res.json({
                status: -1,
                msg: '用户名错误',
                data: null
            })
        }
    })
}

/**
 * 注册
 */
const register = (req, res) => {
    const body = req.body
    const sql = 'select * from users where username = ?'
    db.base(sql, [body.username], data => {
        if (data.length > 0) {
            res.json({
                data: null,
                msg: '用户名已被注册',
                status: -1
            })
        } else {
            body.createtime = new Date()
            body.status = 1
            const sql = 'insert into users set ?'
            db.base(sql, body, result => {
                if (result.affectedRows == 1) {
                    res.json({
                        data: null,
                        status: 0,
                        message: '注册成功!'
                    })
                } else {
                    res.json({
                        data: null,
                        status: -1,
                        message: '注册失败!'
                    })
                }
            })
        }
    })
}

/**
 * 获取用户信息
 */
const getUserInfo = (req, res) => {
    const user_id = req.decoded.user_id
    const sql = 'select username,phone,email,avatar from users where id = ?'
    db.base(sql, [user_id], data => {
        if (data.length > 0) {
            res.json({
                data: data[0],
                msg: 'ok',
                status: 0
            })
        } else {
            res.json({
                data: null,
                msg: 'error',
                status: -1
            })
        }
    })
}


/**
 * 添加商品到购物车
 */
const cartAdd = (req, res) => {
    const user_id = req.decoded.user_id
    const body = req.body
    // 查询是否该用户已添加过该商品
    const sql = 'select * from cart where userId=? and productId=?'
    db.base(sql, [user_id, body.productId], data => {
        if (data.length > 0) {
            // 更新数量
            let count = data[0].count - 0 + (body.count - 0)
            const u_sql = 'update cart set count=? where id=?'
            db.base(u_sql, [count, data[0].id], result => {
                if (result.affectedRows == 1) {
                    res.json({
                        status: 0,
                        data: null,
                        msg: '更新ok'
                    })
                } else {
                    res.json({
                        status: -1,
                        data: null,
                        msg: 'error'
                    })
                }
            })
        } else {
            // 添加数据
            body.createtime = new Date()
            body.userId = user_id
            const i_sql = 'insert into cart set ?'
            db.base(i_sql, body, result => {
                if (result.affectedRows == 1) {
                    res.json({
                        status: 0,
                        data: null,
                        msg: '新增ok'
                    })
                } else {
                    res.json({
                        status: -1,
                        data: null,
                        msg: 'error'
                    })
                }
            })
        }
    })
}

/**
 * 获取购物车数据
 */
const cartList = (req, res) => {
    const user_id = req.decoded.user_id
    let carts = []
    let ids = []
    console.log(user_id)
    db.base(`select id,productId,count from cart where userId=${user_id} and status=1`, null, data => {
        if (data.length > 0) {
            carts = [...data]
            console.log(carts)
            ids = carts.map(v => v.productId)

            db.base(`select name,subtitle,imageHost,mainImage,price,createtime from product where id in(${ids.join()})`, null, result => {
                if (result.length > 0) {
                    console.log(result)
                    let list = carts.map((o, i) => { return { ...o, ...result[i] } })
                    res.json({
                        data: list,
                        status: 0,
                        msg: 'ok'
                    })
                } else {
                    res.json({
                        status: -1,
                        msg: 'error',
                        data: []
                    })
                }
            })

        } else {
            res.json({
                status: 0,
                msg: 'ok',
                data: []
            })
        }
    })
}

/**
 * 删除购物车数据
 */
const cartDelete = (req, res) => {
    const user_id = req.decoded.user_id
    const cartId = req.body.id

    db.base(`update cart set status=0 where userId=${user_id} and id=${cartId}`, null, data => {
        if (data.affectedRows > 0) {
            res.json({
                status: 0,
                msg: '删除成功',
                data: null
            })
        } else {
            res.json({
                status: -1,
                msg: '删除失败',
                data: null
            })
        }
    })
}

module.exports = {
    gethomesliders,
    gethomecategory,
    gethomefloorlist,
    getproductlist,
    getproducdetail,
    getcategoryData,
    login, register,
    getUserInfo,
    cartAdd,
    cartList,
    cartDelete,
    getproductRecommend
}