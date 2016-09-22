/**
 * Created by Administrator on 2016/9/20.
 */
var koa = require('koa');
var bodyParse = require('koa-bodyparser');
var cors = require('koa-cors');
require('./middleware/connectMongo');
require('./middleware/connectRedis');
require('./middleware/wechatInit');
var router = require('./router/router');
var app = koa();
app.use(cors());
app.use(bodyParse());
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);
