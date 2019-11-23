# Node第十天-express&mysql&模板引擎综合练习

## express中获取参数的几种形式
### 从URL地址中获取查询参数
通过 URL 地址栏中，? 形式传递的参数，可以直接通过 `req.query` 来获取；

```js
接口地址:http://127.0.0.1:8888/getarticleDetail?id=10
router.get('/getarticleDetail',(req,res)=>{
    // 获取方式:
    const id = req.query.id
})
```

### 从URL地址中获取路径参数
直接通过路径标识符来传递参数，`/userinfo/10/zs`， 可以通过 `req.params`来获取参数

```js
接口地址:http://127.0.0.1:8888/article/10
router.get('/article/:id',(req,res)=>{
    // 获取方式:
    const id = req.params.id
})
```

### 从post表单中获取提交的数据
+ 借助于`body-parser`来解析表单数据
+ `npm i body-parser -S`
+ `const bodyParser = require('body-parser')`
+ `app.use(bodyParser.urlencoded({ extended: false }))`

```js
接口地址:http://127.0.0.1:8888/article
router.post('/article',(req,res)=>{
    // 获取方式:
    const article = req.body
})
```

## Web 开发模式
### 混合模式（传统开发模式）
+ 以后端程序员为主，基本上不需要前端程序员，或者，前端程序员只负责画页面、美化样式、写JS特效，前端程序员不需要进行数据的交互；
+ 这种开发模式，在前几年比较常见；
+ 他们用的最多的是 Jquery + 模板引擎
+ 后端页面 .php   .jsp   .aspx   .cshtml
### 前后端分离（趋势）
+ 后端负责操作数据库、给前端暴露接口
+ 前端负责调用接口，渲染页面、前端就可以使用一些流行的前端框架 Vue， React， Angular

## Restful API

> 概念: 对**API**格式风格的一种定义,其主要表现为去掉传统的动词式**API**,而采用名词 + 请求方式来表示资源。

```js
传统的URL风格 动词 + 名词，大部分时候只会用GET和POST请求
http://localhost:3000/getHeros
http://localhost:3000/addHero
http://localhost:3000/editHero?id=1
http://localhost:3000/deleteHero?id=2

restful api 请求方式 + 名词
get     http://localhost:3000/heros  获取所有英雄
post    http://localhost:3000/heros/hero 添加英雄
get     http://localhost:3000/heros/hero/1 获取指定英雄信息
put     http://localhost:3000/heros/hero/1 修改指定英雄
delete  http://localhost:3000/heros/hero/2 删除指定英雄
```


## 综合案例-王者英雄增删改查

> 目标: 学习使用`express` + `mysql` + `ejs`开发后端渲染项目

![1572865847272](C:\Users\VULCAN\AppData\Roaming\Typora\typora-user-images\1572865847272.png)


### 需求分析

> 由于需要实现数据的真正增删改查，我们需要使用数据库和**express**框架。
>
> 此项目采用**传统开发模式**，即**后端渲染**，所以另外需要学习使用一个模板引擎**ejs**
>
> **技术栈: `express` + `mysql` + `ejs`+`body-parser`**

### 1. 接口设计

#### 数据库表

##### hero_category

| id   | category_name | category_descripition | category_state |
| ---- | ------------- | --------------------- | -------------- |
| 1    | 战士          | 挨最毒的打            | 1              |
| 2    | 刺客          | 抢最多的人头          | 1              |
| 3    | 辅助          | 背最冤枉的锅          | 1              |
| 4    | 射手          | 拿最多的钱            | 1              |
| 5    | 法师          | 买最贵的皮肤          | 1              |
| 6    | 坦克          | 上单不敢开的团我来开  | 1              |

##### hero_info

| id   | hero_name | hero_words               | category_id | hero_gender | hero_avatar | hero_state |
| ---- | --------- | ------------------------ | ----------- | ----------- | ----------- | :--------: |
| 1    | 吕布      | 我的貂蝉在哪里           | 1           | 男          |             |     1      |
| 2    | 韩信      | 你的脑袋里好像少了些什么 | 2           | 男          |             |     1      |
| 3    | 貂蝉      | 想欣赏妾身的舞姿吗       | 5           | 女          |             |     1      |
| 4    | 鲁班      | 检测到对面的智商了       | 4           | 男          |             |     1      |

#### 接口API

```json
// 操作成功返回的数据格式
{
    data:[],
    message:'获取英雄成功',
    status:1
}

// 操作失败
{
    data:[],
    message:'获取英雄失败',
    status:0
}
```

##### 获取英雄列表

> `/api/getheros`
>
> **无参数**

##### 插入新的英雄数据

> `/api/addhero`
>
> **请求体中传参**

| 参数        | 类型   | 要求 |
| ----------- | ------ | ---- |
| hero_name   | string | 必传 |
| hero_words  | string | 必传 |
| category_id | number | 必传 |
| hero_gender | string |      |
| hero_avatar | string |      |

##### 根据Id获取英雄信息

> `/api/gethero?id=1`
>
> **URL路径中传参**

##### 根据Id更新英雄数据

> `/api/edithero?id=1`
>
> **请求体中传参**

| 参数        | 类型   | 要求 |
| ----------- | ------ | ---- |
| hero_name   | string | 必传 |
| hero_words  | string | 必传 |
| category_id | number | 必传 |
| hero_gender | string |      |
| hero_avatar | string |      |

##### 根据Id软删除英雄数据

> `/api/deletehero?id=1`
>
> **URL路径中传参**

### 2. 服务端渲染页面

1. 安装 ejs 模板引擎` npm i ejs -S`
2. 使用 app.set() 配置默认的模板引擎 `app.set('view engine', 'ejs')`
3. 使用 app.set() 配置默认模板页面的存放路径 `app.set('views', './views')`
4. 使用 res.render() 来渲染模板页面`res.render('index.ejs', { 要渲染的数据对象 })`，注意，模板页面的 后缀名，可以省略不写！