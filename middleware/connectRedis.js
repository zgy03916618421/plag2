/**
 * Created by Administrator on 2016/9/21.
 */
var redis = require('redis'),
    client = redis.createClient(6379,'192.168.100.2',{});
client.on('connect',function () {
    global.redis = client;
    console.log('connect redis  success!');
})